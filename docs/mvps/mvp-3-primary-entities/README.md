# MVP3: Primary Entities

## Job to be Done

**Create, modify, and delete primary entities and navigate between different modules.**

## Scope

MVP3 implements complete CRUD operations for all primary genealogical entities: Individuals, Names, Families, Events, and Places. Date handling is integrated via the in-app module `@vata-apps/gedcom-date`. UI is minimal HTML-only with basic CSS. Routes and layouts are HTML-based.

## Prerequisites

- MVP1 (Foundation) completed
- MVP2 (GEDCOM) completed
- In-app module `@vata-apps/gedcom-date` (see [ADR-004](../../decisions/adr-004-gedcom-libraries.md))

## Contents

- **Entities**: Person (Name), Family, Event (dates via `@vata-apps/gedcom-date`), Place
- **UI**: Minimalist HTML only with minimal CSS for display
- **Routes and layouts**: HTML-based navigation

## Development Phases

1. **[Phase 1: Tree Schema](phase-1-tree-schema.md)** — Tree database schema, indexes, default event types
2. **[Phase 2: CRUD Database](phase-2-crud-db.md)** — Database layer: individuals, names, families, places, events
3. **[Phase 3: Dates](phase-3-dates.md)** — @vata-apps/gedcom-date integration for date parsing, formatting, and validation
4. **[Phase 4: Managers & Hooks](phase-4-managers-hooks.md)** — Business logic managers and React Query hooks
5. **[Phase 5: Minimal UI](phase-5-minimal-ui.md)** — Routes, layouts, list/detail pages HTML-only

## Deliverables Checklist

- [ ] Complete tree.db schema
- [ ] CRUD Individuals functional
- [ ] CRUD Names functional
- [ ] CRUD Families functional
- [ ] CRUD Places functional
- [ ] CRUD Events functional
- [ ] Date handling integrated
- [ ] Managers implemented
- [ ] React Query hooks implemented
- [ ] Individual list UI
- [ ] Individual record UI
- [ ] Family list UI
- [ ] Family record UI
- [ ] Manual tests validated

## Estimated Duration

This MVP is the most complex as it implements all core genealogical data management. Careful attention to data relationships and validation is required.

## Next Steps

After completing MVP3, proceed to MVP4 (UI with Mantine) which depends on Figma design work.
