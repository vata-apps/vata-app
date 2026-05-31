# ADR-007: UI Foundation — Adopt Radix Themes, Drop Tailwind + Wrapper Layer

**Status**: Accepted — superseded in part by [ADR-010](./0010-pure-radix-themes.md) (2026-05-31)
**Date**: 2026-05-16

> **Note (2026-05-31):** [ADR-010](./0010-pure-radix-themes.md) removes three things this ADR preserved — the Geist/Fraunces/Geist Mono fonts, the custom brand palette, and scoped local CSS as an escape hatch. The Radix Themes foundation, the no-wrapper-layer rule, and the kept Lucide icon registry all still stand.

## Context

[ADR-005](./0005-ui-strategy.md) settled on Radix **Primitives** + Tailwind v4 + `tailwind-variants`, with hand-rolled wrappers under `src/components/ui/`. By 2026-05 that surface had grown to 13 wrappers, each carrying its own variant recipe, Storybook story, and `play()` test.

Vata is built by a single maintainer wearing many hats. Hand-maintaining a design system — component anatomy, variants, accessibility edge cases, stories, tests — and keeping a uniform visual language from drifting over time is not sustainable without a dedicated team. The wrapper layer reproduced exactly that ongoing cost.

The UI surface is still tiny (one page, the in-tree shell, a handful of modals). This is the cheapest moment a foundation swap will ever cost.

## Decision

- **UI foundation**: **Radix Themes** (`@radix-ui/themes`), consumed **directly**. No `src/components/ui/` wrapper layer — `import { Button } from '@radix-ui/themes'` at call sites.
- **Internal components**: reserved for **application organisms only** — components used across the app that compose Radix Themes and add applicative behavior (e.g. `tree-shell`, `tree-nav`, `dropzone`). Never a restyled atom/molecule.
- **Customization is token-level only**, via the `<Theme>` provider: built-in **`brown`** accent + **`sand`** gray, plus radius and scaling. Component anatomy (heights, padding, density) is Radix's — not tuned per component.
- **Font**: **Geist kept**, via the `--default-font-family` CSS variable + existing self-hosted `@font-face` blocks.
- **Tailwind removed entirely** — `tailwindcss`, `tailwind-variants`, `tailwind-merge`, and the Vite plugin. Radix Themes layout primitives (`Flex`, `Grid`, `Box`) and spacing props replace utility-class layout. `app.css` reduces to the theme import + `@font-face`.
- **Storybook removed** — the `play()`-as-component-test model goes with it.
- **Curated Lucide icon registry kept** — it is icon _governance_, not a styled wrapper; relocated out of `src/components/ui/`.

## Why

- **Drift prevention is structural.** Components are no longer owned, so they cannot diverge — the anti-drift guarantee a solo maintainer cannot enforce by discipline alone.
- **Maintenance shed.** No hand-written variants, accessibility, stories, or tests for UI primitives. Dark mode is handled by Radix's `appearance`.
- **Identity preserved where it is cheap.** Terracotta → built-in `brown`, cream → `sand`, Geist retained — brand survives without a custom palette to maintain.

## Alternatives Considered

- **Keep the ADR-005 stack** — rejected: perpetual solo maintenance of 13+ wrappers, and Tailwind utilities left an open drift vector.
- **shadcn/ui (again)** — rejected: copy-paste component source is maximally drift-prone and still fully self-maintained — the worst fit for the anti-drift goal.
- **Custom 12-step accent palette** — rejected: the ADR-005 design tokens were a proof of concept, not fixed; built-in Radix Colors scales remove palette maintenance outright.
- **Keep Tailwind as an escape hatch** — rejected: a permanent utility escape hatch is the primary drift vector; genuinely bespoke surfaces will use scoped local CSS instead.

## Consequences

**Positive**:

- No design-system component maintenance — variants, accessibility, theming come from Radix Themes.
- Visual drift is structurally prevented, not policed.
- A single styling system; `app.css` collapses to a theme import + fonts.

**Negative / Trade-offs**:

- Component anatomy is fixed by Radix Themes — no per-component micro-tuning of heights, padding, or density.
- Loss of Tailwind's arbitrary-value escape hatch; the 5-step radius presets replace the bespoke radius scale.
- Genuinely bespoke future surfaces (e.g. a pedigree graph) will need scoped local CSS, decided case by case.
- A one-time cross-layer migration: every page, organism, and modal is rewritten off the wrapper layer.

## References

- [ADR-005: UI Strategy](./0005-ui-strategy.md) — superseded by this ADR
- [Design System](../ui/design-system.md)
