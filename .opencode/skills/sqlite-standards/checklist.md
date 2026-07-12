# SQLite Standards Review Checklist

Use this checklist when reviewing SQLite code or documentation.

## Connection

- [ ] PRAGMAs executed on every connection: `journal_mode=WAL`, `synchronous=NORMAL`, `foreign_keys=ON`, `busy_timeout=5000`, `cache_size=-20000`, `temp_store=MEMORY`
- [ ] PRAGMAs run before any transaction

## Queries

- [ ] No `SELECT *`; columns listed explicitly
- [ ] All queries parameterized (`$1`, `$2`); no string interpolation
- [ ] Multi-statement writes wrapped in `BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`
- [ ] On error, `ROLLBACK` executed before rethrowing
- [ ] No N+1 patterns; use JOINs or batch queries where appropriate
- [ ] List queries use `LIMIT` (and `OFFSET` when paginating)
- [ ] Existence checks use `EXISTS`, not `COUNT(*) > 0`
- [ ] Batch inserts in a single transaction

## Schema

- [ ] `NOT NULL` on columns unless null is required
- [ ] `CHECK` constraints for enum/validated values
- [ ] Foreign keys have explicit `ON DELETE` (CASCADE or SET NULL)
- [ ] Each index justified (which query or access pattern it supports)
- [ ] Composite indexes ordered by selectivity
- [ ] `UNIQUE` used where business rules require it

## Integrity

- [ ] Foreign keys enforced (PRAGMA on connection)
- [ ] Migrations followed by `PRAGMA foreign_key_check` where applicable
- [ ] `PRAGMA integrity_check` on open or periodically for corruption detection
- [ ] Deletes only where cascades or explicit cleanup exist

## Documentation

- [ ] PRAGMAs and rationale documented
- [ ] Index purpose documented for each index
- [ ] Schema changes have migration scripts
- [ ] Schema version tracked (e.g. in `tree_meta`)
