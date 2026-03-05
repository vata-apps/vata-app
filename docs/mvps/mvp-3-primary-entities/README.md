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

### Phase 1: Tree Schema

- [x] Complete tree.db schema (tables, constraints, FKs)
- [x] All indexes created
- [x] Default event types seeded (29 system types)
- [x] tree_meta table with schema version

### Phase 2: CRUD Database

- [x] CRUD Individuals functional (7 functions, 24 tests)
- [x] CRUD Names functional (12 functions, 28 tests)
- [x] CRUD Families functional (20 functions, 47 tests)
- [x] CRUD Places functional (19 functions, 55 tests)
- [x] CRUD Events functional (26 functions, 57 tests)

### Phase 3: Dates

- [x] @vata-apps/gedcom-date module implemented
- [x] Date parsing works correctly
- [x] Date formatting works correctly (en/fr locales)
- [x] Sort date generation works
- [x] Age calculation works

### Phase 4: Managers & Hooks

- [x] TreeManager implemented
- [x] IndividualManager implemented
- [x] FamilyManager implemented
- [x] React Query hooks implemented (useIndividuals, useFamilies, usePlaces, useEvents)
- [x] query-keys updated for all entities

### Phase 5: Minimal UI

- [x] Individual list UI
- [x] Individual record UI
- [x] Family list UI
- [x] Family record UI
- [x] Routes configured
- [x] Navigation between pages

## Estimated Duration

This MVP is the most complex as it implements all core genealogical data management. Careful attention to data relationships and validation is required.

## Next Steps

After completing MVP3, proceed to MVP4 (UI with Mantine) which depends on Figma design work.
