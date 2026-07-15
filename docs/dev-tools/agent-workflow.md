# Agent Workflow

Operational guide for the autonomous-execution workflows. For the design rationale, label schema, cost bounds, and trade-offs, read [ADR-008](../adr/0008-autonomous-agent-execution.md) (issue → PR), [ADR-016](../adr/0016-autonomous-pr-review.md) (autonomous PR review), [ADR-017](../adr/0017-revert-to-claude-code.md) (provider and model policy), and [ADR-018](../adr/0018-two-stage-review.md) (two-stage review execution) first — this page does not restate them.

## When to use it

Use the agent flow when **all** of these are true:

- The PRD is locked — scope, acceptance criteria, file paths, anti-scope are explicit
- The change is at least one of: multi-file, repetitive, mechanical, or boring
- You can verify the result by reading the PR + a brief manual UI check (no novel UX decisions left to make)

Do **not** use it for:

- Exploratory work where the design is still moving
- Any change that needs you to feel the UX in `pnpm tauri:dev` while iterating
- Quick one-line fixes — faster to do yourself than label-and-wait

## Labels at a glance

Full schema and transition rules are in [ADR-008 → Label-based outcome tracking](../adr/0008-autonomous-agent-execution.md#label-based-outcome-tracking). Day-to-day usage:

- You add **`agent:ready`** to trigger a run.
- The workflow swaps labels to reflect outcome: **`agent:running`** → **`agent:success`** / **`agent:partial`** / **`agent:failed`**.

There is no escalation label anymore ([ADR-017](../adr/0017-revert-to-claude-code.md)): the author always runs on Sonnet, the reviewer always runs on Opus.

## End-to-end flow

```
[you write PRD with Claude Pro/Max]
        │
        ▼
[you label agent:ready]
        │
        ▼  (GitHub Actions: issues.labeled)
[workflow runs sandcastle with claudeCode(sonnet); agent iterates with `pnpm verify` as quality gate]
        │
        ├─ success → PR opened, label agent:success
        ├─ partial → PR opened as draft, label agent:partial
        └─ failed  → no PR, comment on issue with log excerpt, label agent:failed
        │
        ▼  (GitHub Actions: pull_request)
[vata-reviewer[bot]: Opus analyzes the diff (read-only) → decides what to fix]
        │
        ▼  (skipped entirely if nothing to fix)
[Sonnet implements the listed fixes verbatim, runs `pnpm verify` per fix]
        │
        ├─ fixed  → fixes pushed, comment summarising what was fixed and flagged
        ├─ clean  → no issues found, comment confirming the review ran
        ├─ flagged → no push, comment listing issues for you to judge
        └─ failed → review run errored, comment linking to logs
        │
        ▼
[you review the PR, manually verify UI in pnpm tauri:dev, merge]
```

## Retrying after a failure or partial

1. Open the issue. Read the comment the workflow posted.
2. Edit the issue body to clarify scope, acceptance criteria, or anti-scope.
3. Remove the previous outcome label (`agent:failed` / `agent:partial`).
4. Add `agent:ready`. The workflow re-runs.

The workflow does not auto-retry. Every run is intentional and paid for.

## Autonomous review

Every open, non-draft agent PR is automatically reviewed by `vata-reviewer[bot]`, in two stages ([ADR-018](../adr/0018-two-stage-review.md)): Opus analyzes the PR diff against the original issue spec and `CLAUDE.md` and decides what needs fixing (read-only, no edits); Sonnet then implements exactly those fixes — it does not re-review or challenge Opus's judgment. Anything subjective or uncertain is flagged for you to judge instead of auto-fixed.

How it works:

1. `vata-agent[bot]` opens the PR.
2. `agent-review.yml` fires on `pull_request` events (`opened`, `synchronize`, `reopened`, `ready_for_review`).
3. **Analyze (Opus)**: reads the diff, emits a list of high-confidence fixes (each precise enough to implement without further judgment) plus anything flagged for you.
4. **Fix (Sonnet)** — only runs if there is at least one fix to apply: implements each fix verbatim, one stacked commit per fix, running `pnpm verify` after each. A fix that can't be made to pass verify is reverted and reported as not applied, not re-interpreted.
5. Fixes are pushed only if `pnpm verify` stays green. A single PR comment explains the outcome:
   - **fixed** — ✅ Reviewed, fixed N issue(s), each fix linked to its SHA
   - **clean** — ✅ Reviewed — no issues found (Sonnet never ran)
   - **flagged** — ⚠️ Found issues, couldn't safely fix — list for you to judge
   - **failed** — ❌ Review failed — link to logs

Notes:

- Draft PRs are skipped until marked ready for review.
- The reviewer's own pushes are ignored (the sender is `vata-reviewer[bot]`), so there is no infinite review loop.
- A newer commit cancels the in-flight review and restarts it on the fresh state.
- The fix stage is skipped entirely when there's nothing to fix — a clean or flag-only review costs one Opus run, not two.
- The reviewer only runs on agent-authored PRs (`vata-agent[bot]`).
- Each review run draws from the same Anthropic API spend as issue runs.

## What stays manual

- Writing the PRD (Claude Pro/Max / `to-prd` / `grill-with-docs`)
- Setting the initial label `agent:ready`
- Reviewing the PR — code _and_ UI in `pnpm tauri:dev`
- Resolving review threads after the agent addresses them
- Merging
- Amending the PRD on retry

The workflow's job is the boring middle: read, execute, check, package as a PR. Your job is the ends.

## Setup checklist (one-time)

1. Create the 5 labels in the repo:

   ```bash
   gh label create "agent:ready"     --color "0E8A16" --description "PRD ready, agent will pick up"
   gh label create "agent:running"   --color "FBCA04" --description "Agent currently running in CI"
   gh label create "agent:success"   --color "0E8A16" --description "Agent succeeded, PR opened"
   gh label create "agent:partial"   --color "D93F0B" --description "Agent ran out of iterations but CI green — review needed"
   gh label create "agent:failed"    --color "B60205" --description "Agent failed, see issue comment for details"
   ```

2. Store a dedicated Anthropic API key as repo secret `ANTHROPIC_API_KEY`, with a monthly spend limit set in the Anthropic Console. Keep it separate from any interactive/subscription credentials so CI spend is attributable and revocable on its own.
3. Create a GitHub App (`vata-agent`) on the org with **Contents: Read and write**, **Pull requests: Read and write**, **Issues: Read and write** (webhook disabled). Install it on this repo. The workflow mints a token from it instead of `GITHUB_TOKEN` so the agent's PR triggers `ci.yml`, and instead of a PAT so all activity is attributed to `vata-agent[bot]` rather than a person. Store as repo secrets:
   - `AGENT_APP_CLIENT_ID` — the App's Client ID (App settings → General → About)
   - `AGENT_APP_PRIVATE_KEY` — the full contents of the App's generated `.pem` private key
4. Create a second GitHub App (`vata-reviewer`) on the org with **Contents: Read and write**, **Pull requests: Read and write** (webhook disabled). Install it on this repo. This App is the reviewer identity; its pushes are skipped by the review trigger, preventing infinite loops. Store as repo secrets:
   - `REVIEWER_APP_CLIENT_ID` — the App's Client ID
   - `REVIEWER_APP_PRIVATE_KEY` — the full contents of the App's generated `.pem` private key
5. Confirm `.sandcastle/run.ts`, `.sandcastle/review.ts`, and the prompt files under `.sandcastle/prompts/` are present.
6. Confirm `.github/workflows/agent-run.yml` and `.github/workflows/agent-review.yml` are present.
7. Dry-test on a small `Task`-type issue (rename, doc fix) before pointing it at anything substantive.

## Limits and known issues

- **No UI verification in CI.** A green pipeline does not mean the feature works visually. Manual QA in `pnpm tauri:dev` is non-optional.
- **Out-of-scope edits.** The agent may touch files outside the PRD's scope. Review the diff for unexpected churn before merging.
- **Stuck `agent:running`.** If a job dies without cleanup (rare), the label may stay on. Remove it manually and re-label `agent:ready` to restart.
- **Vendor lock on `@ai-hero/sandcastle`.** A future major version could require migrating the `.sandcastle/` scripts. Pin the version in `package.json` until a deliberate upgrade.
- **Reviewer cannot run until the `vata-reviewer` App and its secrets exist.** Until then, `agent-review.yml` will fail at the token-generation step.
- **Review quality is model-bounded.** The reviewer shares the same model family as the author agent, so it has overlapping blind spots. Manual QA remains the final gate.
