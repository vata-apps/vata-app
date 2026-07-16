# ADR-007: Headless UI Foundation — Base UI + Vanilla Extract

**Status**: Accepted
**Date**: 2026-07-11

**Decision**: UI foundation is **Base UI** (`@base-ui/react`) for behavior (dialogs, selects, focus management, accessibility — no imposed styling) plus **Vanilla Extract** (`@vanilla-extract/css`) for a typed, zero-runtime token contract (`src/design/theme.css.ts`, light + dark). Shared, behavior-owning wrappers live in `src/components/ui/`. Brand is restored as tokens — terracotta/sand/moss/ink in `oklch`, Geist Sans/Mono, Fraunces reserved for lineage moments (person names, hero, empty states). Migration is screen-by-screen; Radix Themes coexists until each screen migrates.

**Why**: A styled component library (Radix Themes) fit stock patterns but fought Vata's large bespoke surface (pedigree charts, relation editors, timelines) — every custom organism created a visible seam against the stock library. A typed token contract closes styling drift without banning a distinct visual identity.

**Alternatives considered**:

- **Stay on Radix Themes, styled directly** — rejected: fine for stock UI, but the seam against bespoke organisms is exactly where Vata spends most of its UI work.
- **shadcn/ui** — rejected: Tailwind + copy-paste components is a paradigm the maintainer wants to avoid.
- **Radix Themes + custom organisms on Radix Primitives** — rejected: this _is_ the seam, not a fix for it.

## References

- [Design System](../ui/design-system.md)
