---
name: design-system-standards
description: Conventions for vata-app's design system — when to reuse an existing wrapper, when to extend it, when to compose Radix primitives directly, when to add a new wrapper under src/components/ui/, when to drop to raw Tailwind. Token usage rules. Audit heuristics for spotting duplication, dead components, and token drift. Use when designing or reviewing UI under src/components/ui/, src/pages/**, or src/components/**.
---

# Design System Standards — Vata

Vata's UI is built on a small, intentional set of tokenised wrappers. The point of this skill is to keep it that way: every new component should justify its existence, and every duplication should be challenged before it spreads.

## Source-of-truth files

Read these first when applying this skill:

- `src/components/ui/` — every wrapper currently shipping (`button.tsx`, `input.tsx`, `icon.tsx` today)
- `src/styles/app.css` — `@theme` tokens (colors, radii, font)
- `docs/ui/design-system.md` — DS philosophy, token reference, gender + semantic colors
- `docs/ui/storybook.md` — story conventions; any new wrapper needs a colocated `<name>.stories.tsx` with `play()` tests
- `.claude/skills/storybook-stories/SKILL.md` — story rules for new wrappers
- `.claude/skills/shadcn/SKILL.md` — registry rules; check before proposing custom-from-scratch

## Decision tree

For any UI element a mockup or feature requires, walk this tree top-down. Stop at the first step that fits.

### 1. Reuse an existing wrapper as-is

Pick this when the wrapper already covers the need with its current props/variants. Always cite the variant + size you'd use.

Existing wrappers and their variants (verify against the source — this list rots):

| Wrapper | Variants                                              | Sizes        | Notes                                                                              |
| ------- | ----------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------- |
| Button  | primary, secondary, outline, ghost, destructive, link | sm, md, lg   | `leadingIcon`, `trailingIcon`, `hideLabel`, `asChild` (incompatible with icons)    |
| Input   | state: default, error                                 | sm, md, lg   | text-shaped only (text, email, url, tel, search, password). `invalid` shortcut     |
| Icon    | curated registry (`IconName`)                         | numeric size | `aria-hidden` defaults to true; pass `aria-label` + `aria-hidden={false}` for solo |

### 2. Extend an existing wrapper

Pick this when the new need is a variation (color, size, slot, state) of an existing wrapper. The fix is usually:

- Add a `tv()` variant value (e.g., `variant: { ..., success: '...' }`)
- Add a new prop with a documented purpose
- Add an entry to a curated registry (e.g., a new icon in `iconRegistry`)

**Hard rule:** if you find yourself copying a wrapper into a new file just to change a color or a size, stop — extend the original instead.

### 3. Compose existing wrappers (no new file)

Pick this when the need is a layout of known atoms — e.g., a profile header is `Avatar` + heading + `Button` row. Build it inline in the page or feature directory. Do **not** create a new wrapper unless the same composition is reused in ≥2 places.

### 4. Add a new wrapper under `src/components/ui/`

Pick this when:

- ≥2 places need the same composition or restricted API, **or**
- Project-specific defaults must be enforced (like `Icon` restricting to a curated registry, `Input` restricting to text-shaped types), **or**
- There are variants worth tracking centrally (size, intent, state)

Before creating, check the shadcn registry: `npx shadcn@latest search <keyword>`. If a registry component fits, install it via `npx shadcn@latest add` (per the `shadcn` skill) rather than rolling a custom wrapper.

A new wrapper requires, in the same commit:

- The wrapper file `<name>.tsx` with rich JSDoc on the component and its props
- A colocated `<name>.stories.tsx` with one story per variant, a matrix story, and `play()` tests (per `storybook-stories`)
- No separate `<name>.test.tsx` — `play()` is the test

### 5. Custom from scratch (rare)

Only when nothing in Radix or shadcn covers the need. Document why in JSDoc on the component.

## Token usage

Every visible value (color, radius, font, spacing) should map to a `@theme` token in `src/styles/app.css`. The token catalogue:

- **Colors:** `background`, `foreground`, `card`, `card-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `ring`. Use Tailwind utility names: `bg-primary`, `text-muted-foreground`, etc.
- **Radii:** `--radius` (0.5rem base), `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`. Use `rounded-md`, `rounded-lg`, etc.
- **Font:** `--font-sans` (Geist) — applied globally, no per-component override
- **Dark mode:** swapped via `.dark` class or `prefers-color-scheme: dark`. Never write `dark:bg-…` overrides — use semantic tokens that already swap.

**Drift signals to flag:**

- Hardcoded `oklch(...)`, `#hex`, `rgb(...)` in JSX or component recipes
- Hardcoded pixel sizes for radii or spacing where a token exists
- `dark:` utility prefixes overriding semantic tokens
- Raw Tailwind palette utilities for status (`bg-blue-500`, `text-emerald-600`) instead of semantic tokens or `Badge`-style components

## Variants vs duplication

Two near-identical wrappers that differ only by color/size/state are a smell — they should be one wrapper with a variant.

Quick rule:

- 0 differences besides class names → consolidate immediately
- 1 axis of variation → `variants: { axis: { … } }` in the recipe
- 2+ axes → compound variants in `tv()`
- Behavior diverges (different DOM shape, different a11y semantics, different children contract) → keep separate

## Audit heuristics

Run when invoked in audit mode, or when something stands out during normal review.

### Dead components

A wrapper is dead if `grep -r "from '\$components/ui/<name>'" src/` returns zero hits across `src/` (excluding the wrapper's own story and any test scaffolding). Confirm by also checking imports via the bare name (`import { Foo }`) and by alias variants.

### Duplication

Three signals to grep for, in priority order:

1. **Same `tv()` base array repeated** in two component files — almost always a missed wrapper opportunity
2. **Same Radix primitive composition** (e.g., `Dialog.Root` + `Dialog.Trigger` + `Dialog.Content` skeleton) appearing in 3+ pages without a wrapper
3. **Same JSX shape** (an avatar circle, a status badge, a stat card) inlined in 3+ places

### Token drift

Ripgrep these patterns under `src/components/**`, `src/pages/**`, `src/routes/**`:

- `oklch\(`, `rgb\(`, `rgba\(` outside `src/styles/`
- `#[0-9a-fA-F]{3,8}\b` outside `src/styles/` (skip imports and comments)
- `\bdark:(bg|text|border)-` — dark-mode overrides should be unnecessary if semantic tokens are used

## Pen-to-code mapping

When the input is a Pencil `.pen` file, common node types map to vata-app primitives like this:

| Pencil node                  | Likely vata primitive                                                       |
| ---------------------------- | --------------------------------------------------------------------------- |
| Frame with background fill   | `Card`-style wrapper (when one exists), else `<div>` with semantic bg token |
| Stack (vertical/horizontal)  | `<div className="flex flex-col gap-N">` / `flex-row`                        |
| Text (display / headings)    | semantic heading element with type-scale class                              |
| Text (body)                  | bare text in `text-foreground` / `text-muted-foreground`                    |
| Image (avatar-shaped)        | dedicated `Avatar` wrapper (create if ≥2 uses)                              |
| Vector / glyph / icon        | `Icon` from the curated registry — flag if missing                          |
| Button / interactive element | `Button` with the right variant                                             |
| Input field                  | `Input` (or its future `Textarea` / `Select` siblings)                      |

Always map verbatim — don't invent new vocabulary that doesn't exist in this skill or in `src/components/ui/`.

## Out of scope for this skill

- Accessibility audits (use the play() tests in `.stories.tsx` and the `testing-standards` skill)
- i18n string review (`react-i18next` and the project's i18n rules cover that)
- Type-level review of component props (covered by `typescript-standards`)
- Storybook story shape (covered by `storybook-stories`)
- shadcn CLI usage (covered by the `shadcn` skill)
