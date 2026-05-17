---
name: design-system-standards
description: Conventions for vata-app's UI — when to reuse a Radix Themes component, when to compose inline, and when an application organism justifies a new internal component. Token-level customization rules and duplication/drift heuristics. Use when designing or reviewing UI under src/components/** or src/pages/**.
---

# Design System Standards — Vata

Vata's UI is **Radix Themes** (`@radix-ui/themes`), consumed directly at call sites. ADR-007 removed the in-house wrapper layer (`src/components/ui/`); this skill keeps it removed.

## Decision tree

For any UI element, take the first step that fits:

1. **Reuse a Radix Themes component** — the default. Import it directly and pick its `variant` / `size` / `color` props.
2. **Compose Radix Themes inline** — when the need is a layout of known components (a header is `Avatar` + `Heading` + a `Button` row in a `Flex`). Build it in the page, no new file. Layout uses Radix primitives (`Flex`, `Grid`, `Box`) and spacing props.
3. **Add an internal application organism** in `src/components/` — only for a component used across the app that composes Radix Themes and adds applicative behaviour (the tree shell, navigation, a dropzone). Never a restyled atom or molecule: reaching for a "styled Button" means stop and use Radix's. A new organism ships in the same commit with JSDoc and a colocated `*.test.tsx`.
4. **Bespoke surface, scoped local CSS** — rare; only when Radix Themes covers nothing for the need (e.g. a pedigree graph). Document why in JSDoc.

## Customization is token-level only

Brand tokens (`accentColor`, `grayColor`, `radius`, scaling) live on the single `<Theme>` provider. Component anatomy — heights, padding, density — is Radix's, never tuned per component.

Reject in review:

- Hardcoded colour literals (`oklch()`, hex, `rgb()`) — colour comes from the Radix accent/gray scales and the `color` prop.
- CSS-framework leftovers (`tailwind`, `tv(`, stray `className` on a non-Radix element) — removed by ADR-007.
- Per-component theme overrides — appearance is set once at the provider.

## Duplication

The same Radix Themes composition repeated across ~3+ places is the signal to extract an application organism. Repetition inside one feature → a local helper in that feature directory. A one-off stays inline.

## Auditing

In audit mode, find: internal components with no importer (dead), the drift patterns above, and compositions repeated enough to warrant an organism. Navigate and search the codebase yourself — these are simple greps.
