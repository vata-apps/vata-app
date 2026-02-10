# SQLite Performance and Data Integrity Standards

Apply this when writing or reviewing any SQLite-related code or documentation in the project. The app uses SQLite via `tauri-plugin-sql` with a dual-database architecture (`system.db` + per-tree `.db` files).

## When to Apply

- Writing or reviewing SQLite code (queries, schema, migrations)
- Editing database-related documentation: `docs/architecture/database-schema.md`, `docs/api/database-layer.md`
- Creating or modifying DB layer functions in `src/db/**`

---

## 1. Connection Initialization PRAGMAs

Every database connection **must** execute these PRAGMAs immediately after opening (e.g. in `getSystemDb()` and `openTreeDb()` in `src/db/connection.ts`):

```sql
PRAGMA journal_mode = WAL;        -- Write-Ahead Logging; better concurrency and write performance
PRAGMA synchronous = NORMAL;      -- Safe with WAL; good durability/performance balance
PRAGMA foreign_keys = ON;          -- CRITICAL: SQLite disables foreign keys by default
PRAGMA busy_timeout = 5000;       -- Wait up to 5s on lock instead of immediate failure
PRAGMA cache_size = -20000;       -- 20MB page cache (negative value = KB)
PRAGMA temp_store = MEMORY;       -- Temp tables and indexes in memory
```

Execute PRAGMAs **before** any transaction. They do not persist across connections; set them on every `Database.load()`.

---

## 2. Schema Design Rules

- **NOT NULL**: Use on every column unless null is an explicit business requirement.
- **CHECK constraints**: Enforce enum and validated values (e.g. `gender IN ('M', 'F', 'U')`, `role IN ('husband', 'wife', 'child')`).
- **Foreign keys**: Define explicit `ON DELETE` action (`CASCADE` or `SET NULL`); never rely on default behavior without documenting it.
- **Indexes**: Create only for columns used in `WHERE`, `JOIN`, or `ORDER BY`. Document which queries each index serves.
- **Composite indexes**: Order columns by selectivity (most selective first).
- **UNIQUE**: Use to enforce business rules at the DB level (e.g. `UNIQUE(family_id, individual_id, role)`).
- **DEFAULT**: Use for columns with known defaults (e.g. `created_at`, `is_primary`).

---

## 3. Query Standards

- **Never use `SELECT *`**. List columns explicitly.
- **Always use parameterized queries** with `$1`, `$2`, etc. Never concatenate or interpolate user input into SQL.
- **Multi-statement writes**: Always wrap in `BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`; on failure, execute `ROLLBACK` before rethrowing.
- **Upserts**: Prefer `INSERT OR IGNORE` or `INSERT OR REPLACE` when appropriate instead of check-then-insert.
- **Complex queries**: Use `EXPLAIN QUERY PLAN` to verify index usage.
- **N+1 avoidance**: Prefer a single query with `JOIN` over multiple sequential queries.
- **Pagination**: Use `LIMIT` and `OFFSET` (or keyset) for list queries.
- **Batch inserts**: Perform multiple inserts inside one transaction, not one transaction per row.

---

## 4. Data Integrity Enforcement

- **Foreign keys**: Ensure `PRAGMA foreign_keys = ON` on every connection (see §1).
- **After migrations**: Run `PRAGMA foreign_key_check` to detect constraint violations.
- **Corruption detection**: Run `PRAGMA integrity_check` on database open or periodically; handle non-`ok` result.
- **Validation**: Enforce business rules in the Manager layer and structural constraints in the DB (NOT NULL, CHECK, FK).
- **Deletes**: Never delete rows that are referenced unless cascades or explicit cleanup are in place.

---

## 5. Performance Patterns

- **WAL**: Use for all databases (set via PRAGMA on connection).
- **Counts**: Avoid `COUNT(*)` on large tables when an approximate or cached count suffices; maintain counter columns (e.g. `individual_count`, `family_count` in `trees`) and keep them updated in the same transaction as changes.
- **Covering indexes**: When a query only needs indexed columns, put those columns in the index to avoid table lookups.
- **Existence checks**: Use `EXISTS (SELECT 1 FROM ... WHERE ...)` instead of `COUNT(*) > 0`.
- **Timestamps**: Prefer `datetime('now')` as column default for consistency with SQLite.
- **List queries**: Always use `LIMIT` (and `OFFSET` when paginating) for data shown in the UI.

---

## 6. Documentation Standards

- **PRAGMAs**: Document all connection PRAGMAs and their rationale.
- **Indexes**: Each index in schema docs should have a short comment stating which query or access pattern it supports.
- **Migrations**: Any schema change must be done via a migration script; do not document ad-hoc ALTER without a migration path.
- **Schema version**: Track in `tree_meta` (e.g. `schema_version`) and bump on schema changes.

---

## Review Checklist

### Connection

- [ ] PRAGMAs executed on every connection: `journal_mode=WAL`, `synchronous=NORMAL`, `foreign_keys=ON`, `busy_timeout=5000`, `cache_size=-20000`, `temp_store=MEMORY`
- [ ] PRAGMAs run before any transaction

### Queries

- [ ] No `SELECT *`; columns listed explicitly
- [ ] All queries parameterized (`$1`, `$2`); no string interpolation
- [ ] Multi-statement writes wrapped in `BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`
- [ ] On error, `ROLLBACK` executed before rethrowing
- [ ] No N+1 patterns; use JOINs or batch queries where appropriate
- [ ] List queries use `LIMIT` (and `OFFSET` when paginating)
- [ ] Existence checks use `EXISTS`, not `COUNT(*) > 0`
- [ ] Batch inserts in a single transaction

### Schema

- [ ] `NOT NULL` on columns unless null is required
- [ ] `CHECK` constraints for enum/validated values
- [ ] Foreign keys have explicit `ON DELETE` (CASCADE or SET NULL)
- [ ] Each index justified (which query or access pattern it supports)
- [ ] Composite indexes ordered by selectivity
- [ ] `UNIQUE` used where business rules require it

### Integrity

- [ ] Foreign keys enforced (PRAGMA on connection)
- [ ] Migrations followed by `PRAGMA foreign_key_check` where applicable
- [ ] `PRAGMA integrity_check` on open or periodically for corruption detection
- [ ] Deletes only where cascades or explicit cleanup exist

### Documentation

- [ ] PRAGMAs and rationale documented
- [ ] Index purpose documented for each index
- [ ] Schema changes have migration scripts
- [ ] Schema version tracked (e.g. in `tree_meta`)
