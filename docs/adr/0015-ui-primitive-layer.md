# ADR-0015: src/components/ui/ — Behavior-Owning Primitive Layer

**Status**: Accepted
**Date**: 2026-07-13

## Context

[ADR-0014](./0014-headless-baseui-vanilla-extract.md) moved the UI foundation to Base UI + Vanilla Extract and established the typed warm-earth token contract in `src/design/theme.css.ts`. It defined the _shape_ of the stack (headless behavior + typed styling) but left open _where_ the boundary between "reusable primitive" and "application organism" lives.

In ADR-0014's first consumer — the Person editor dialog — every Base UI part (`Dialog.Root`, `Select.Root`, `Switch.Root`, …) was imported directly into `person-editor-dialog.tsx`. That is fine for a spike but creates two problems at scale:

1. **Class-name noise at every call site.** Without a wrapper, every usage of a Base UI primitive carries `className={s.input}` / `className={s.selectTrigger}` / … at the call site, coupling the organism to the visual contract of the primitive. Changing the input style means touching every call site.
2. **No single source of truth for behavior defaults.** Defaults like `type="button"` on every button, `sideOffset` on every Select positioner, or `positionMethod="fixed"` on every Popover positioner must be repeated everywhere.

The question is: when does a wrapper layer pay its way?

The answer from prior ADRs (ADR-007 → ADR-010 → ADR-014) is clear: a wrapper layer that exists only to rename or reshape an API provides negative value (another indirection, another thing to keep in sync). A wrapper layer that **encapsulates behavior** — an invariant the consumer should never have to remember — provides positive value.

## Decision

Create `src/components/ui/` as a **behavior-owning primitive layer**. Each export in this directory:

1. **Exists because there is behavior to encapsulate** — a `type="button"` default that prevents form submission, a shared `positionerZ` z-index, Base UI data attributes mapped to typed CSS compound selectors, a recipe that canonically expresses all visual variants. Pure style aliases do not qualify.
2. **Wraps Base UI (or a plain element) with built-in classNames** — consumers receive a ready-to-use component with no `className={s.*}` noise at the call site; per-surface overrides merge via `className` prop.
3. **Compounds where Base UI compounds** — Select, Dialog, Popover, Switch each expose a namespace object (`Select.Root`, `Select.Trigger`, …) that mirrors the Base UI shape so callers can destructure exactly what they need.
4. **Is not a layout component** — Flex/Grid/Stack belong in surface-local stylesheets, not here. This layer holds control primitives, not layout atoms.

### Primitives shipped in this slice

| Export | Behavior encapsulated |
|---|---|
| `Button` | `type="button"` default (prevents form submission); recipe maps solid/ghost/danger/icon/add variants |
| `TextField` | Shared `input` / `textarea` token styles; `multiline` prop selects element; passes all native attrs |
| `Select` | Base UI Select compound with `positionerZ` (z: 105) and `positionMethod="fixed"` baked in |
| `SegmentedControl` | React-context radiogroup over plain buttons; ARIA `role="radiogroup"` / `role="radio"` / `aria-checked` |
| `Switch` | Base UI Switch.Root + Switch.Thumb with `data-checked` → CSS compound selector thumb translation |
| `Dialog` | Base UI Dialog compound; `Backdrop` accepts `level` prop (base z:100 / elevated z:110); `Popup` accepts `variant` prop (panel: z:101 maxW 1180 / alert: z:111 maxW 440) |
| `Popover` | Base UI Popover compound; `positionerZ` (z: 105) and base popup chrome (bg, border, shadow, radius) baked in |
| `Typography` | Polymorphic `as` element; recipe covers size/weight/tone/family variants from the text token scale |

All primitives export from `src/components/ui/index.ts`.

### Token scales added to theme.css.ts

Two static token exports complement the existing `vars.*` contract:

- `space` — 8/12/16 px steps (Tailwind 4 px base, only the consumed steps).
- `text` — xs/sm/base/md/lg objects with `size` and `lineHeight` values.

These are plain `as const` objects (not CSS custom properties) because they are consumed at build time by recipe variant maps, not at runtime.

### z-index stacking convention

| Layer | z-index |
|---|---|
| Backdrop (base) | 100 |
| Backdrop (elevated) | 110 |
| Panel popup | 101 |
| Alert popup | 111 |
| Select / Popover positioner | 105 |

## Why

- **The "behavior gate" rule eliminates the bad kind of wrapper.** Every component in `src/components/ui/` has a documented behavioral reason to exist — there is no "just a styled div" or "re-export with a rename." This keeps the layer honest.
- **Call-site ergonomics are real.** Replacing `className={s.selectTrigger} className={s.selectCaret}` at every Select usage with `<Select.Trigger>` (no className) is not cosmetic — it removes coupling between organism code and primitive style internals.
- **`type="button"` as the canonical example.** This is precisely the kind of invariant a primitive layer should own. The HTML default for `<button>` inside a form is `submit`. A UI library button that defaults to `submit` is a footgun; one that defaults to `button` is a safe primitive. No call site should bear the cognitive load of remembering this.
- **Compound pattern fits the Base UI shape.** Base UI already thinks in compound components; mirroring the compound shape means consumers that know Base UI find the wrapper familiar, not surprising.
- **No layout primitives keeps scope tight.** Layout (Flex, Grid, Stack, columns) belongs in surface-local stylesheets where the specific spacing context lives. Adding layout primitives here would bloat the layer with components that provide no behavioral value.

## Alternatives Considered

- **No primitive layer; import Base UI directly everywhere.** Rejected — the form-submission footgun (`type="submit"` default), the repeated `positionerZ` z-index, and the `className={s.*}` noise at every call site are all concrete problems that the layer solves.
- **A "design system" library (shadcn, Ark, Mantine, etc.).** Rejected per ADR-0014 — we own the visual layer deliberately; a third-party pre-styled library reintroduces the seam.
- **A layout primitive (Flex, Stack, etc.).** Rejected — layout belongs in the surface; a generic `<Flex>` component is no safer or more convenient than a CSS class named `row`.
- **A shared `focusRing` constant file.** Rejected — the slight duplication of the focus ring object across `.css.ts` files (one per primitive) is intentional. A micro-shared file for three lines saves nothing and adds an import dependency between unrelated primitives.

## Consequences

**Positive**: organism call sites are clean — no raw Base UI part names, no repeated className props for primitive chrome; the footgun list (form submission, z-index mismatches, wrong ARIA patterns) is contained at the primitive boundary; adding new primitives has a clear admission rule.

**Negative / Trade-offs**: a one-time extraction effort per primitive (paid in this slice for the 8 primitives the Person editor needs); consumers must learn both the Base UI part name _and_ the ui/ wrapper name during the transition while some screens still import Base UI directly.

**Boundary with organisms**: components under `src/components/` that are not in `ui/` remain application organisms — they compose primitives and add applicative behavior (routing, data-fetching, form state). Organisms never re-export primitives; primitives never import organisms.

## References

- [ADR-0014: Headless UI Foundation](./0014-headless-baseui-vanilla-extract.md)
- `src/components/ui/` — the layer this ADR governs
- `src/design/theme.css.ts` — the token contract
- `src/components/individuals/person-editor-dialog.tsx` — first organism consumer
- `src/components/individuals/person-picker.tsx` — second organism consumer
