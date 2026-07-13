# Design System

The UI foundation is **Base UI** (`@base-ui/react`) for headless behavior + **Vanilla Extract** (`@vanilla-extract/css`) for zero-runtime, typed styling. The decision and its rationale are in [ADR-0014](../adr/0014-headless-baseui-vanilla-extract.md).

**Behavior layer.** Base UI supplies Dialog, Select, Switch, Popover, and similar interactive primitives — accessibility, focus management, ARIA, and keyboard behavior — with no imposed styling. Components are consumed through the shared primitive layer at `src/components/ui/` (see below), not imported directly at call sites.

**Token layer.** `src/design/theme.css.ts` is the single source of visual truth: a typed contract of CSS custom properties (`vars.*`) covering color, radius, and font, plus static `space` and `text` token exports consumed by recipe variant maps. Light and dark schemes are both declared here. No hand-authored global CSS palette or escape-hatch `app.css`.

**Brand.** Warm-earth identity: terracotta accent, warm sand neutrals, moss/ink secondaries — all `oklch`. **Geist Sans** for UI and body, **Geist Mono** for data (dates, IDs), **Fraunces** italic for lineage moments (a person's name, the home hero, empty states). Fonts are self-hosted via `@fontsource/*`.

## Primitive layer — src/components/ui/

Shared control primitives live here. A component earns a place in this directory by encapsulating behavior a consumer should never have to remember — not by being a styled alias. See [ADR-0015](../adr/0015-ui-primitive-layer.md) for the admission rule.

Current primitives: `Button`, `TextField`, `Select`, `SegmentedControl`, `Switch`, `Dialog`, `Popover`, `Typography`. All export from `src/components/ui/index.ts`.

**Layout is not here.** Flex / Grid / Stack belong in surface-local stylesheets where the specific spacing context lives.

## Organisms — src/components/

Components in `src/components/` that are not in `ui/` are **application organisms** — they compose primitives and add applicative behavior (routing, data-fetching, form state). Organisms never re-export primitives; primitives never import organisms.

**Icons** come from a curated Lucide registry at [`src/components/icon.tsx`](../../src/components/icon.tsx) — pages import from the registry, never from `lucide-react` directly.

**Source wins.** This document records design intent; it does not reproduce the tokens or component specs. When this document and the source disagree, the source is correct — open a PR to bring this file back in sync.

## Design Principles

### 1. Clarity

Clearly hierarchized information, readable typography, generous spacing.

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
