# MVP2: GEDCOM — Product Spec

## Objective (JTBD)

**Create a tree by importing a GEDCOM file and export a tree to GEDCOM.**

MVP2 adds GEDCOM 5.5.1 interoperability, enabling users to bring in existing data and share their trees with other software.

## Target Personas

- **Marie** (beginner): Received a GEDCOM file and wants to explore it.
- **Robert** (enthusiast): Regularly imports and exports between tools. Needs reliable round-trip.

## User Stories

- [US-2.1: Import a GEDCOM file](../../product/user-stories.md#us-21-import-a-gedcom-file)
- [US-2.2: Export a tree to GEDCOM](../../product/user-stories.md#us-22-export-a-tree-to-gedcom)
- [US-2.3: Handle import errors gracefully](../../product/user-stories.md#us-23-handle-import-errors-gracefully)

## Scope

### In

- Integration with in-app module `@vata-apps/gedcom-parser`
- GEDCOM 5.5.1 import (individuals, families, events, places)
- GEDCOM 5.5.1 export with round-trip compatibility
- Privacy option (exclude living individuals on export)
- Import progress indicator and error reporting
- Import/export UI (file selection, options, feedback)

### Out

- GEDCOM 7.0 support
- Media/file import from GEDCOM
- Batch import of multiple files
- Merge of imported data into an existing tree (import always creates a new tree)

## Key Decisions

- [ADR-004: GEDCOM Libraries — gedcom-parser, gedcom-date](../../decisions/adr-004-gedcom-libraries.md)
- [ADR-006: Import/Export Strategy — Two-Phase Import, Round-Trip Export](../../decisions/adr-006-import-export.md)

## Dependencies

- **MVP1**: Database layer and tree management must be complete.
- **gedcom-parser**: In-app module `@vata-apps/gedcom-parser` for GEDCOM parsing and serialization (see [ADR-004](../../decisions/adr-004-gedcom-libraries.md)).
- **gedcom-date**: In-app module `@vata-apps/gedcom-date` for date parsing during import.

## Risks & Mitigation

| Risk                                     | Mitigation                                                    |
| ---------------------------------------- | ------------------------------------------------------------- |
| GEDCOM format variations across software | Robust parsing library; test with files from multiple sources |
| Large file performance                   | Progress indicators; transaction-based import                 |
| Data loss (incomplete GEDCOM mapping)    | Mapping documented; warnings for unmapped tags; tests         |

## Success Criteria

- [ ] Standard GEDCOM 5.5.1 files import successfully
- [ ] All primary entities imported (individuals, names, families, events, places)
- [ ] Export produces valid GEDCOM re-importable by Vata and other tools
- [ ] Error handling provides clear, actionable feedback
- [ ] Import/export UI functional and integrated with Home page
- [ ] Tested with real GEDCOM files from various sources

## Implementation Reference

Development phases and technical details: [MVP2 README](./README.md)
