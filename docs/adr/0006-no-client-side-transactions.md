# ADR-006: No Client-Side SQL Transactions

**Status**: Accepted
**Date**: 2026-08-12

**Decision**: No manager or DB-layer function issues `BEGIN`/`COMMIT`/`ROLLBACK` from TypeScript. A multi-statement write commits each statement on its own. Where a partial failure would leave the tree in a state worse than "some of this didn't happen" — a brand-new tree from a failed import, for example — the caller cleans up explicitly (e.g. `TreeManager.delete`) instead of relying on a transaction to undo it.

**Why**: `@tauri-apps/plugin-sql` checks out a connection from an `sqlx::SqlitePool` per `execute()`/`select()` call (`max_connections: 10`, FIFO idle queue). `BEGIN` issued on one call and `COMMIT` issued on a later call aren't guaranteed to land on the same pooled connection — a concurrent query elsewhere in the app (this app fires several independent queries per screen) can interleave and land on the connection mid-transaction. See [tauri-apps/plugins-workspace#886](https://github.com/tauri-apps/plugins-workspace/issues/886). Two call sites (`FamilyManager.create`, the GEDCOM importer) used `BEGIN TRANSACTION` anyway, in contradiction with the documented, followed-everywhere-else policy — see issue #244. The two didn't just risk losing atomicity: a `COMMIT` landing on the wrong connection can raise "cannot commit — no transaction is active", the caught `ROLLBACK` then either masks that error or discards a connection's uncommitted work, and in the worst ordering a `BEGIN`'d connection returns to the idle pool holding SQLite's write lock — every subsequent write then hangs on `busy_timeout` until the app restarts.

**Consequences**:

- A per-record or per-step failure can leave a partial write (e.g. a family row created without its members). This is an accepted trade-off, not an oversight — it's strictly better than the failure modes above.
- Bulk operations (GEDCOM import) catch per-record errors and continue rather than aborting the whole batch, so one malformed record doesn't cost the researcher everything else in the file — the resulting partial state is reported in `ImportStats.errors`, not hidden.
- Operations that create a new top-level resource and then populate it (GEDCOM import creating a tree) clean up that resource on failure, so a crash doesn't leave a broken half-populated entity sitting in the UI.
- If a future feature genuinely needs atomic multi-statement writes, the only correct shape is a Rust-side Tauri command owning one `sqlx` transaction end to end — not attempted here, since none of today's call sites need it badly enough to justify a new IPC command surface.

**Alternatives considered**:

- **Keep using `BEGIN`/`COMMIT` from TypeScript, document the risk** — rejected: this was already the state before the fix (documented as broken in three files, violated in two), and the violations happened anyway. A policy only reviewers read isn't enforced.
- **Add a Rust-side transactional command now** — rejected as premature: no current write is complex enough to justify the new command surface and IPC contract; revisit if one is.

## References

- [Data Flow](../architecture/data-flow.md)
- [Tech Stack](../architecture/tech-stack.md)
