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

# When you're done

When `pnpm verify` is green and the change matches the issue body:

Emit `<promise>COMPLETE</promise>` on its own line.

Do not emit this signal under any other condition.
