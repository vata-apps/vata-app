---
name: design-system-standards
description: Conventions for vata-app's UI — when to reuse a Radix Themes component, when to compose inline, and when an application organism justifies a new internal component. Token-level customization rules and duplication/drift heuristics. Use when designing or reviewing UI under src/components/** or src/pages/**.
---

# Design System Standards — Vata

Vata's UI is **Radix Themes** (`@radix-ui/themes`), consumed directly at call sites — no `src/components/ui/` wrapper layer. Current source of truth: [ADR-010](../../../docs/adr/0010-pure-radix-themes.md) (pure Radix Themes — no brand overrides, no custom CSS). ADR-007 is the earlier decision it supersedes in part.

## Decision tree

For any UI element, take the first step that fits:

1. **Reuse a Radix Themes component** — the default. Import it directly and pick its `variant` / `size` / `color` props.
2. **Compose Radix Themes inline** — when the need is a layout of known components (a header is `Avatar` + `Heading` + a `Button` row in a `Flex`). Build it in the page, no new file. Layout uses Radix primitives (`Flex`, `Grid`, `Box`) and spacing props.
3. **Add an internal application organism** in `src/components/` — only for a component used across the app that composes Radix Themes and adds applicative behaviour (the tree shell, navigation, a dropzone). Never a restyled atom or molecule: reaching for a "styled Button" means stop and use Radix's. A new organism ships in the same commit with JSDoc and a colocated `*.test.tsx`.

There is **no custom-CSS escape hatch**: ADR-010 bans scoped local CSS. If Radix Themes genuinely covers nothing (e.g. a pedigree graph), that is an ADR-010 amendment — raise it, don't add a `.css` file.

## No brand overrides, no custom CSS (ADR-010)

The single `<Theme>` provider (`src/components/app-theme.tsx`) sets **only `appearance`** (light/dark). No `accentColor` / `grayColor` / `radius` / scaling overrides — everything falls to Radix defaults. Component anatomy — heights, padding, density — is Radix's, never tuned per component.

Reject in review (these are grep-gated by ADR-010):

- Hardcoded colour literals (`oklch()`, hex, `rgb()`) — colour comes from the Radix accent/gray scales via the `color` prop.
- Inline `style={{}}` escapes and raw `var(--…)` token references.
- New `.css` files — only `src/styles/app.css` exists; adding CSS needs an ADR-010 amendment.
- CSS-framework leftovers (`tailwind`, `tv(`, stray `className` on a non-Radix element).

## Duplication

The same Radix Themes composition repeated across ~3+ places is the signal to extract an application organism. Repetition inside one feature → a local helper in that feature directory. A one-off stays inline.

## Auditing

In audit mode, find: internal components with no importer (dead), the drift patterns above, and compositions repeated enough to warrant an organism. Navigate and search the codebase yourself — these are simple greps.
