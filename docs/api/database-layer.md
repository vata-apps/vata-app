# Database Layer API

The database layer is the only code that runs SQL. It exposes typed CRUD functions; the UI, hooks, and managers never touch SQL directly.

This document describes the **contract and conventions** of the layer. It deliberately does **not** re-list function signatures or type definitions — those live in the TypeScript source, which is the single source of truth and is type-checked, so it never goes stale:

- Domain types — `src/types/database.ts`
- Connection management — `src/db/connection.ts`
- System DB functions — `src/db/system/`
- Tree DB functions — `src/db/trees/`

See [Database Schema](../architecture/database-schema.md) for the table layout.

## Entity IDs

Primary entity IDs (individuals, families, events, places, sources, repositories) are exposed in the API as **prefixed strings** (e.g. `I-0001`, `F-0001`). The database stores `INTEGER` keys; conversion happens at the DB boundary via `src/lib/entityId.ts`:

- **DB → API**: `formatEntityId(prefix, raw.id)` when mapping rows to entities.
- **API → DB**: `parseEntityId(id)` when passing an id into SQL (e.g. `WHERE id = $1`).

See [Database Schema — Conventions / IDs](../architecture/database-schema.md#ids) for the prefix table and rationale.

## Connection Management

The app holds two SQLite databases, managed in `src/db/connection.ts`. Every connection gets the standard PRAGMAs (WAL, foreign keys ON, busy timeout) applied on open.

| Function           | Behavior                                                             |
| ------------------ | -------------------------------------------------------------------- |
| `getSystemDb()`    | Returns the system DB; creates and initializes it on the first call. |
| `openTreeDb(file)` | Opens a tree DB; closes any previously open tree DB first.           |
| `getTreeDb()`      | Returns the currently open tree DB; **throws** if none is open.      |
| `closeTreeDb()`    | Closes the currently open tree DB.                                   |
| `isTreeDbOpen()`   | Whether a tree DB is currently open.                                 |

The tree DB lifecycle is owned by the `/tree/$treeId` route — see [App Structure](../architecture/app-structure.md).

## Layer conventions

Every file in `src/db/system/` and `src/db/trees/` follows the same shape:

1. A `Raw*` type — snake_case, mirrors the DB columns.
2. A public domain type — camelCase, used everywhere else (defined in `src/types/database.ts`).
3. A `mapRaw*()` mapper — raw row → public type, formatting integer keys into prefixed IDs.
4. Exported `async` CRUD functions — receive and return public types, never raw rows.

Rules: explicit column lists (never `SELECT *`), parameterized queries (`$1`, `$2`), IDs converted at the boundary. The full pattern and a scaffold template live in CLAUDE.md ("DB Layer Pattern") and the `sqlite-standards` skill (§8).

## Modules

### System database (`system.db`)

| Module            | Owns                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `system/trees.ts` | Tree records: list, create, update, delete, stats, recently-opened. |

### Tree database (`<tree>.db`)

| Module                            | Owns                                                                     |
| --------------------------------- | ------------------------------------------------------------------------ |
| `trees/individuals.ts`            | Individuals — CRUD, count, search, orphan queries.                       |
| `trees/names.ts`                  | Name records (an individual has many; one primary) + display formatting. |
| `trees/families.ts`               | Families and their husband / wife / child members.                       |
| `trees/events.ts`                 | Events and their participants (principal, witness, officiant, …).        |
| `trees/event-timeline.ts`         | Read model: an individual's or family's events assembled in order.       |
| `trees/places.ts`                 | Places (hierarchical) and place types.                                   |
| `trees/sources.ts`                | Sources.                                                                 |
| `trees/citations.ts`              | Citations linking a source to an entity.                                 |
| `trees/citations-with-details.ts` | Read model: citations joined with source and target details.             |
| `trees/repositories.ts`           | Repositories that hold sources.                                          |
| `trees/files.ts`                  | File / media records.                                                    |

For the exact function signatures, open the module file — they are typed and TypeScript-checked.

## Types

All domain types — entities, `Create*Input` / `Update*Input` shapes, and enums (`Gender`, `NameType`, …) — are defined in `src/types/database.ts`. That file is the source of truth; do not duplicate type definitions here.
