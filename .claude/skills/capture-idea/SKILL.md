---
name: capture-idea
description: Capture a product idea or insight as a GitHub issue. Use when the user signals an idea should be saved for later rather than acted on now — phrases like "faire plus tard", "à faire plus tard", "note pour plus tard", "ne pas oublier", "garder pour plus tard", "to do later", "remember this for later", "save this for later", "save this as an insight", "add this to the backlog", or any other phrasing indicating a non-actionable idea worth recording. Reads existing repo labels via `gh label list` and applies 0–2 that match.
---

# Capture Idea

Files a product idea as a GitHub issue in the repo of the current working directory. Backed by the `gh` CLI — no MCP, no API key, no setup beyond `gh auth login` (already done if `gh` works).

## When to activate

Activate as soon as the user expresses one of these intents in either French or English:

- "faire plus tard", "à faire plus tard", "note pour plus tard", "garder pour plus tard", "ne pas oublier"
- "to do later", "remember this for later", "save this for later"
- "save this as an insight", "add this to the backlog", "capture this idea"
- Any equivalent phrasing where the user is parking an idea, not asking for immediate work

If the user is asking for the work to be done **now**, this skill does not apply — proceed with the task instead.

## Capture flow

Follow these steps in order. Do **not** ask the user for confirmation before creating — the trigger phrase is itself the explicit signal.

### 1. Compose the issue

From the recent conversation context, build:

- **Title** — concise, ≤80 chars, imperative form, English (project rule). Example: _"Detect duplicate individuals on GEDCOM import"_.
- **Body** — optional. Include only if it adds context beyond the title (motivating example, constraint, related file path). Skip it if the title alone is self-explanatory. Markdown is supported.

Translate the user's idea to English even if they expressed it in French (project rule: all artifacts are English-only; only conversation with the user is in French).

### 2. Fetch existing labels

```bash
gh label list --json name,description,color --limit 100
```

Don't pass `--repo` — `gh` infers it from the current working directory's git remote. This keeps the skill portable across repos.

### 3. Pick labels

Select **0 to 2** labels whose name or description clearly matches the idea. Examples:

- Idea about GEDCOM import → `gedcom`
- Idea about UI copy or layout → `ui` or `area:ui`
- Idea about query/migration/schema → `db`
- Idea about Rust shell or Tauri permissions → `tauri`

If nothing fits cleanly, **pass no labels**. Do not invent or stretch a match. Steve can label later in GitHub.

Do not create new labels from this skill.

### 4. Create the issue

```bash
gh issue create \
  --title "<title>" \
  --body "<body>" \
  --label "<label1>" \
  --label "<label2>"
```

Omit `--body` if there's no body. Omit each `--label` flag whose label wasn't picked. Pipe the body via a heredoc if it spans multiple lines so escaping doesn't bite.

### 5. Report back

Reply to the user with one short sentence in the same language they used. Include the issue number, the URL, and which labels were applied (or "no labels"). Example:

> Captured as **#42** (label: `gedcom`) — https://github.com/vata-apps/vata-app/issues/42

That's it. Do not summarize the idea back to the user; they just told you what it was.

## Failure handling

- **`gh` not authenticated**: tell the user to run `gh auth login`. Do not fall back to a manual API call.
- **Not in a git repo**: surface the `gh` error verbatim — this skill assumes the cwd is a repo with a GitHub remote.
- **`gh issue create` returns non-zero**: surface the error message.

## What this skill must not do

- Ask for a confirmation before creating
- Force a label when no existing label fits
- Create new labels
- Hardcode the repo — always rely on `gh` inferring from cwd
- Modify or close existing issues — capture only
