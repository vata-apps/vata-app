---
name: mvp-tracker
description: Provides context on the current MVP phase and constraints. Use when implementing new features, starting a new phase, or verifying that work is in scope for the current MVP.
---

# MVP Tracker

Use this skill to load the context of the current MVP before implementing new features or reviewing scope.

## How to Find Current Status

**Do not hardcode status in this skill.** The authoritative status lives in GitHub Discussions (Product category):

- **MVP overviews**: "MVP1: Foundation", "MVP2: GEDCOM", "MVP3: Primary Entities" Discussions
- **Product specs**: "MVP1: Foundation — Product Spec", etc.
- **Roadmap**: "Roadmap" Discussion (Product category)

When you need to know the current state, fetch the relevant Discussion via `gh api graphql`.

---

## MVP Overview

| MVP                    | Focus                                   |
| ---------------------- | --------------------------------------- |
| MVP1: Foundation       | Tauri setup, system DB, tree management |
| MVP2: GEDCOM           | GEDCOM 5.5.1 import/export              |
| MVP3: Primary Entities | CRUD for genealogical entities          |
| MVP4: UI (Mantine)     | Full UI with Mantine + i18n setup       |
| MVP5: Sources          | Source citations and repositories       |
| MVP6: File Attachments | Media and document attachments          |

---

## MVP3 Constraints

When working on MVP3, these constraints apply:

1. **UI is HTML-only**: No Mantine, no design system components. Minimal inline CSS only. Functional, not polished.
2. **No i18n yet**: Hardcoded English strings are acceptable until MVP4.
3. **No file attachments**: Media files and documents are out of scope (MVP6).
4. **No source citations**: Out of scope (MVP5).
5. **Date module**: Use `@vata-apps/gedcom-date` for all date operations. No custom date parsing.
6. **SQL discipline**: All queries must follow the `sqlite-standards` skill.
7. **GEDCOM compatibility**: Entity schema must remain GEDCOM 5.5.1 compatible — follow the `gedcom-standards` skill.

---

## Out-of-Scope Guard

Before implementing a feature, check which MVP it belongs to:

| Feature                                            | MVP  |
| -------------------------------------------------- | ---- |
| CRUD: Individuals, Names, Families, Events, Places | MVP3 |
| Date parsing and formatting                        | MVP3 |
| Business logic managers and React Query hooks      | MVP3 |
| UI design system (Mantine components)              | MVP4 |
| i18n / translations                                | MVP4 |
| Source citations and repositories                  | MVP5 |
| Media files and document attachments               | MVP6 |

If a feature belongs to a future MVP, do not implement it now.

---

## Key Architecture Files

| File                      | Purpose                              |
| ------------------------- | ------------------------------------ |
| `src/db/connection.ts`    | DB connection lifecycle, PRAGMAs     |
| `src/db/system/trees.ts`  | System-level tree CRUD               |
| `src/lib/query-keys.ts`   | TanStack Query key factory           |
| `src/lib/query-client.ts` | QueryClient config                   |
| `src/types/database.ts`   | TypeScript types mirroring DB schema |
| `src/store/app-store.ts`  | Zustand store (currentTreeId)        |

---

## Checklist Before Starting a New Phase

- [ ] Previous phase deliverables are complete
- [ ] Schema changes documented in "Database Schema" Discussion (Architecture category)
- [ ] New DB functions follow `sqlite-standards` skill (PRAGMAs, no SELECT \*, parameterized queries)
- [ ] New GEDCOM-related code follows `gedcom-standards` skill
- [ ] New TypeScript code follows `typescript-standards` skill
- [ ] Documentation updated — run `docs-consistency` skill after any changes that affect documented architecture
