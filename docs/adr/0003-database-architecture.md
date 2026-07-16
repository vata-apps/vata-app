# ADR-003: Database Architecture — Dual DB, String IDs, Layer Separation

**Status**: Accepted
**Date**: 2025-02-22

**Decision**: **system.db** for app-wide metadata (tree list, settings) + one **`<tree>.db`** per genealogical tree. Strict layering: UI → Hooks (TanStack Query) → Managers → DB. IDs are `INTEGER` in SQLite, exposed as prefixed strings in TypeScript (`I-`, `F-`, `E-`, `P-`).

**Alternatives considered**:

- **Single database for everything** — simpler, but complicates tree deletion/export and risks cross-tree contamination.
- **Integer IDs everywhere** — simpler, but prefixed strings make entity types unambiguous in logs and debugging.

## References

- [Architecture Overview](../architecture/overview.md)
- [Database Schema](../architecture/database-schema.md)
