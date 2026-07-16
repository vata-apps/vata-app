# SQLite Standards Review Checklist

Use this checklist when reviewing SQLite code or documentation.

## Connection

- [ ] PRAGMAs (WAL, `synchronous=NORMAL`, `foreign_keys=ON`, busy timeout, cache size, `temp_store=MEMORY`) match `src/db/connection.ts` — see SKILL.md §1
- [ ] PRAGMAs run before any transaction

## Queries

- [ ] No `SELECT *`; columns listed explicitly
- [ ] All queries parameterized (`$1`, `$2`); no string interpolation
- [ ] Multi-statement writes run as independent, individually-committed statements — **not** wrapped in `BEGIN TRANSACTION` / `COMMIT` / `SAVEPOINT` across separate calls (plugin-sql's per-call connection pooling makes this unreliable; see SKILL.md §3)
- [ ] Batch inserts use a single multi-row `INSERT ... VALUES (...), (...)` statement, not N calls wrapped in a transaction
- [ ] No N+1 patterns; use JOINs or batch queries where appropriate
- [ ] List queries use `LIMIT` (and `OFFSET` when paginating)
- [ ] Existence checks use `EXISTS`, not `COUNT(*) > 0`

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
