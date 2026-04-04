# ADR-003: Database Architecture — Dual DB, String IDs, Layer Separation

**Status**: Accepted  
**Date**: 2025-02-22

## Context

Vata manages multiple genealogical trees. Each tree is independent and can be large (thousands of records). The application also needs to store global metadata (list of trees, user preferences).

## Decision

Adopt a **dual-database architecture** with strict **layer separation**:

- **system.db**: One global database for application metadata (tree list, settings).
- **{tree-name}.db**: One SQLite file per genealogical tree.
- **Layers**: UI → Hooks (TanStack Query) → Managers (business logic) → Database (SQL).
- **IDs**: Store as INTEGER in SQLite, expose as prefixed strings in TypeScript (e.g., `I-0001` for individuals, `F-0001` for families).

## Alternatives Considered

- **Single database for everything**: Simpler but makes tree deletion/export harder and risks cross-contamination between trees.
- **Integer IDs everywhere**: Simpler but less readable in logs/debugging. Prefixed strings make entity types immediately obvious.

## Consequences

**Positive**:
- Tree isolation: deleting a tree is just deleting a file
- Easy backup: copy a single .db file
- Clean separation of concerns across layers
- Readable, type-safe entity IDs

**Negative / Trade-offs**:
- Must manage multiple database connections (open/close tree DB)
- ID conversion overhead (formatEntityId / parseEntityId) at the DB boundary
- Cannot query across trees in a single SQL statement

## References

- [Architecture Overview](../architecture/overview.md)
- [Database Schema](../architecture/database-schema.md)
- [Data Flow](../architecture/data-flow.md)
