# ADR-011: Full-Width In-Tree Shell — Pages Own Their Panels

**Status**: Accepted
**Date**: 2026-06-02

**Decision**: The in-tree shell (`TreeShell`) renders only a persistent header + a full-width page body — no fixed three-column scaffold. Each page builds whatever panels it actually needs instead of inheriting an always-present shared layout. The four `*Sidebar` components and `EntityListPanel` are replaced by one `EntityTable` organism (list + loading/empty/error states + row navigation), reused by People, Families, Events, and Places.

**Why**: The old three-column shell (fixed left sidebar, centre page, reserved-but-unused right panel) left two of three columns either dead space or the _only_ real content — every centre page was a stub.

**Alternatives considered**:

- **Keep the three-column shell, fill panels later** — rejected: preserves dead space and stub pages indefinitely.
- **Move lists into the page but keep a narrow card list** — rejected: a narrow list stretched to full width reads as sparse; a table uses the space better.

## References

- [Layouts](../ui/layouts.md)
