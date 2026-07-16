# ADR-004: GEDCOM Libraries — In-App Modules, Extraction-Ready

**Status**: Accepted
**Date**: 2025-02-22

**Decision**: Build `gedcom-parser` and `gedcom-date` as two zero-dependency, self-contained modules inside the app (`src/gedcom-parser/`, `src/gedcom-date/`), each exposing a single public `index.ts` behind a stable path alias (`@vata-apps/gedcom-parser`, `@vata-apps/gedcom-date`). Only `app → gedcom-parser`, `app → gedcom-date`, and `gedcom-parser → gedcom-date` may cross the boundary, never the reverse — so a future extraction into standalone packages is a mechanical copy-out, not a rewrite.

**Alternatives considered**:

- **Existing npm packages** — none provide complete, typed, zero-dependency GEDCOM 5.5.1 support with serialization.
- **Separate packages from day one** — unnecessary overhead before the API has stabilized.

## References

- [GEDCOM 5.5.1 Mapping](../references/gedcom-551-mapping.md)
- [Date Formats](../references/date-formats.md)
