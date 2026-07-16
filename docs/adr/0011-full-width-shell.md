# ADR-011: Full-Width In-Tree Shell — Pages Own Their Panels

**Status**: Accepted
**Date**: 2026-06-02

**Decision**: The in-tree shell (`TreeShell`) renders only a persistent header + a full-width page body. Each page builds whatever panels it actually needs (a list, a detail rail) instead of inheriting an always-present shared layout. Entity lists (People, Families, Events, Places) render as a full-width table directly in the page body.

**Why**: A shared side-panel scaffold only pays off when most pages actually use it. Left as dead space or forcing every page into a stub otherwise — full width lets each section use exactly the space it needs.

**Alternatives considered**:

- **A shared side-panel scaffold, filled in later** — rejected: preserves dead space and stub pages indefinitely.
- **Move lists into the page but keep a narrow card list** — rejected: a narrow list stretched to full width reads as sparse; a table uses the space better.

## References

- [Layouts](../ui/layouts.md)
