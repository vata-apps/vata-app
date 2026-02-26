---
name: mvp-tracker
description: Provides context on the current MVP phase and constraints. Use when implementing new features, starting a new phase, or verifying that work is in scope for the current MVP.
---

# MVP Tracker

Use this skill to load the context of the current MVP before implementing new features or reviewing scope.

## Current Status

**Active MVP: MVP3 — Primary Entities**

---

## MVP Overview

| MVP                    | Status          | Description                                      |
| ---------------------- | --------------- | ------------------------------------------------ |
| MVP1: Foundation       | Complete        | Tauri setup, system DB, tree management, home UI |
| MVP2: GEDCOM           | Complete        | GEDCOM 5.5.1 import/export                       |
| MVP3: Primary Entities | **In progress** | CRUD for all genealogical entities               |
| MVP4: UI (Mantine)     | Planned         | Full UI with Mantine + i18n setup                |
| MVP5: Sources          | Planned         | Source citations and repositories                |
| MVP6: File Attachments | Planned         | Media and document attachments                   |

---

## MVP3 Phases

| Phase                     | Description                  | Key locations                                                                      |
| ------------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| Phase 1: Tree Schema      | DB schema for tree.db        | `src/db/trees/` schema, migrations                                                 |
| Phase 2: CRUD Database    | DB layer functions           | `src/db/trees/individuals.ts`, `families.ts`, `names.ts`, `places.ts`, `events.ts` |
| Phase 3: Dates            | Date handling integration    | `@vata-apps/gedcom-date`, `src/lib/date.ts`                                        |
| Phase 4: Managers & Hooks | Business logic + React Query | `src/managers/`, `src/hooks/`                                                      |
| Phase 5: Minimal UI       | HTML-only routes & pages     | `src/routes/`, `src/pages/`                                                        |

Full phase details: `docs/mvps/mvp-3-primary-entities/`

---

## MVP3 Constraints

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

If a feature belongs to a future MVP, do not implement it now. Document it in the relevant MVP phase doc instead.

---

## Checklist Before Starting a New Phase

- [ ] Previous phase deliverables are complete (check `docs/mvps/mvp-3-primary-entities/README.md`)
- [ ] Schema changes documented in `docs/architecture/database-schema.md`
- [ ] New DB functions follow `sqlite-standards` skill (PRAGMAs, no SELECT \*, parameterized queries)
- [ ] New GEDCOM-related code follows `gedcom-standards` skill
- [ ] New TypeScript code follows `typescript-standards` skill
- [ ] Documentation updated — run `docs-consistency` skill after any doc changes

---

## Key Architecture Files for MVP3

| File                      | Purpose                              |
| ------------------------- | ------------------------------------ |
| `src/db/connection.ts`    | DB connection lifecycle, PRAGMAs     |
| `src/db/system/trees.ts`  | Tree CRUD (already implemented)      |
| `src/lib/query-keys.ts`   | TanStack Query key factory           |
| `src/lib/query-client.ts` | QueryClient config                   |
| `src/types/database.ts`   | TypeScript types mirroring DB schema |
| `src/store/app-store.ts`  | Zustand store (currentTreeId)        |
