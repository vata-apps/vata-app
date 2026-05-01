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

Select **0 to 2** labels whose name or description clearly matches the item. Examples (current Vata taxonomy):

- GEDCOM import/export → `gedcom`
- UI copy or layout → `ui`
- Query / migration / schema → `db`
- Rust shell or Tauri permissions → `tauri`
- Documentation → `docs`

If nothing fits cleanly, **pass no labels**. Do not invent or stretch a match. Do not create new labels from this skill.

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

`gh issue create` does not support setting the org-level Issue Type. Apply it after creation:

```bash
# Resolve the type ID (cache in a shell var per session if you create multiple issues)
TYPE_ID=$(gh api graphql -f query='
  query {
    organization(login: "vata-apps") {
      issueTypes(first: 25) { nodes { id name } }
    }
  }
' --jq ".data.organization.issueTypes.nodes[] | select(.name == \"<TYPE>\") | .id")

# Get the new issue's node ID
ISSUE_NODE_ID=$(gh api "repos/vata-apps/vata-app/issues/<NUMBER>" --jq .node_id)

# Apply the type
gh api graphql -f query='
  mutation($issueId: ID!, $typeId: ID!) {
    updateIssueIssueType(input: { issueId: $issueId, issueTypeId: $typeId }) {
      issue { id }
    }
  }
' -f issueId="$ISSUE_NODE_ID" -f typeId="$TYPE_ID" >/dev/null
```

Substitute `<TYPE>` with `Feature`, `Bug`, or `Task` from step 2. Substitute `<NUMBER>` with the parsed issue number.

If the GraphQL mutation fails with an auth error, surface it and tell the user to run `gh auth refresh -s read:org`.

The owner/repo (`vata-apps/vata-app`) can be hardcoded for this project; it's not portable, and that's fine — this skill lives in the Vata repo.

### 7. Report back

Reply to the user with one short sentence in the same language they used. Include the issue number, the URL, the type, and any labels. Example:

> Captured as **#42** (Feature, label: `gedcom`) — https://github.com/vata-apps/vata-app/issues/42

That's it. Do not summarize the idea back to the user; they just told you what it was.

## Failure handling

- **`gh` not authenticated**: tell the user to run `gh auth login`.
- **Missing `read:org` scope** (GraphQL step fails with auth error): tell the user to run `gh auth refresh -s read:org`.
- **`gh issue create` returns non-zero**: surface the error verbatim.
- **GraphQL `updateIssueIssueType` fails after issue creation**: the issue exists but lacks a type. Tell the user the issue number/URL and that the type must be set manually in the GitHub UI; do not delete the issue.
- **Not in a git repo**: surface `gh`'s error.

## What this skill must not do

- Ask for confirmation before creating
- Force a label when no existing label fits
- Create new labels
- Pick more than one Issue Type (each issue gets exactly one)
- Modify or close existing issues — capture only
- Skip step 6 — the type must be set for consistency with web-UI issues
