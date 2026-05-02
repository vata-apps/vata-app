# ADR-005: UI Strategy — Radix + Tailwind v4 + tailwind-variants

**Status**: Accepted (revised 2026-05-02)
**Date**: 2025-02-22 (revised 2026-04-04, 2026-05-02)

## Context

The application needs a UI foundation that is accessible, customizable, and fits the local-first desktop context. The decision evolved in three steps:

1. **2025-02-22 (original)**: planned to use Mantine v7 with Figma designs prepared upfront.
2. **2026-04-04 (first revision)**: dropped the Figma dependency and adopted shadcn/ui to design screens iteratively with AI-assisted development and user feedback.
3. **2026-05-02 (current)**: dropped shadcn/ui itself. Experimentation showed the registry CLI and copy-paste workflow added indirection without value at the current UI surface — only three wrappers (`button`, `icon`, `input`) ever needed it. The codebase keeps the underlying ideas (Radix primitives + Tailwind utilities + recipe-based variants) but builds wrappers directly on `tailwind-variants` and `@radix-ui/react-slot`, with Tailwind v4's CSS-first theming via `@theme`.

## Decision

- **CSS framework**: **Tailwind v4** in CSS-first mode. Theme tokens live in `@theme { ... }` inside `src/styles/app.css`, expressed in `oklch()`. No `tailwind.config.ts`, no PostCSS plugin chain.
- **Behavior primitives**: **Radix UI**, currently only `@radix-ui/react-slot`. Additional `@radix-ui/react-*` packages are added on demand, only when a real Radix behavior is required (focus trap, dismissible layer, roving tabindex, etc.).
- **Variants**: **`tailwind-variants`** via `tv()` for type-safe className composition.
- **Wrappers**: hand-rolled under `src/components/ui/` (currently `button`, `icon`, `input`), with a colocated Storybook story (`<name>.stories.tsx`) and Vitest tests (Storybook `play()` + colocated `.test.tsx` where needed).
- **Icons**: **Lucide React** consumed through a curated registry in `src/components/ui/icon.tsx` — pages do not import from `lucide-react` directly.
- **Internationalization**: **react-i18next** with namespace-based translation files (unchanged).
- **Screen design**: still iterative. No Figma dependency.

## Why Radix + Tailwind v4 + tailwind-variants

- **Full ownership without registry overhead**: each wrapper is real source code, but there is no CLI step, no `components.json`, and no synced upstream — the wrapper's API is whatever the app needs.
- **Tailwind v4 CSS-first**: tokens and themes are plain CSS variables inside `@theme`, no JS config to maintain. Light/dark/system theming and design tokens live in one file.
- **`tailwind-variants` over `cva`**: identical mental model with native Tailwind class merging, no need for `clsx` + `tailwind-merge` glue.
- **Radix only when needed**: the project pulls in just `@radix-ui/react-slot` today; primitives are added one at a time as wrappers require them, keeping the dep graph minimal.
- **Colocated Storybook + Vitest tests**: every wrapper has a visual catalog and behavioral coverage right next to the source — drift is caught immediately.

## Alternatives Considered

- **Mantine v7 (original)**: complete out-of-the-box solution but heavier, less customizable, and originally tied to Figma designs.
- **shadcn/ui CLI + registry (2026-04-04 → 2026-05-02)**: tried in practice. The registry tooling is well-designed, but for the current handful of wrappers it added indirection (CLI step, `components.json`, registry version drift) without payoff. Can be reintroduced later if the surface area grows enough that the registry becomes worth syncing against.
- **Headless UI / Radix without recipes**: maximum flexibility but every wrapper would have to reinvent variant composition by hand.

## Consequences

**Positive**:

- Wrappers are minimal and fully owned — no surprise upstream changes.
- Tailwind v4 `@theme` keeps tokens, light/dark theming, and typography in a single CSS file.
- Type-safe variants via `tv()` with no auxiliary helpers (`cn`/`clsx`/`tailwind-merge` are not installed).
- No external design dependency blocking progress.

**Negative / Trade-offs**:

- No shared registry: every new wrapper must be designed, implemented, and tested locally — slower than `npx shadcn add ...`.
- Tailwind v4 utility-class learning curve remains.
- Radix primitives must be added one package at a time as needs arise; no batch install.

## References

- [Tech Stack — UI Layer](../architecture/tech-stack.md#ui-layer)
- [Tech Stack — Internationalization](../architecture/tech-stack.md#internationalization-i18n)
- [Design System](../ui/design-system.md)
- [Storybook conventions](../ui/storybook.md)
