# Success Metrics

## Performance Targets

These targets apply to a tree of ~2,000 individuals (Robert persona).

| Metric             | Target    | Measured at             |
| ------------------ | --------- | ----------------------- |
| Application startup | < 2s     | Cold start to home page |
| Tree opening       | < 500ms   | Click to loaded view    |
| Search             | < 200ms   | Keystroke to results    |
| CRUD operations    | < 100ms   | Action to confirmation  |

Source: [Architecture Overview — Performance](../architecture/overview.md#performance).

## Reliability

- **Zero data loss**: All write operations use SQLite transactions. A crash mid-operation must not corrupt the database.
- **GEDCOM round-trip**: Exporting a tree and re-importing the GEDCOM file must produce an equivalent tree (no silent data loss).
- **Database integrity**: Foreign key constraints enforced (`PRAGMA foreign_keys = ON`). Referential integrity maintained across all entity relationships.

## Functional Completeness (Definition of Done per MVP)

### MVP1 — Foundation

- [ ] Application starts (`pnpm tauri dev`) with no console errors
- [ ] system.db created automatically on first launch
- [ ] Tree CRUD operations functional (create, open, rename, delete)
- [ ] Home page displays and manages the tree list
- [ ] TypeScript configuration with path aliases
- [ ] ESLint and Prettier configured and passing

### MVP2 — GEDCOM

- [ ] Standard GEDCOM 5.5.1 files import successfully
- [ ] All primary entities imported (individuals, families, events, places)
- [ ] Export produces valid, re-importable GEDCOM
- [ ] Error handling with clear feedback
- [ ] Import/export UI integrated

### MVP3 — Primary Entities

- [ ] Complete CRUD for individuals, names, families, events, places
- [ ] Relationships between entities work correctly
- [ ] Dates parse and display correctly (via in-app module `@vata-apps/gedcom-date`)
- [ ] Navigation between entities functional
- [ ] Data integrity maintained under all operations

### MVP4–6

Definition of Done to be established during implementation.

## Code Quality

- **Type safety**: Strict TypeScript (`strict: true`), no `any` types.
- **Linting**: ESLint passes with zero errors.
- **Formatting**: Prettier check passes.
- **No console errors**: Application runs without runtime errors in the console.
- **No SELECT ***: All SQL queries list columns explicitly (enforced by convention and linting rule).
