---
name: capture-idea
description: Capture a product idea, bug, or task as a GitHub issue. Use when the user signals something should be saved for later rather than acted on now — phrases like "faire plus tard", "à faire plus tard", "note pour plus tard", "ne pas oublier", "garder pour plus tard", "to do later", "remember this for later", "save this for later", "save this as an insight", "add this to the backlog", or any other phrasing indicating a non-actionable item worth recording. Reads existing repo labels via `gh label list` and applies 0–2 that match. Sets the org-level Issue Type (Task/Bug/Feature) via GraphQL after creation, defaulting to Feature for ideas.
---

# Capture Idea

Files an item as a GitHub issue in the repo of the current working directory, then sets the org-level Issue Type via GraphQL so the issue is consistent with web-UI submissions. Backed by the `gh` CLI — no MCP, no API key, no setup beyond `gh auth login` plus `read:org` scope.

## When to activate

Activate as soon as the user expresses one of these intents in either French or English:

- "faire plus tard", "à faire plus tard", "note pour plus tard", "garder pour plus tard", "ne pas oublier"
- "to do later", "remember this for later", "save this for later"
- "save this as an insight", "add this to the backlog", "capture this idea"
- Any equivalent phrasing where the user is parking an item, not asking for immediate work

If the user is asking for the work to be done **now**, this skill does not apply — proceed with the task instead.

## Capture flow

Follow these steps in order. Do **not** ask the user for confirmation before creating — the trigger phrase is itself the explicit signal.

### 1. Compose the issue

From the recent conversation context, build:

- **Title** — concise, ≤80 chars, imperative form, English (project rule). Example: _"Detect duplicate individuals on GEDCOM import"_.
- **Body** — optional. Include only if it adds context beyond the title (motivating example, constraint, related file path). Skip it if the title alone is self-explanatory. Markdown is supported.

Translate the user's content to English even if they expressed it in French (project rule: all artifacts are English-only; only conversation with the user is in French).

### 2. Decide the Issue Type

Pick one of the org's three types:

- **Feature** (default for ideas/insights) — a new capability, improvement, or open-ended idea
- **Bug** — only if the captured item explicitly describes a defect ("X is broken", "Y crashes", "Z gives wrong result")
- **Task** — only if the user's wording is operational and concrete ("rename X", "bump Y dep", "extract Z helper")

When in doubt, choose **Feature**. The user can reclassify in the GitHub UI if needed.

### 3. Fetch existing labels

```bash
gh label list --json name,description,color --limit 100
```

Don't pass `--repo` — `gh` infers it from the current working directory's git remote. This keeps the skill portable across repos.

### 4. Pick labels

Vata's labels are **product-shaped, not codebase-shaped** — each one names a user-facing concept, not a folder of code. Select **0 to 2** labels whose name or description clearly matches the item. Current taxonomy and how to read them:

| Label             | Apply when the idea touches…                                           |
| ----------------- | ---------------------------------------------------------------------- |
| `individuals`     | People, names, lifespan formatting                                     |
| `families`        | Spouse / parent / child links, pedigree                                |
| `events`          | Life events, dates, witnesses                                          |
| `places`          | Geography, place hierarchy, external place lookup                      |
| `sources`         | Sources, citations, evidence linking, repositories                     |
| `media`           | Photos, scans, documents, image attachments and editing                |
| `gedcom`          | GEDCOM 5.5.1 import / export, interoperability                         |
| `data-quality`    | Completion tracking, duplicate detection, validation                   |
| `tree-management` | Creating / opening / importing trees, storage location                 |
| `design-system`   | Storybook, UI wrappers, design tokens, shadcn migrations               |
| `monetization`    | Paid-tier ideas (Vata is open source and free; these are aspirational) |

Combine two only when the issue is genuinely about the intersection (e.g., "tag people on photos" → `media` + `individuals`). If the idea is a Tauri-shell change, a generic refactor, or a small typo with no clear product surface, **pass no labels**. Do not stretch a match.

#### When no existing label fits

If the captured idea points at a recurring product surface that the current taxonomy doesn't cover (e.g., search/filtering, accessibility, performance, i18n) — proceed to create the issue with **no label**, and in the step-8 report, propose a new label by name with a one-line rationale. Example:

> Captured #42 (Feature, no label). Suggestion: create new label `search` for this and future filter/search ideas — reply yes to add it.

Do **not** create the label without confirmation. The user accepts or rejects in the next message; on `yes`, run `gh label create <name> --color <hex> --description <desc>` and `gh issue edit 42 --add-label <name>`. This keeps the taxonomy small until a real second issue appears for that domain.

### 5. Create the issue

```bash
gh issue create \
  --title "<title>" \
  --body "<body>" \
  --label "<label1>" \
  --label "<label2>"
```

Omit `--body` if there's no body. Omit each `--label` flag whose label wasn't picked. Use a heredoc for multi-line bodies so escaping doesn't bite.

Capture the issue URL printed by `gh`. Parse the issue number from it.

### 6. Set the Issue Type via GraphQL

`gh issue create` does not support setting the org-level Issue Type. Apply it after creation. Type IDs are stable for the `vata-apps` org and hardcoded here to save a round-trip:

| Type    | ID                    |
| ------- | --------------------- |
| Task    | `IT_kwDODVrl8M4BrCV1` |
| Bug     | `IT_kwDODVrl8M4BrCV2` |
| Feature | `IT_kwDODVrl8M4BrCV3` |

```bash
# Get the new issue's node ID
ISSUE_NODE_ID=$(gh api "repos/vata-apps/vata-app/issues/<NUMBER>" --jq .node_id)

# Apply the type (substitute the right ID from the table above based on step 2)
gh api graphql -f query='
  mutation($issueId: ID!, $typeId: ID!) {
    updateIssueIssueType(input: { issueId: $issueId, issueTypeId: $typeId }) {
      issue { id }
    }
  }
' -f issueId="$ISSUE_NODE_ID" -f typeId="<TYPE_ID>" >/dev/null
```

Substitute `<NUMBER>` with the parsed issue number and `<TYPE_ID>` with the value from the table for the type chosen in step 2.

If the type IDs ever change (Steve renamed/recreated a type at the org level), the mutation will return a Not-Found error. In that case, re-resolve via `gh api graphql -f query='{ organization(login:"vata-apps") { issueTypes(first:25) { nodes { id name } } } }'` and update this skill.

### 7. Add to the Project and set Status to Icebox

Captured ideas go to the **Icebox** column of the Vata Roadmap project — they're parked, not queued. The web-UI auto-add workflow will already place new issues in `Todo`; we override to `Icebox` explicitly so capture-idea outputs are clearly distinguishable.

Hardcoded IDs (stable for this project):

| Variable           | Value                            |
| ------------------ | -------------------------------- |
| `PROJECT_ID`       | `PVT_kwDODVrl8M4BWWni`           |
| `STATUS_FIELD_ID`  | `PVTSSF_lADODVrl8M4BWWnizhRrpbs` |
| `ICEBOX_OPTION_ID` | `cdad492c`                       |

```bash
# Add to project (idempotent — if auto-add already fired, returns the existing item)
ITEM_ID=$(gh api graphql -f query='
  mutation($projectId: ID!, $contentId: ID!) {
    addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
      item { id }
    }
  }
' -f projectId="PVT_kwDODVrl8M4BWWni" \
  -f contentId="$ISSUE_NODE_ID" \
  --jq '.data.addProjectV2ItemById.item.id')

# Set Status to Icebox
gh api graphql -f query='
  mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $projectId, itemId: $itemId, fieldId: $fieldId,
      value: { singleSelectOptionId: $optionId }
    }) { projectV2Item { id } }
  }
' -f projectId="PVT_kwDODVrl8M4BWWni" \
  -f itemId="$ITEM_ID" \
  -f fieldId="PVTSSF_lADODVrl8M4BWWnizhRrpbs" \
  -f optionId="cdad492c" >/dev/null
```

If any GraphQL call fails with an auth error, surface it and tell the user to run `gh auth refresh -s read:org,project`.

The owner/repo (`vata-apps/vata-app`) and the IDs above are hardcoded for this project; that's fine — this skill lives in the Vata repo.

### 8. Report back

Reply to the user with one short sentence in the same language they used. Include the issue number, the URL, the type, and any labels. Example:

> Captured in Icebox as **#42** (Feature, label: `gedcom`) — https://github.com/vata-apps/vata-app/issues/42

Mentioning "Icebox" reinforces that the item is parked, not queued. Do not summarize the idea back to the user; they just told you what it was.

## Failure handling

- **`gh` not authenticated**: tell the user to run `gh auth login`.
- **Missing `read:org` or `project` scope** (GraphQL step fails with auth error): tell the user to run `gh auth refresh -s read:org,project`.
- **`gh issue create` returns non-zero**: surface the error verbatim.
- **GraphQL `updateIssueIssueType` fails after issue creation**: the issue exists but lacks a type. Tell the user the issue number/URL and that the type must be set manually in the GitHub UI; do not delete the issue.
- **GraphQL `addProjectV2ItemById` or `updateProjectV2ItemFieldValue` fails**: the issue exists (and probably has its type set) but isn't in the project or isn't at Icebox. Surface the error and the issue URL — the user can drag it into Icebox manually. Do not delete the issue.
- **Not in a git repo**: surface `gh`'s error.

## What this skill must not do

- Ask for confirmation before creating the issue
- Force a label when no existing label fits — pass none and propose a new one in the report
- Create new labels without explicit user confirmation
- Pick more than one Issue Type (each issue gets exactly one)
- Modify or close existing issues — capture only
- Skip step 6 — the type must be set for consistency with web-UI issues
- Skip step 7 — captured ideas must land in Icebox, not Todo, to preserve the "parked vs queued" distinction
