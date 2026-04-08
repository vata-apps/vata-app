# MVP3: Primary Entities — Product Spec

## Objective (JTBD)

**Create, modify, and delete primary entities and navigate between different modules.**

MVP3 implements the core genealogical data model and operations: individuals, names, families, events, and places with a functional (if minimal) UI.

## Target Personas

- **Marie** (beginner): Wants to add people and basic facts to her tree.
- **Robert** (enthusiast): Needs efficient CRUD on a large dataset and fast navigation.
- **Claire** (researcher): Needs precise event recording with dates and places.

## User Stories

- [US-3.1: Add an individual](../../product/user-stories.md#us-31-add-an-individual)
- [US-3.2: Create a family](../../product/user-stories.md#us-32-create-a-family)
- [US-3.3: Add an event](../../product/user-stories.md#us-33-add-an-event)
- [US-3.4: Manage places](../../product/user-stories.md#us-34-manage-places)
- [US-3.5: Navigate between entities](../../product/user-stories.md#us-35-navigate-between-entities)

## Scope

### In

- Complete tree.db schema (individuals, names, families, family_members, events, event_types, event_participants, places, place_types, tree_meta)
- CRUD for all primary entities
- Date handling via in-app module `@vata-apps/gedcom-date` (dual storage: original + sort)
- Business logic managers and React Query hooks
- Minimal HTML UI: lists, detail views, forms
- Routes and navigation between entities

### Out

- Sources and citations (MVP4)
- File attachments (MVP6)
- shadcn/ui components or polished UI (MVP5)
- Search or filtering (future enhancement)

## Key Decisions

- [ADR-003: Database Architecture — Dual DB, String IDs](../../decisions/adr-003-database-architecture.md)
- [ADR-004: GEDCOM Libraries — gedcom-date for dates](../../decisions/adr-004-gedcom-libraries.md)
- [ADR-005: UI Strategy — HTML in MVP3](../../decisions/adr-005-ui-strategy.md)

## Dependencies

- **MVP1**: Database layer and tree management.
- **MVP2**: GEDCOM import/export for populating trees with real test data.
- **gedcom-date**: In-app module `@vata-apps/gedcom-date` for genealogical date parsing, formatting, and validation (see [ADR-004](../../decisions/adr-004-gedcom-libraries.md)).

## Risks & Mitigation

| Risk                                        | Mitigation                                                |
| ------------------------------------------- | --------------------------------------------------------- |
| Complex entity relationships (many-to-many) | Transactions for multi-table operations                   |
| Referential integrity across entities       | Foreign key constraints, indexes on FK columns            |
| Varied date formats                         | Validation before storage via `@vata-apps/gedcom-date`    |
| Performance on large trees                  | Efficient queries with proper joins; pagination for lists |

## Success Criteria

- [ ] Complete CRUD for individuals, names, families, events, places
- [ ] Relationships between entities work correctly
- [ ] Dates parse and display correctly (ABT, BEF, BET...AND, etc.)
- [ ] Navigation between individuals, families, and events is functional
- [ ] Data integrity maintained under all operations
- [ ] Managers and hooks implemented following the layered architecture

## Implementation Reference

Development phases and technical details: [MVP3 README](./README.md)
