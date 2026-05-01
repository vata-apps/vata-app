# Issue Tracking

Single backlog for everything — bugs, ideas, tasks. GitHub Issues + one org-level GH Project replace what Linear used to do, with zero external service to keep authenticated.

## Quick start

| Where      | What                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| Issue Type | One of `Task` / `Bug` / `Feature`, set at the org level (max 25 across all repos)   |
| Templates  | `.github/ISSUE_TEMPLATE/{bug,feature,task}.yml` — auto-set the type on web UI       |
| Labels     | 6 labels covering area: `db`, `ui`, `gedcom`, `tauri`, `docs`, `good-first-issue`   |
| Project    | Org-level "Vata Roadmap" — Status / Priority / Type fields, auto-add for new issues |
| Skills     | `capture-idea` (file an idea), `link-task` (bind PR to existing issue)              |

## Issue Types

`vata-apps` has three Issue Types defined at the organization level:

| Type        | When to use                                                                         |
| ----------- | ----------------------------------------------------------------------------------- |
| **Bug**     | An unexpected problem or behavior — something is broken or wrong                    |
| **Feature** | A new capability, improvement, or insight — anything that's not a defect or a task  |
| **Task**    | A concrete piece of dev work with a clear deliverable (refactor, dep bump, cleanup) |

Each issue has exactly one Type (single value). Types are visible in the issue header, in search (`type:"Bug"`), and as a built-in field in the Project. Only org owners can create/edit/disable types in `vata-apps` settings.

For ideas/insights captured via `capture-idea`, the default is **Feature** unless the wording clearly indicates a defect (Bug) or operational task (Task).

## Templates

Three YAML issue forms live in `.github/ISSUE_TEMPLATE/`. Each preset its `type:` so issues created via the GitHub web UI ("New issue" → pick a template) are auto-classified.

| File          | Type      | Required fields                         |
| ------------- | --------- | --------------------------------------- |
| `bug.yml`     | `bug`     | What's wrong, Steps to reproduce        |
| `feature.yml` | `feature` | The idea                                |
| `task.yml`    | `task`    | Goal                                    |
| `config.yml`  | —         | Disables blank issues, no contact links |

Blank issues are disabled — every new issue must go through one of the three templates. The skills (`capture-idea`) bypass templates because they create issues programmatically; they set the type explicitly via GraphQL after creation, keeping parity with web-UI submissions.

## Labels

Labels track the **area** of the codebase only. Issue Type is not a label. Priority and Status live on the Project, not as labels.

| Label              | Meaning                               | Color     |
| ------------------ | ------------------------------------- | --------- |
| `db`               | Schema, queries, migrations           | `#0E8A16` |
| `ui`               | Components, pages, routing            | `#1D76DB` |
| `gedcom`           | Import/export GEDCOM                  | `#D93F0B` |
| `tauri`            | Rust shell, permissions, capabilities | `#5319E7` |
| `docs`             | Documentation work                    | `#0075CA` |
| `good-first-issue` | Good for newcomers / small surface    | `#7057FF` |

An issue can have **0–2 area labels**. Most have one or none.

## The Project

Org-level: **Vata Roadmap** at `https://github.com/orgs/vata-apps/projects/<num>`.

### Fields

| Field        | Type          | Values / behavior                                      |
| ------------ | ------------- | ------------------------------------------------------ |
| **Title**    | (built-in)    | Issue title                                            |
| **Type**     | (built-in)    | Maps to org Issue Type (Task / Bug / Feature)          |
| **Status**   | (built-in)    | 4-stage pipeline: Icebox → Todo → In Progress → Done   |
| **Priority** | single-select | P0 (drop everything) / P1 (this cycle) / P2 (whenever) |

The Status pipeline separates two horizons:

- **Icebox** — vague ideas captured for "maybe someday". Not committed to. `capture-idea` lands here.
- **Todo** — queued work for the near future. Web-UI submissions via templates land here.
- **In Progress** — actively being worked on.
- **Done** — closed or merged.

The transition from `Icebox` → `Todo` is the explicit promotion moment ("yes, I'm going to do this").

### Auto-add

A workflow on the Project adds every new issue from `vata-apps/vata-app` automatically. New items land with **Status: Todo** by default. The `capture-idea` skill explicitly overrides the Status to **Icebox** after creation, so skill-captured ideas are clearly distinguishable from deliberate web-UI submissions.

### Auto-status (built-in workflows)

- Item added to project → Status = **Todo** (overridden to **Icebox** by `capture-idea`)
- Pull request opened on a linked issue → Status = **In Progress**
- Pull request merged → Status = **Done**
- Issue closed → Status = **Done**

### Recommended views

Four views cover the day-to-day. Configure in the Project UI; saved filter syntax shown.

#### View 1 — **Now** (board, default)

Active work. Hides Icebox and Done so only what's queued or in flight shows up.

- **Layout**: Board, grouped by Status
- **Filter**: `is:open -status:Icebox -status:Done`
- **Sort**: Priority asc, then updated desc

#### View 2 — **Icebox** (table)

Triage ideas. Open weekly to promote or prune.

- **Layout**: Table, grouped by Type
- **Filter**: `is:open status:Icebox`
- **Sort**: updated desc
- **Visible columns**: Title, Type, Labels, Priority, updated

#### View 3 — **Bugs** (board)

Bug-only board, full pipeline visible (including unreviewed bug reports in Icebox).

- **Layout**: Board, grouped by Status
- **Filter**: `is:open type:Bug`
- **Sort**: Priority asc, then updated desc

#### View 4 — **Backlog by Priority** (table)

When you ask "what's truly the most important thing right now?".

- **Layout**: Table, grouped by Priority
- **Filter**: `is:open -status:Icebox -status:Done`
- **Sort**: updated desc
- **Visible columns**: Title, Type, Status, Labels

## Skills

Two Claude Code skills, used from any session in the repo.

### `capture-idea`

Activates on phrases like:

- "à faire plus tard", "faire plus tard", "note pour plus tard"
- "ne pas oublier", "garder pour plus tard"
- "to do later", "remember this for later", "save this for later"
- "save this as an insight", "add this to the backlog"

The agent composes a concise English title (and optional body), reads the repo's existing labels, picks 0–2 that match, creates the issue with `gh issue create`, then via GraphQL sets the org-level Issue Type (Feature by default; Bug or Task if context suggests) and pins the Project Status to **Icebox**. Replies with the issue number, type, labels, "Icebox", and URL.

### `link-task`

Activates at the **start** of a dev task, on phrases like:

- "let's implement X" / "on travaille sur Y"
- "add a feature for Z" / "fix bug W"
- "commençons sur X" / "on s'attaque à X"

Phase A: searches the repo's open issues via the GraphQL `search` API (returns `issueType` alongside title and state — `gh issue list --json` doesn't expose the type field), lists up to 5 candidates as `#<number> · <type> · <state> · <title>`, lets the user pick or create. Stores the choice in `git config branch.<branch>.ghIssue`.

Phase B: at PR creation, reads that git config and appends `Closes #N` to the description. GitHub auto-closes the linked issue on merge, and the Project's auto-status workflow moves it to **Done**.

## Manual setup checklist

For first-time setup or when wiring a new dev environment:

1. **Authenticate `gh`** with the right scopes:
   ```bash
   gh auth login                              # if not already
   gh auth refresh -s repo,project,read:org   # add scopes for projects + Issue Types
   ```
2. **Run the bootstrap script**:

   ```bash
   bash scripts/setup-gh-project.sh
   ```

   It reconciles labels (drops obsolete ones, adds missing), creates the **Vata Roadmap** Project if missing, and adds the custom **Priority** field. The built-in **Status** field already provides the Todo / In Progress / Done pipeline. Idempotent.

3. **Add `Icebox` to Status** (Project UI):
   - Project → ⚙ **Settings** → **Fields** → **Status** → "Add option" → name it `Icebox`
   - Drag `Icebox` to the **first** position so it sits before `Todo` in the pipeline

4. **Configure the Auto-add workflow** in the Project UI (one-time, not scriptable):
   - Project → **Workflows** → enable **Auto-add to project**
   - Repository: `vata-apps/vata-app`
   - Filter: `is:issue,open`

5. **Configure auto-status workflows** (built-ins, also UI-only). Status pipeline is `Icebox / Todo / In Progress / Done`:
   - **Item added to project** → set Status: `Todo` (the `capture-idea` skill overrides to `Icebox` after the fact)
   - **Pull request opened** → set Status: `In Progress`
   - **Pull request merged** → set Status: `Done`
   - **Issue closed** → set Status: `Done`

6. **Set up the four recommended views** (see "Recommended views" above for queries):
   - **Now** — board, hides Icebox + Done
   - **Icebox** — table of parked ideas
   - **Bugs** — board filtered to `type:Bug`
   - **Backlog by Priority** — table grouped by P0/P1/P2

The bootstrap script prints these manual steps after running.

## Troubleshooting

- **`gh` not authenticated**: `gh auth login`.
- **Skill fails on the type-setting GraphQL step**: missing `read:org` scope. `gh auth refresh -s read:org`.
- **`setup-gh-project.sh` fails to create a Project field**: confirm the `project` scope is present (`gh auth status`). The script prints manual instructions for any field it couldn't create.
- **Auto-add isn't picking up new issues**: the workflow on the Project must be enabled (UI step 3 above).
- **Forgot to link at task start**: trigger `link-task` mid-task — _"link this task to a GitHub issue"_ — Phase A runs again and overwrites `git config`.
- **Wrong issue linked**: re-run Phase A; `git config` overwrites cleanly.
- **PR already opened without `Closes #N`**: edit the PR description manually or via `gh pr edit --body "..."`.
- **Issue lacks a Type after capture**: the GraphQL step failed silently. Set the type from the GitHub UI (issue header → "Type" dropdown).
