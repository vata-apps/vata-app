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

- [ ] Identified which Discussions may be affected
- [ ] Fetched and compared Discussion content with current code
- [ ] No contradictions between code and documented architecture
- [ ] Updated outdated Discussions (body edit or comment)
