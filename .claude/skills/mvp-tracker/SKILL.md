---
name: mvp-tracker
description: Provides context on the current MVP phase and constraints. Use when implementing new features, starting a new phase, or verifying that work is in scope for the current MVP.
---

# MVP Tracker

Use this skill to load the context of the current MVP before implementing new features or reviewing scope.

## How to Find Current Status

**Do not hardcode status in this skill.** The authoritative status lives in:

- **Overall state**: `docs/mvps/*/README.md` — each MVP has a checklist
- **Phase details**: `docs/mvps/mvp-X-*/phase-*.md` — each phase has its own doc
- **Quick lookup**: `docs/README.md` — navigation index to all MVP docs

When you need to know the current state:

1. Read the relevant `docs/mvps/*/README.md` checklist
2. Check which phases have all items checked `[x]`
3. The first unchecked phase is the current work

---

## MVP Overview

| MVP                    | Focus                                   |
| ---------------------- | --------------------------------------- |
| MVP1: Foundation       | Tauri setup, system DB, tree management |
| MVP2: GEDCOM           | GEDCOM 5.5.1 import/export              |
| MVP3: Primary Entities | CRUD for genealogical entities          |
| MVP4: Sources & Media  | Source-centric workflow + media attachments |
| MVP5: File Manager     | Browse and manage all tree media files   |
| MVP6: UI (shadcn/ui)   | Full UI with shadcn/ui + Tailwind + i18n |

---

## MVP3–5 Constraints

When working on MVP3, MVP4, or MVP5, these constraints apply:

1. **UI is HTML-only**: No shadcn/ui, no design system components. Minimal inline CSS only. Functional, not polished. Design system comes in MVP6.
2. **No i18n yet**: Hardcoded English strings are acceptable until MVP6.
3. **No file manager**: Standalone file browsing/management is out of scope until MVP5.
4. **Date module**: Use `@vata-apps/gedcom-date` for all date operations. No custom date parsing.
5. **SQL discipline**: All queries must follow the `sqlite-standards` skill.
6. **GEDCOM compatibility**: Entity schema must remain GEDCOM 5.5.1 compatible — follow the `gedcom-standards` skill.

---

## Out-of-Scope Guard

Before implementing a feature, check which MVP it belongs to:

| Feature                                            | MVP  |
| -------------------------------------------------- | ---- |
| CRUD: Individuals, Names, Families, Events, Places | MVP3 |
| Date parsing and formatting                        | MVP3 |
| Business logic managers and React Query hooks      | MVP3 |
| Sources, citations, repositories, media attachments | MVP4 |
| Standalone file manager (browse/manage tree files) | MVP5 |
| UI design system (shadcn/ui components)             | MVP6 |
| i18n / translations                                | MVP6 |

If a feature belongs to a future MVP, do not implement it now. Document it in the relevant MVP phase doc instead.

---

## When to Update MVP Status

Update the documentation when:

- **Starting a new MVP**: Mark previous MVP as complete in its README, create new MVP folder with phase docs
- **Starting a new phase**: Create or update the phase doc with implementation details
- **Completing a phase**: Check all items in `docs/mvps/{mvp}/README.md` checklist
- **Completing an MVP**: Mark it complete in the overview above

## How to Update Status

1. **Checklist in MVP README**: Toggle `[ ]` to `[x]` for completed items
2. **Phase docs**: Update with file locations, implementation notes
3. **New MVP folder**: Copy template from previous MVP, rename, update content

Do not update this skill with status — it would always be stale.

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

- [ ] Previous phase deliverables are complete (check `docs/mvps/*/README.md`)
- [ ] Schema changes documented in `docs/architecture/database-schema.md`
- [ ] New DB functions follow `sqlite-standards` skill (PRAGMAs, no SELECT \*, parameterized queries)
- [ ] New GEDCOM-related code follows `gedcom-standards` skill
- [ ] New TypeScript code follows `typescript-standards` skill
- [ ] Documentation updated — dispatch the `docs-consistency` agent after any doc changes
- [ ] Scope validated — dispatch the `scope-validator` agent if adding new features
