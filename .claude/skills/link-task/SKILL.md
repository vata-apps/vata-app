---
name: link-task
description: Search GitHub for an existing issue matching the current dev task and link it so the resulting PR auto-closes it at merge. Use at the START of a new development task — typically right after the user answers "simple branch or worktree?" and before any code changes begin (triggers like "let's implement X", "on travaille sur Y", "add a feature for Z", "fix bug W", "commençons sur X"). Also use just before creating a PR to inject the magic word `Closes #N` into the description.
---

# Link Task

Bridges a Vata development task with a GitHub issue so the PR auto-closes the right issue at merge. Backed by the `gh` CLI — no MCP, no API key.

There are two phases. Run **Phase A** when starting a task. Run **Phase B** when creating a PR. They share state via `git config branch.<branch>.ghIssue`.

---

## Phase A — Find and link an issue (task start)

Run this immediately after the worktree/branch is decided and named, **before** any code changes.

### 1. Compose search queries

From the user's task description, build 1–3 short search queries. Examples:

- _"add a CSV export of the individuals list"_ → queries: `csv export`, `export individuals`
- _"fix duplicate import bug"_ → queries: `duplicate import`, `gedcom duplicates`
- _"refactor the places query"_ → queries: `places query`, `place performance`

### 2. Search GitHub Issues

For each query, run:

```bash
gh issue list --search "<query> in:title,body" --state open --limit 10 \
  --json number,title,state,labels,issueType,updatedAt
```

Don't pass `--repo` — `gh` infers it from the cwd's git remote. The `issueType` field returns the org-level type (`{ name: "Bug" }`, etc.) when set, otherwise an empty value.

Stop once you have 5–10 candidate issues across all queries — don't enumerate the entire backlog.

### 3. Present candidates

If 1+ candidates found: show up to 5, sorted by `updatedAt` desc, with `#<number> · <type> · <state> · <title>` (use `—` for the type column when `issueType` is empty; include labels in parens if any). Ask the user **one** of:

> "Which issue is this work for? **#12**, **#34**, **none of these (create new)**, or **no link**?"

Keep the message short. Don't paraphrase or comment.

If 0 candidates found: ask once:

> "No matching open issue found. Want me to create a new one (delegates to `capture-idea`), or skip the link for this task?"

### 4. Persist the link

Once the user picks an issue (or you create one via `capture-idea`):

```bash
git config branch."$(git branch --show-current)".ghIssue <number>
```

If the user picks "no link", do nothing — silent skip. Don't ask again later in the same session.

### 5. Confirm

Tell the user in one sentence which issue is linked, e.g. _"Linked to #42 — will auto-close at PR merge."_ Then proceed to the actual task.

---

## Phase B — Inject the magic word (PR creation)

Run this whenever you're about to call `gh pr create` (directly, via `/commit-push-pr`, or any other path).

### 1. Read the link

```bash
git config branch."$(git branch --show-current)".ghIssue 2>/dev/null
```

If the value is empty, no link exists for this branch. **Do not search GitHub at PR time** — Phase A is the only entry point for that. Just create the PR without a magic word.

### 2. Inject the magic word

If the value is `<N>`, ensure the PR description body ends with a footer line:

```
Closes #N
```

Use `Closes` as the default — it auto-closes the issue at merge. Use `Refs #N` instead only if the user explicitly says "this only partially addresses the issue" or "don't close it yet".

If the PR description was authored by another skill (e.g., `commit-push-pr`), append the footer; don't rewrite the rest.

### 3. No prompt

Don't ask the user to confirm the magic word — Phase A was the explicit-consent step.

---

## Edge cases

- **Branch already has commits before Phase A runs.** Still proceed — the ID lives in git config, not in commit messages, so existing commits don't need rewriting.
- **User changes the linked issue mid-task.** Re-run Phase A — `git config` overwrites cleanly.
- **Worktree on a detached HEAD.** Skip silently — `git branch --show-current` returns empty.
- **`gh` not authenticated.** Tell the user once to run `gh auth login`, then skip Phase A. Phase B becomes a no-op.
- **No open issues at all in the repo.** Phase A still runs — the agent jumps to "no candidates" and offers to create.

## What this skill must not do

- Auto-pick an issue without user confirmation (Phase A always asks)
- Search GitHub at PR time (Phase A is the only search entry point)
- Modify branch names to include the issue number — that's a separate stylistic choice the user hasn't requested
- Amend or rewrite existing commit messages
- Create an issue itself — delegate to `capture-idea` if the user wants a new one
- Change the issue's state from this skill — let the `Closes` magic word handle it at merge time
- Hardcode the repo — always rely on `gh` inferring from cwd
