# Design System

The UI foundation is **Base UI** (`@base-ui/react`) for behavior and **Vanilla Extract** (`@vanilla-extract/css`) for styling. Base UI owns the expensive, generic parts of each component — focus management, keyboard navigation, accessibility, portalling — with no imposed chrome. Vanilla Extract turns the visual identity into a typed, zero-runtime token contract in [`src/design/theme.css.ts`](../../src/design/theme.css.ts). The decision and its rationale are in [ADR-0014](../adr/0014-headless-baseui-vanilla-extract.md); it supersedes the earlier Radix Themes strategy in [ADR-007](../adr/0007-adopt-radix-themes.md) and [ADR-010](../adr/0010-pure-radix-themes.md).

Shared primitives live in [`src/components/ui/`](../../src/components/ui/). Each file is a thin wrapper: it imports a Base UI part, maps its states to data attributes, and styles it from `vars.*`. These are **behavior-owning primitives** — they add no application logic. New primitives are added only when a Base UI part is needed on multiple screens and the styling belongs to the shared contract.

Internal components under [`src/components/`](../../src/components/) (outside `ui/`) are reserved for **application organisms** — components used across the app that compose primitives and add applicative behavior (e.g. `tree-shell.tsx`, `tree-nav.tsx`, `app-status-bar.tsx`, `preferences-popover.tsx`, `dropzone.tsx`). Never a restyled atom or molecule.

**Brand tokens** are the single source of visual truth in [`src/design/theme.css.ts`](../../src/design/theme.css.ts): colors, radii, shadows, fonts, z-indexes, spacing, and type sizes. Raw values live only there; every component reads them through `vars.*`. The warm-earth identity is terracotta (clay) accent over warm sand neutrals, all in oklch. **Geist Sans** is the UI and body font, **Geist Mono** is for data (dates, IDs), and **Fraunces (italic)** is reserved for lineage moments — a person's name, the home hero, empty states, display-scale section titles — never for dense UI chrome. Fonts are self-hosted via `@fontsource/*`.

Light / dark / system appearance is bound to the persisted Zustand theme preference. [`src/components/app-theme.tsx`](../../src/components/app-theme.tsx) resolves the preference and writes it to `document.documentElement.dataset.theme`; `src/design/theme.css.ts` maps the attribute to the light or dark token set. Radix Themes still wraps the app during the migration so unmigrated screens keep working, but it carries no brand overrides.

**Primitive chrome lives in a `vata-primitives` cascade layer.** Layered declarations always lose to unlayered ones, so a feature overriding a primitive via `className` reliably wins without depending on which `.css.ts` the bundler happened to emit first.

**Customization ceiling is token-level.** Components derive every visual value from the token contract; component anatomy (heights, padding, density) is authored once in the primitive stylesheet and not tuned per call site. Genuinely bespoke surfaces (e.g. a future pedigree graph) are decided case by case and must stay inside the token contract; escaping to raw values requires amending the contract, not adding one-off CSS.

**Icons** come from a curated Lucide registry at [`src/components/icon.tsx`](../../src/components/icon.tsx) — pages import from the registry, never from `lucide-react` directly. The registry is icon governance, not a styled wrapper.

**Source wins.** This document records design intent and decisions; it does not reproduce the tokens or component specs. When this document and the source disagree, the source is correct — open a PR to bring this file back in sync.

## Design Principles

### 1. Clarity

Clear visual hierarchy, readable typography, generous spacing.

### 2. Efficiency

Main actions easily accessible, keyboard shortcuts, ubiquitous search.

### 3. Familiarity

Standard UX patterns, predictable behaviors, desktop conventions respected.

### 4. Flexibility

Adaptable interface, resizable panels, light/dark theme.

## Responsive Breakpoints

Although desktop-first, the interface adapts to window size. The two thresholds are a deliberate decision:

| Range                  | Layout behavior                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Compact (< 1024px)     | Icon-only nav buttons; any page-owned panel collapses to an overlay or standalone window; menus collapse into dropdowns. |
| Standard (1024–1440px) | Full-label nav; full-width page body; any page-owned panel inline.                                                       |
| Wide (> 1440px)        | Full-label nav; wide page body; page-owned panels inline.                                                                |

## Accessibility

The project commits to **WCAG 2.1 AA**:

1. **Contrast** — minimum ratio 4.5:1 for text, 3:1 for UI elements.
2. **Visible focus** — a visible focus ring on every interactive element.
3. **Keyboard** — full keyboard navigation.
4. **Labels** — every input has an associated label.
5. **Errors** — descriptive error messages associated with their fields.
