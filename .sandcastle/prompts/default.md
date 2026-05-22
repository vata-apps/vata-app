# Task

GitHub issue #{{ISSUE_NUMBER}}: **{{ISSUE_TITLE}}**

{{ISSUE_URL}}

## Issue body

{{ISSUE_BODY}}

# How to work

Read `CLAUDE.md` at the repo root **before doing anything**. It defines all project conventions — architecture, path aliases, i18n, DB rules, scope discipline, conventional commits, the "bug fixes — root cause first" rule. Treat its content as binding; do not restate or override it.

Then plan briefly and implement the change described in the issue body.

# Quality gate

After each change, run the validation suite and fix anything it breaks:

```bash
pnpm verify
```

This runs `pnpm lint`, `pnpm format:check`, `pnpm build`, and `pnpm vitest run` in sequence. Do not signal completion until `pnpm verify` is green on the final state of the branch.

# Environment-specific constraints

These are particular to this CI run and are **not** in `CLAUDE.md`:

- The Tauri desktop app cannot be launched here (no display server). `pnpm tauri:dev` / `pnpm tauri:build` are unavailable. UI verification is performed manually by the maintainer after you finish.
- Do not modify anything under `.sandcastle/` or `.github/workflows/agent-run.yml` unless the issue is explicitly about the agent workflow itself.

# Commit before completing

You **must commit your changes** with `git add` + `git commit` before signaling completion. Sandcastle collects commits from the branch — uncommitted edits are lost. Make one or more commits with conventional commit messages (`feat:`, `fix:`, `refactor:`, …) as described in `CLAUDE.md`. After committing, confirm `git status` shows a clean working tree.

# Pull request description

Before signaling completion, write a pull request description and wrap it in `<pr-description>` tags so the workflow can extract it. Example shape:

```
<pr-description>
## Summary

- Concise bullet points: what changed and why

## Notes for the reviewer

Trade-offs, follow-ups, or areas that need extra scrutiny. Omit this section if there is nothing useful to say.
</pr-description>
```

Write it in markdown. Do **not** include a `Closes #` line — the workflow adds that. Focus on what a reviewer needs to know, not a blow-by-blow of every edit.

# When you're done

When all of these are true:

1. `pnpm verify` is green on the final state of the branch
2. The change matches the issue body
3. `git status` shows no uncommitted changes (everything is committed)
4. You have emitted the `<pr-description>` block

Then — and only then — emit `<promise>COMPLETE</promise>` on its own line.

Do not emit this signal under any other condition.
