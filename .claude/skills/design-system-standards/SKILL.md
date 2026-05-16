---
name: design-system-standards
description: Conventions for vata-app's UI — when to reuse a Radix Themes component, when to compose Radix primitives, and when an application organism justifies a new internal component under src/components/. Brand-token rules. Audit heuristics for spotting duplication, dead components, and styling drift. Use when designing or reviewing UI under src/components/** or src/pages/**.
---

# Design System Standards — Vata

Vata's UI foundation is **Radix Themes** (`@radix-ui/themes`), consumed directly at call sites. There is **no in-house wrapper layer**. The point of this skill is to keep it that way: components come from Radix Themes, and an internal component exists only when it is a genuine application organism. See [ADR-007](../../../docs/adr/0007-adopt-radix-themes.md).

## Source-of-truth files

Read these first when applying this skill:

- `src/components/` — internal components currently shipping (application organisms only — `tree-shell.tsx`, `tree-nav.tsx`, `app-status-bar.tsx`, `preferences-popover.tsx`, `dropzone.tsx`, `app-theme.tsx`, `icon.tsx`)
- `src/components/app-theme.tsx` — the `<Theme>` provider and brand tokens (`accentColor`, `grayColor`, `radius`)
- `src/components/icon.tsx` — the curated Lucide icon registry
- `docs/ui/design-system.md` — DS philosophy, brand tokens, accessibility commitments
- [Radix Themes docs](https://www.radix-ui.com/themes/docs) — the component catalog and prop reference

## Decision tree

For any UI element a mockup or feature requires, walk this tree top-down. Stop at the first step that fits.

### 1. Reuse a Radix Themes component as-is

Pick this first. Radix Themes ships a broad catalog — `Button`, `TextField`, `Select`, `Dialog`, `Card`, `Badge`, `Table`, `Tabs`, `Flex`, `Grid`, `Box`, and more. Import it directly:

```tsx
import { Button, Flex, TextField } from '@radix-ui/themes';
```

Cite the component plus the props you'd use (`variant`, `size`, `color`, …) — quote them from the Radix Themes docs, never invent prop values.

### 2. Compose Radix Themes components and primitives (no new file)

Pick this when the need is a layout of known components — e.g., a profile header is `Avatar` + `Heading` + a `Button` row inside a `Flex`. Build it inline in the page or feature directory. Use Radix Themes layout primitives (`Flex`, `Grid`, `Box`) and spacing props for layout — never reach for a CSS framework. Do **not** create an internal component unless the composition is a reused application organism.

### 3. Add an internal application organism under `src/components/`

Pick this **only** for an application organism — a component used across the app that composes Radix Themes and adds applicative behavior (navigation, the tree shell, the status bar, a dropzone). It is never a restyled atom or molecule.

A new internal component requires, in the same commit:

- The component file with rich JSDoc on the component and its props
- A colocated `<name>.test.tsx` covering its behavior (per `testing-standards`)

If what you are reaching for is a restyled `Button`, `Input`, or `Badge` — stop. That is component ownership, which ADR-007 deliberately removed. Use the Radix Themes component directly.

### 4. Bespoke surface with scoped local CSS (rare)

Only when nothing in Radix Themes covers the need — e.g., a future pedigree graph. Use a scoped local CSS file next to the component, decided case by case. Document why in JSDoc.

## Brand tokens

Customization is **token-level only**, set on the `<Theme>` provider in `src/components/app-theme.tsx`: `accentColor`, `grayColor`, `radius`, and scaling. Read the live values at runtime — do not quote them from this skill:

```bash
rg -n "accentColor|grayColor|radius|appearance" src/components/app-theme.tsx
```

Component anatomy (heights, padding, density) is Radix's and is not tuned per component. Drift rules to flag:

- **No hardcoded color literals** (`oklch()`, hex, `rgb()`, `rgba()`) in components or pages — color comes from Radix accent/gray scales and the `color` prop.
- **No per-component theme overrides** — appearance (light/dark) is bound to the persisted Zustand theme preference at the `<Theme>` provider, not toggled per component.
- **No CSS framework utilities** — Tailwind and `tailwind-variants` were removed in ADR-007. Layout uses Radix Themes primitives + spacing props; genuinely bespoke surfaces use a scoped local CSS file.

## Duplication

Repeated JSX is a smell — it should be a composition helper or, if it is a true application organism, an internal component.

Quick rule:

- Same Radix Themes composition inlined in 3+ pages → extract an application organism under `src/components/`
- Same small layout (a labelled field, a stat row) repeated → a local composition helper in the feature directory, not `src/components/`
- A one-off layout → keep it inline

## Audit heuristics

Run when invoked in audit mode, or when something stands out during normal review.

### Dead components

An internal component is dead if no file under `src/` (excluding its own `*.test.tsx`) imports it. Run for each component `<name>`:

```bash
rg -n "from ['\"].*components/<name>['\"]" src/ --glob '!**/*.test.tsx'
```

Also grep for the bare exported symbol to catch re-exports.

### Duplication

Two signals to grep for, in priority order:

1. **Same Radix Themes composition** (e.g., a `Dialog.Root` + `Dialog.Content` skeleton, or an avatar + heading + button cluster) appearing in 3+ pages without an organism
2. **Same JSX shape** (a status row, a stat card) inlined in 3+ places

### Styling drift

Ripgrep these patterns, scoped to source and skipping fixtures, tests, and GEDCOM byte literals:

```bash
rg -n "oklch\(|rgb\(|rgba\(|#[0-9a-fA-F]{3,8}\b" \
  src/components src/pages src/routes \
  --glob '!**/*.test.tsx' --glob '!src/lib/gedcom/**'

rg -n "tailwind|tv\(|className=" src/components src/pages src/routes
```

A `className` hit on a non-Radix element, or any `tailwind`/`tv(` match, is leftover styling that ADR-007 removed.

## Pen-to-code mapping

When the input is a Pencil `.pen` file, map nodes to Radix Themes components before considering anything internal:

| Pencil node                   | Mapping                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| Button / interactive element  | Radix Themes `Button` — pick `variant` / `size` / `color`                              |
| Input field (text-shaped)     | Radix Themes `TextField` — pick `size`; set `color="red"` / aria-invalid if errored    |
| Select / dropdown             | Radix Themes `Select`                                                                  |
| Vector / glyph / icon         | The `Icon` registry at `src/components/icon.tsx`; flag a registry extension if missing |
| Frame with background fill    | Radix Themes `Card` or `Box` with a surface color                                      |
| Stack (vertical / horizontal) | Radix Themes `Flex` / `Grid` with `gap` and direction props                            |
| Text (display / headings)     | Radix Themes `Heading`                                                                 |
| Text (body)                   | Radix Themes `Text`                                                                    |
| Image (avatar-shaped)         | Radix Themes `Avatar`                                                                  |
| Reused app-level cluster      | Propose an internal application organism under `src/components/`                       |

Quote Radix Themes component and prop names from the docs — never invent a prop value.

## Out of scope for this skill

- Accessibility audits — Radix Themes handles primitive a11y; behavioral coverage is in `*.test.tsx` (see `testing-standards`)
- i18n string review (`react-i18next` and the project's i18n rules cover that)
- Type-level review of component props (covered by `typescript-standards`)
