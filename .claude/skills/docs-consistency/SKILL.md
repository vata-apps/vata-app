---
name: docs-consistency
description: Validates documentation consistency after code changes that affect documented architecture, schema, data flow, or API. Use after modifying database schema, connection logic, data flow patterns, or API interfaces to ensure GitHub Discussions stay accurate.
---

# Documentation Consistency Validation

## When to Apply

After **code changes** that affect documented architecture, schema, data flow, or API patterns. Documentation now lives in **GitHub Discussions** (Architecture and Product categories).

Trigger examples:
- Modified `src/db/connection.ts` (PRAGMAs, connection logic)
- Changed table schema in `src/db/trees/*.ts` or `src/db/system/*.ts`
- Added/removed/renamed DB layer functions
- Changed data flow patterns (hooks, managers, stores)
- Modified routing or layout structure
- Changed GEDCOM import/export logic

## Consistency Check Workflow

### Step 1: Identify impacted Discussions

Use the dependency map below to determine which Discussions may need updating.

### Step 2: Fetch Discussion content

```bash
# List discussions in a category
gh api graphql -f query='{ repository(owner: "vata-apps", name: "vata-app") { discussions(first: 50, categoryId: "CATEGORY_ID") { nodes { number title } } } }'

# Read a specific discussion
gh api graphql -f query='{ repository(owner: "vata-apps", name: "vata-app") { discussion(number: NUMBER) { body } } }'
```

Category IDs:
- Architecture: `DIC_kwDORYIzjM4C6Cpv`
- Product: `DIC_kwDORYIzjM4C6Cp8`
- ADR: `DIC_kwDORYIzjM4C6Cp9`

### Step 3: Compare and report

For each impacted Discussion:
1. Fetch its content
2. Compare with current code state
3. List discrepancies

### Step 4: Update Discussions

Update outdated Discussions by adding a comment with the correction, or update the discussion body via:

```bash
gh api graphql -f query='mutation($id: ID!, $body: String!) { updateDiscussion(input: { discussionId: $id, body: $body }) { discussion { url } } }' -f id="DISCUSSION_NODE_ID" -f body="NEW_BODY"
```

## Dependency Map

```
Code change                          → Check these Discussions
─────────────────────────────────────────────────────────────
src/db/connection.ts (PRAGMAs)       → "Database Schema", "Architecture Overview", "Database Layer API"
src/db/trees/*.ts (schema/queries)   → "Database Schema", "Database Layer API", "GEDCOM 5.5.1 Mapping"
src/db/system/*.ts                   → "Database Schema", "Database Layer API"
src/lib/gedcom/**                    → "GEDCOM 5.5.1 Mapping", "Data Flow"
src/managers/**                      → "Data Flow", "Architecture Overview"
src/hooks/**                         → "Data Flow"
src/routes/**                        → "Architecture Overview"
src/components/**, src/pages/**      → Screen Discussions ("Screen: Home", "Screen: Tree View", etc.)
vite.config.ts, tsconfig.json        → "Tech Stack"
src-tauri/**                         → "Tech Stack", "Architecture Overview"
```

## Quick Checklist

Before completing a task that changed code in the areas above:

- [ ] Identified which Discussions may be affected
- [ ] Fetched and compared Discussion content with current code
- [ ] No contradictions between code and documented architecture
- [ ] Updated outdated Discussions (body edit or comment)
