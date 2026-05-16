# Design System

The design system is built on Tailwind v4 (CSS-first via `@theme`) with Radix primitives and `tailwind-variants`.

Tokens live in [`src/styles/app.css`](../../src/styles/app.css) (`@theme` CSS variables in `oklch()`, including light/dark theming); UI wrappers live in [`src/components/ui/`](../../src/components/ui/). Browse them as a live surface in Storybook (`pnpm storybook`) — see [Storybook](./storybook.md).

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
