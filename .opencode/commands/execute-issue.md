---
description: Execute a GitHub issue end-to-end in a dedicated worktree
agent: execute-issue
---

Execute issue #$ARGUMENTS.

Optional flags:
- Append `--force` to bypass the "Blocked by" dependency check.

The subagent will:
1. Create a worktree `../vata-issue-<N>` from main
2. Verify dependencies (unless --force)
3. Fetch the issue spec
4. Implement end-to-end, delegating to test-writer / code-reviewer / design-system-expert / docs-consistency as needed
5. Run tests, tsc, eslint
6. Apply /simplify
7. Commit and push `feat/issue-<N>`
8. Print a final report with acceptance-criteria checklist + PR template

You (the human) review the report and open the PR manually.