# Design System

The UI foundation is **Radix Themes** (`@radix-ui/themes`), consumed directly. Components are imported at call sites — `import { Button, Dialog, Flex } from '@radix-ui/themes'` — with no in-house wrapper layer. The decision and its rationale are in [ADR-007](../adr/0007-adopt-radix-themes.md).

There is **no `src/components/ui/` directory**. Internal components under [`src/components/`](../../src/components/) are reserved for **application organisms** — components used across the app that compose Radix Themes and add applicative behavior (e.g. `tree-shell.tsx`, `tree-nav.tsx`, `app-status-bar.tsx`, `preferences-popover.tsx`, `dropzone.tsx`). Never a restyled atom or molecule.

**Brand tokens** are set on the `<Theme>` provider in [`src/components/app-theme.tsx`](../../src/components/app-theme.tsx): `accentColor="bronze"`, `grayColor="sand"`, `radius="medium"`. Light / dark / system appearance is bound to the persisted Zustand theme preference. The Geist font is kept via a `--default-font-family` override and self-hosted `@font-face` blocks; [`src/styles/app.css`](../../src/styles/app.css) is just the Radix Themes stylesheet import plus those font declarations.

**Customization ceiling is token-level.** Accent, gray, radius, and scaling are tuned on `<Theme>`; component anatomy (heights, padding, density) is Radix's and is not tuned per component. Genuinely bespoke surfaces (e.g. a future pedigree graph) use scoped local CSS, decided case by case.

**Icons** come from a curated Lucide registry at [`src/components/icon.tsx`](../../src/components/icon.tsx) — pages import from the registry, never from `lucide-react` directly. The registry is icon governance, not a styled wrapper.

**Source wins.** This document records design intent and decisions; it does not reproduce the tokens or component specs. When this document and the source disagree, the source is correct — open a PR to bring this file back in sync.

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

| Range                  | Layout behavior                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| Compact (< 1024px)     | Collapsed sidebar (icons only); detail panel as overlay or standalone window; menus collapse into dropdowns. |
| Standard (1024–1440px) | Expanded sidebar; centered main content; optional detail panel.                                              |
| Wide (> 1440px)        | Expanded sidebar; wide main content; detail panel always visible.                                            |

## Accessibility

The project commits to **WCAG 2.1 AA**:

1. **Contrast** — minimum ratio 4.5:1 for text, 3:1 for UI elements.
2. **Visible focus** — a visible focus ring on every interactive element.
3. **Keyboard** — full keyboard navigation.
4. **Labels** — every input has an associated label.
5. **Errors** — descriptive error messages associated with their fields.
