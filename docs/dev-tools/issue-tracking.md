# Issue Tracking with GitHub Issues

Single backlog for everything — bugs, ideas, tasks. Two skills wrap the `gh` CLI so capture and linking stay near-zero-friction from a Claude Code session.

- **`capture-idea`** — file a future idea as a GitHub issue with appropriate label(s)
- **`link-task`** — connect the current dev task to an existing issue so the PR auto-closes it at merge

No MCP, no API key, no extra setup — `gh auth login` is the only requirement, and you've already done it if `gh` works.

---

## Capturing ideas — `capture-idea`

Just say it in chat. The skill (defined at `.claude/skills/capture-idea/SKILL.md`) activates on phrases like:

- "à faire plus tard", "faire plus tard", "note pour plus tard"
- "ne pas oublier", "garder pour plus tard"
- "to do later", "remember this for later", "save this for later"
- "save this as an insight", "add this to the backlog"

Examples:

> _"On devrait détecter les doublons à l'import GEDCOM, à faire plus tard."_

> _"Note pour plus tard: revoir le wording de la home page."_

> _"Save this as an insight — query perf on individuals list is mediocre."_

The agent composes a concise English title (and optional body), reads the repo's existing labels, picks 0–2 that match, and creates the issue. It replies with the issue number and URL.

### What gets created

- A regular GitHub issue (open state, no assignee, no milestone)
- Title and body in English (project rule)
- 0–2 labels picked from existing repo labels (no labels are auto-created)
- Created via `gh issue create` in whatever repo the current cwd resolves to

Refine in GitHub afterward.

---

## Linking a task to an issue — `link-task`

Activates at the **start** of a dev task, right after you decide "simple branch or worktree?" and before code changes. Triggers on phrases like:

- "let's implement X" / "on travaille sur Y"
- "add a feature for Z" / "fix bug W"
- "commençons sur X" / "on s'attaque à X"

Flow:

1. Agent searches the repo's issues with `gh issue list --search ...` for queries derived from the task description
2. Lists up to 5 candidates with `#<number> · <state> · <title>`
3. You pick one, ask for a new one (delegates to `capture-idea`), or skip
4. The picked number is stored in `git config branch.<branch>.ghIssue`

When you later open the PR, the agent reads that git config and appends `Closes #N` to the description automatically. GitHub natively closes the linked issue when the PR merges — no external integration needed.

The link is per-branch and survives across sessions.

### Example session

```
You: simple branch or worktree?
Agent: <recommends, you choose>
You: let's add a CSV export of the individuals list
Agent: I found these:
       #12 · open · CSV export of individuals (label: ui)
       #31 · open · Bulk export options
       Which one — #12, #31, create new, or no link?
You: #12
Agent: Linked to #12. Proceeding.
... work happens ...
You: open the PR
Agent: <opens PR; description includes "Closes #12">
```

### What does _not_ happen

- The agent doesn't auto-pick — Phase A always asks
- The agent doesn't search GitHub at PR time — only at task start
- Branch names are not modified to include the issue number
- Existing commits are not amended

---

## Troubleshooting

- **`gh` not authenticated**: run `gh auth login`, then retry.
- **No labels applied when you expected one** (capture flow): the agent only applies labels when the match is unambiguous. Add the label in the repo and the next capture will see it.
- **Forgot to link at task start**: re-trigger the skill mid-task — _"link this task to a GitHub issue"_ — Phase A runs again and updates `git config`.
- **Wrong issue linked**: re-run Phase A; `git config` overwrites cleanly.
- **PR already opened without `Closes #N`**: edit the PR description in GitHub and add the footer manually, or run `gh pr edit --body "..."`. Future PRs on this branch will pick up the link from `git config` automatically if you re-run Phase B.
