# Task

You are addressing review feedback on an existing pull request in the Vata repository (a Tauri + React + TypeScript + SQLite genealogy desktop app).

PR **#{{PR_NUMBER}}** implements GitHub issue **#{{ISSUE_NUMBER}}** — its branch is already checked out. The maintainer has reviewed the PR and requested changes. Your job is to address that feedback with new commits on this branch.

## Original issue (the spec)

**{{ISSUE_TITLE}}**

{{ISSUE_BODY}}

## Review summary

{{REVIEW_BODY}}

## Line comments

Each block below is one review comment, with its `id`, location, the diff hunk it is anchored to, and the maintainer's text.

{{LINE_COMMENTS}}

# How to work

Read `CLAUDE.md` at the repo root **before doing anything** — it defines all project conventions (architecture, i18n, DB rules, scope discipline, conventional commits). Treat its content as binding; do not restate or override it.

The PR's branch is checked out — the code you previously wrote is in front of you. Use `git diff main...HEAD` to see what the PR currently contains.

Address each piece of feedback:

- If a comment asks for a change you agree with, make it.
- If a comment **contradicts the original issue spec, is out of scope, or is factually wrong**, do not make the change — you will record it as skipped with a reason. Disagreeing is allowed; ignoring silently is not.

Commit your changes with conventional commit messages. You may group related fixes into one commit.

# Quality gate

After each change, run the validation suite and fix anything it breaks:

```bash
pnpm verify
```

This runs `pnpm lint`, `pnpm format:check`, `pnpm build`, and `pnpm vitest run` in sequence. Do not signal completion until `pnpm verify` is green.

# Environment-specific constraints

These are particular to this CI run and are **not** in `CLAUDE.md`:

- The Tauri desktop app cannot be launched here (no display server). `pnpm tauri:dev` / `pnpm tauri:build` are unavailable. UI verification is performed manually by the maintainer.
- Do not modify anything under `.sandcastle/` or `.github/workflows/` unless the review explicitly asks for it.

# Before completing

You **must** emit two blocks before the completion signal.

**1. Per-comment replies** — a JSON array, one entry per line comment above, wrapped in `<review-replies>` tags. For each comment use the `id` shown in its block. `sha` is the short commit hash that addressed it, or `null` if you skipped it; `note` is one concise sentence.

```
<review-replies>
[
  { "id": 123456, "sha": "abc1234", "note": "switched to the existing formatDate helper" },
  { "id": 789012, "sha": null, "note": "out of scope — the issue spec explicitly excludes this" }
]
</review-replies>
```

**2. A brief summary** — wrapped in `<review-summary>` tags. One or two sentences, no headings, no bullet lists. Cover only the review's _summary-level_ feedback (the review body) and anything cross-cutting the maintainer should know on re-review — the per-comment work is already covered by the replies above, so do not restate it. If there was nothing beyond the line comments, a single sentence is correct. Match the length of the summary to the size of the change.

```
<review-summary>
Switched the debug-drawer copy to i18n keys as requested; no changes beyond the inline comments.
</review-summary>
```

# When you're done

When all of these are true:

1. `pnpm verify` is green on the final state of the branch
2. Every line comment is either addressed or recorded as skipped with a reason
3. All changes are committed (`git status` clean)
4. You have emitted both the `<review-replies>` and `<review-summary>` blocks

Then — and only then — emit `<promise>COMPLETE</promise>` on its own line.

Do not emit this signal under any other condition.
