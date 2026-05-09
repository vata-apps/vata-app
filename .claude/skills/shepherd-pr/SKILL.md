---
name: shepherd-pr
description: Drive a freshly opened PR through the local `/review` gate, the ready-flip, CI, and CodeRabbit until the bot posts an APPROVED review with all non-Chromatic checks green. Use immediately after `gh pr create` (or `/commit-push-pr`) returns, or when the user says things like "watch the PR", "wait for CodeRabbit", "make sure CI passes", "shepherd PR #N". Polls check status, parses CodeRabbit's rate-limit messages, retriggers stalled reviews, triages inline threads (fix-and-push vs reply-and-resolve), and stops when approval arrives or a real blocker needs the user.
---

# Shepherd PR

Takes a freshly opened PR from "just pushed" to "CodeRabbit-approved" without manual polling. Backed by `gh` CLI + GraphQL — no MCP, no API key.

The skill runs **after** PR creation. Pre-PR cleanup belongs to `/simplify`.

---

## When to invoke

- Right after `gh pr create --draft` (or `/commit-push-pr`) returns a PR URL.
- When the user says "watch PR #N", "wait for CodeRabbit", "shepherd this", "make sure CI passes".

Do **not** invoke before a PR exists. Do not invoke for `/simplify` (that's the pre-PR cleanup, separate skill).

---

## The loop at a glance

```text
draft PR
  → Phase 0: /review locally → fixes → gh pr ready
  → Phase 1: wait CI (ignore Chromatic baseline gates)
  → Phase 2: read CodeRabbit verdict
       ├─ APPROVED       → done
       ├─ CHANGES_REQ.   → Phase 3 (triage)
       └─ rate-limited   → wait + retrigger, loop
  → Phase 3: triage threads (fix-and-push OR reply-and-resolve)
  → Phase 4: retrigger CodeRabbit, loop back to Phase 1
```

---

## Phase 0 — Draft + local `/review` gate

Runs immediately after the PR is created, **before any polling and before CodeRabbit is allowed to fire**. The whole point is to land at a clean state before flipping the PR to ready.

### 1. Confirm draft state

```bash
gh pr view <N> --repo vata-apps/vata-app --json isDraft
```

If `isDraft` is `false`, mark it back to draft:

```bash
gh pr ready <N> --repo vata-apps/vata-app --undo
```

The draft state holds CodeRabbit off — its workflow skips drafts, so we don't burn the hourly per-developer rate-limit budget on a review we're about to invalidate.

### 2. Run `/review`

Invoke the `/review` slash command. It performs a local AI review of the branch diff, distinct from CodeRabbit's later automatic pass.

### 3. Apply real findings only

Same triage table as Phase 3 below — fix-and-push for genuine bugs, ignore for nits / false positives / suggestions that contradict project rules. Bundle fixes into one or two follow-up commits.

### 4. Flip to ready

Once `/review` is clean:

```bash
gh pr ready <N> --repo vata-apps/vata-app
```

This is the explicit handoff to CodeRabbit. From here CI also begins to matter — proceed to Phase 1.

---

## Phase 1 — Wait for CI checks to settle

Use the `Monitor` tool with the canonical poll:

```bash
gh pr checks <N> --repo vata-apps/vata-app --json name,bucket
```

Three of the checks come from Chromatic, and they're **not** all the same thing — don't conflate them:

- `Visual review` is the Chromatic build job. It runs `exitZeroOnChanges: true`, so it almost always reaches `pass`. **Required green.**
- `Storybook Publish` is the static deploy of the Storybook bundle. **Required green.**
- `UI Review` and `UI Tests` are Chromatic's baseline-approval gates. They stay `pending` until the user approves baselines manually in the Chromatic dashboard, on a separate cadence. **Expected-pending — ignore.**

Required-green checks (must reach `pass` before declaring success): `Lint, Format, Build & Test`, `Visual review`, `CodeRabbit`, `Storybook Publish`.

If `Lint, Format, Build & Test` fails, fix the failure (lint, types, broken test), push, and re-enter Phase 1. Do not move on while it's red.

---

## Phase 2 — Read CodeRabbit's verdict

```bash
gh pr view <N> --repo vata-apps/vata-app --json reviews \
  | jq '[.reviews[] | select(.author.login=="coderabbitai")] | last | {state, at: .submittedAt}'
```

Three mutually exclusive states:

### Approved

`state == APPROVED`. All non-Chromatic checks green. **Done — exit and hand back to the user.**

### Changes requested

`state == CHANGES_REQUESTED`. Go to Phase 3.

### No review yet despite `CodeRabbit: pass` check

The check status reflects the bot's workflow finishing, not a posted review. Scan issue-level comments for the literal string `Rate limit exceeded`:

```bash
gh api repos/vata-apps/vata-app/issues/<N>/comments \
  | jq '.[] | select(.body | contains("Rate limit exceeded")) | .body' \
  | head -c 500
```

The bot tells you exactly how long to wait — `Please wait X minutes and Y seconds`. Schedule a wakeup ~2 minutes past that, then post:

```bash
gh pr comment <N> --repo vata-apps/vata-app --body "@coderabbitai full review"
```

Re-enter Phase 1. If after one full retrigger CodeRabbit still hasn't posted a review, push a one-line nudge commit (e.g., a clarifying inline comment in the diff). The push triggers a fresh review path that the comment-only retrigger sometimes misses.

---

## Phase 3 — Triage inline threads

List inline review comments:

```bash
gh api repos/vata-apps/vata-app/pulls/<N>/comments \
  | jq '.[] | {id, path, line, body: .body[0:300]}'
```

For each comment, decide:

| Finding type                                                  | Action                                                                                                                                            |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Real bug or genuine quality fix                               | Apply in code, run `pnpm lint && pnpm tsc --noEmit`, push commit. CodeRabbit auto-resolves the thread on next review.                             |
| False positive / nit / suggestion contradicting project rules | Reply with reasoning via `gh api repos/.../pulls/<N>/comments/<id>/replies`, then resolve via GraphQL `resolveReviewThread`. **Don't push code.** |

### Canonical contradiction (memorise)

CodeRabbit periodically suggests surfacing `err.message` directly to end users. The project's `# English Only` / i18n rule (CLAUDE.md) forbids hardcoded English in client-facing strings — raw Tauri/parser/DB errors are not localized. **Resolution:** reply with a one-sentence pointer to the i18n rule (and to the precedent on PR #118), resolve the thread, leave the localized `errorGeneric` in place. Do not change code.

### Resolving a thread

Find the unresolved thread IDs:

```bash
gh api graphql -f query='
{
  repository(owner: "vata-apps", name: "vata-app") {
    pullRequest(number: <N>) {
      reviewThreads(first: 20) {
        nodes {
          id
          isResolved
          comments(first: 1) { nodes { databaseId path line } }
        }
      }
    }
  }
}'
```

Reply on the inline comment:

```bash
gh api repos/vata-apps/vata-app/pulls/<N>/comments/<comment_id>/replies \
  -X POST -f body="<reasoning>"
```

Then resolve:

```bash
gh api graphql -f query='mutation{resolveReviewThread(input:{threadId:"<thread_id>"}){thread{id isResolved}}}'
```

---

## Phase 4 — Retrigger and re-poll

After pushing a fix or resolving threads-only, post:

```bash
gh pr comment <N> --repo vata-apps/vata-app --body "@coderabbitai full review"
```

A push alone also retriggers, but the explicit comment is more reliable when the only change was thread resolution.

If rate-limited again, loop back to the wait-then-retrigger logic from Phase 2.

---

## Pre-merge checks (CodeRabbit's top-level review)

CodeRabbit's review body lists named pre-merge checks. Most pass automatically when the PR follows the standard template (Title, Description, Linked Issues, Out-of-Scope). The one that bites in this repo:

- **Docstring Coverage ≥ 80 %**. Below threshold renders as a warning (`⚠️`), but a warning is enough to block approval. **Mitigation:** when shipping a multi-component file, proactively docstring every new helper / sub-component / non-trivial function. PR #118 hit this and needed a follow-up commit; PR #120 cleared it on the first pass after this rule was internalised.

---

## Stop conditions

1. CodeRabbit's latest review is `APPROVED` AND all non-Chromatic checks are `pass`. → success, hand back to the user.
2. Two consecutive rate-limit retriggers fail to produce a new review. → escalate with a one-line summary.
3. A finding requires user judgment (e.g., an architectural disagreement, a backwards-compat call, or a security-sensitive trade-off). → escalate with a one-paragraph summary.

The user merges. This skill never runs `gh pr merge`.

---

## What this skill must not do

- Auto-merge the PR. Chromatic baselines may still be pending; the user owns merge.
- Override the `Closes #N` footer from `link-task` Phase B.
- Apply CodeRabbit suggestions blindly — every thread goes through the triage table.
- Push to `main` or any branch other than the PR's own.
- Skip `pnpm lint && pnpm tsc --noEmit` after applying a CR fix before pushing.
- Flip the PR to ready before Phase 0 (`/review`) is clean — premature `gh pr ready` wakes CodeRabbit on a state we're still cleaning up and burns rate-limit budget.

---

## Useful commands (cheat sheet)

```bash
# Confirm draft state (Phase 0 entry)
gh pr view <N> --repo vata-apps/vata-app --json isDraft

# Flip to ready once /review is clean (Phase 0 exit)
gh pr ready <N> --repo vata-apps/vata-app

# Settled-state CI check (excluding the expected-pending Chromatic
# baseline gates `UI Review` and `UI Tests` — the build/deploy
# Chromatic jobs `Visual review` and `Storybook Publish` stay in)
gh pr checks <N> --repo vata-apps/vata-app --json name,bucket \
  | jq '[.[] | select(.name|test("UI Review|UI Tests")|not)]'

# Latest CodeRabbit review state
gh pr view <N> --repo vata-apps/vata-app --json reviews \
  | jq '[.reviews[] | select(.author.login=="coderabbitai")] | last | {state, at: .submittedAt}'

# Inline review comments
gh api repos/vata-apps/vata-app/pulls/<N>/comments

# Reply on an inline thread
gh api repos/vata-apps/vata-app/pulls/<N>/comments/<comment_id>/replies \
  -X POST -f body="<reasoning>"

# Resolve an inline thread
gh api graphql -f query='mutation{resolveReviewThread(input:{threadId:"<id>"}){thread{id isResolved}}}'

# Find unresolved thread IDs + their first comment
gh api graphql -f query='{repository(owner:"vata-apps",name:"vata-app"){pullRequest(number:<N>){reviewThreads(first:20){nodes{id isResolved comments(first:1){nodes{databaseId path line}}}}}}}'

# Retrigger CR after rate-limit
gh pr comment <N> --repo vata-apps/vata-app --body "@coderabbitai full review"
```

---

## Edge cases

- **PR opened against a non-`main` base.** Same skill applies; `gh pr` operations don't care about the base branch.
- **CI failure not in the named-green list.** If a workflow not in the required list fails (e.g., a one-off `Codecov` job), report the failure to the user and pause — don't silently skip it.
- **Repo (`vata-apps/vata-app`) is hardcoded.** Same convention as `link-task`. This skill lives in the Vata repo; cross-repo use needs a different skill.
- **Forked PR / contributor without write access.** This skill runs as the PR author. If CodeRabbit insists on changes the agent cannot make (e.g., labels, milestones), escalate.
- **CodeRabbit posts a `COMMENTED` review after `APPROVED`.** Don't panic — `COMMENTED` is informational and does not dismiss `APPROVED`. Treat the latest non-`COMMENTED` CodeRabbit review as the verdict.
