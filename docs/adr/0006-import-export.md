# ADR-006: Import/Export Strategy — Two-Phase Import, Round-Trip Export

**Status**: Accepted  
**Date**: 2025-02-22

## Context

GEDCOM import must handle complex interdependencies: families reference individuals, events reference places, and cross-references (XREFs) must be mapped to internal IDs. Export must produce valid GEDCOM that other software can read and that Vata can re-import.

## Decision

### Import

- **Two-phase import**:
  1. **Phase 1**: Import all individuals (without family links). Map GEDCOM XREFs to internal IDs.
  2. **Phase 2**: Import families and link members using the XREF-to-ID mapping from Phase 1.
- **Place caching**: Reuse existing places by matching full place names to avoid duplicates.
- **Transaction-based**: The entire import is wrapped in a single database transaction. If any step fails, the whole import rolls back — no partial data left behind.

### Export

- **Round-trip compatibility**: An exported GEDCOM file must be re-importable by Vata (and ideally by other software) without data loss.
- **Privacy option**: Optionally exclude living individuals from the export.
- **XREF generation**: Generate clean, sequential XREFs on export (I1, I2, F1, F2, etc.) regardless of internal IDs.

## Alternatives Considered

- **Single-pass import**: Process records in file order. Fails when a family record appears before its member individuals (common in GEDCOM files).
- **No transaction wrapping**: Simpler but risks leaving a corrupted partial tree if import fails midway.
- **Preserve original XREFs on export**: Would maintain continuity but original XREFs may conflict or be non-sequential.

## Consequences

**Positive**:
- Reliable import regardless of record order in the GEDCOM file
- No duplicate places created during import
- Database never left in an inconsistent state
- Clean, portable GEDCOM output

**Negative / Trade-offs**:
- Two-pass import is slightly slower than single-pass (acceptable for the file sizes involved)
- Place matching by full name string may miss near-duplicates (e.g., "Montreal, QC" vs "Montreal, Quebec")
- Privacy exclusion may break family links if a living individual is a key family member

## References

- [GEDCOM 5.5.1 Mapping](../references/gedcom-551-mapping.md)
