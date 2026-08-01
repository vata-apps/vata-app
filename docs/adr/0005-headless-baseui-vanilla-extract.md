# ADR-005: Headless UI Foundation — Base UI + Vanilla Extract

**Status**: Accepted
**Date**: 2026-07-11

**Decision**: UI foundation is **Base UI** (`@base-ui/react`) for behavior (dialogs, selects, focus management, accessibility — no imposed styling) plus **Vanilla Extract** (`@vanilla-extract/css`) for a typed, zero-runtime token contract (`src/design/theme.css.ts`, light + dark). Shared, behavior-owning wrappers live in `src/components/ui/`. Brand is restored as tokens; the specific palette and type choices are recorded below and superseded in place as the identity evolves. Migration is screen-by-screen; Radix Themes coexists until each screen migrates.

**Why**: A styled component library (Radix Themes) fit stock patterns but fought Vata's large bespoke surface (pedigree charts, relation editors, timelines) — every custom organism created a visible seam against the stock library. A typed token contract closes styling drift without banning a distinct visual identity.

**Alternatives considered**:

- **Stay on Radix Themes, styled directly** — rejected: fine for stock UI, but the seam against bespoke organisms is exactly where Vata spends most of its UI work.
- **shadcn/ui** — rejected: Tailwind + copy-paste components is a paradigm the maintainer wants to avoid.
- **Radix Themes + custom organisms on Radix Primitives** — rejected: this _is_ the seam, not a fix for it.

## Brand identity

**2026-08-01 — grayscale identity.** The token contract's palette and type choices now follow the **"Vata Design System"** Claude Design project, itself derived from the "Personnes" reference mockup: a strict grayscale palette (no hue anywhere — contrast and weight carry meaning), Spectral (serif, reserved for person names, drafts and empty states), IBM Plex Sans (UI/body), IBM Plex Mono (data). This supersedes the original 2026-07-11 choice below; the Base UI + Vanilla Extract architecture decision itself is unchanged.

**2026-07-11 — warm-earth identity (superseded).** Terracotta/sand/moss/ink in `oklch`, Geist Sans/Mono, Fraunces reserved for lineage moments (person names, hero, empty states).

## References

- [Design System](../ui/design-system.md)
