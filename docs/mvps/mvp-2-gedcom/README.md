# MVP2: GEDCOM

## Job to be Done

**Create a tree by importing a GEDCOM file and export a tree to GEDCOM.**

## Scope

MVP2 implements GEDCOM 5.5.1 import and export functionality, the standard exchange format for genealogical data. This MVP enables interoperability with other genealogy software.

## Prerequisites

- MVP1 (Foundation) completed
- Understanding of GEDCOM 5.5.1 format
- In-app module `@vata-apps/gedcom-parser` (see [ADR-004](../../decisions/adr-004-gedcom-libraries.md))

## Contents

- GEDCOM format overview
- Integration with in-app module `@vata-apps/gedcom-parser`
- Import functionality (individuals, families, events, places)
- Export functionality
- Import/Export UI components

## Development Phases

1. **[Phase 1: Import](phase-1-import.md)** — Use @vata-apps/gedcom-parser, implement importer with mapping to database schema
2. **[Phase 2: Export](phase-2-export.md)** — Implement exporter and GedcomManager
3. **[Phase 3: UI](phase-3-ui.md)** — Import/Export modals and integration with Home page

## Deliverables Checklist

- [ ] GEDCOM parser functional
- [ ] Individual import works
- [ ] Name import works
- [ ] Family import works
- [ ] Event import works
- [ ] Place import works
- [ ] Complete GEDCOM export works
- [ ] Error handling implemented
- [ ] Import UI with preview
- [ ] Export UI with options
- [ ] Tests with real GEDCOM files

## Estimated Duration

This MVP focuses on data interoperability. The complexity lies in mapping GEDCOM structures to the Vata database schema.

## Next Steps

After completing MVP2, proceed to [MVP3: Primary Entities](../mvp-3-primary-entities/README.md) for CRUD operations on genealogical entities.
