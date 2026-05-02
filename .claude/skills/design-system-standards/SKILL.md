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

## Decision tree

For any UI element a mockup or feature requires, walk this tree top-down. Stop at the first step that fits.

### 1. Reuse an existing wrapper as-is

Pick this when the wrapper already covers the need with its current props/variants. Always cite the variant + size you'd use.

Discover the live wrapper inventory at runtime — never quote variants from this skill, the source rots:

```bash
ls src/components/ui/*.tsx                                 # wrapper names
rg -n "tv\(|variants:|defaultVariants" src/components/ui/  # recipes & axes
rg -n "^export (interface|type|const|function)" src/components/ui/  # public API
```

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

A new wrapper requires, in the same commit:

- The wrapper file `<name>.tsx` with rich JSDoc on the component and its props
- A colocated `<name>.stories.tsx` with one story per variant, a matrix story, and `play()` tests (per `storybook-stories`)
- No separate `<name>.test.tsx` — `play()` is the test

### 5. Custom from scratch (rare)

Only when nothing in Radix covers the need. Document why in JSDoc on the component.

## Token usage

Every visible value (color, radius, font, spacing) should map to a `@theme` token in `src/styles/app.css`. Read the live token list at runtime — do not quote tokens from this skill:

```bash
rg -n "^\s*--(color|radius|font|spacing)" src/styles/app.css
```

Use Tailwind utility names that map to those CSS variables (`bg-primary`, `text-muted-foreground`, `rounded-md`, …). Never hand-write `dark:` overrides — semantic tokens swap automatically via the `.dark` class and `prefers-color-scheme`.

For the canonical visual specification (gender colors, type scale, motion curves), see `docs/ui/design-system.md`. Drift rules to flag when they appear outside `src/styles/`:

- No hardcoded `oklch()`, hex, `rgb()`, or `rgba()` color literals
- No raw palette utilities for status (`text-red-500`, `bg-green-100`, …) — use semantic tokens (`text-destructive`, `bg-success`, …)
- No `dark:` overrides — semantic tokens swap automatically

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

A wrapper is dead if no file under `src/` (excluding its own `*.stories.tsx` and `*.test.tsx`) imports it. Run for each wrapper `<name>`:

```bash
rg -n "from ['\"]\\\$(components|/components)/ui/<name>['\"]" src/ \
  --glob '!**/*.stories.tsx' --glob '!**/*.test.tsx'
```

Also grep for the bare exported symbol (e.g. `\bButton\b`) to catch direct re-exports through index files.

### Duplication

Three signals to grep for, in priority order:

1. **Same `tv()` base array repeated** in two component files — almost always a missed wrapper opportunity
2. **Same Radix primitive composition** (e.g., `Dialog.Root` + `Dialog.Trigger` + `Dialog.Content` skeleton) appearing in 3+ pages without a wrapper
3. **Same JSX shape** (an avatar circle, a status badge, a stat card) inlined in 3+ places

### Token drift

Ripgrep these patterns, scoped to source and skipping fixtures, tests, stories, and GEDCOM byte literals:

```bash
rg -n "oklch\(|rgb\(|rgba\(|#[0-9a-fA-F]{3,8}\b" \
  src/components src/pages src/routes \
  --glob '!**/*.stories.tsx' --glob '!**/*.test.tsx' \
  --glob '!src/lib/gedcom/**' --glob '!src/styles/**'

rg -n "\bdark:(bg|text|border|ring)-" src/components src/pages src/routes
```

## Pen-to-code mapping

When the input is a Pencil `.pen` file, map nodes to existing wrappers (discovered via the runtime grep above) before considering new ones:

| Pencil node                    | Mapping                                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| Button / interactive element   | Existing `Button` wrapper if found — pick the variant; else propose extension                      |
| Input field (text-shaped)      | Existing `Input` wrapper if found — pick the size and `invalid` if errored; else propose extension |
| Vector / glyph / icon          | Existing `Icon` wrapper if the glyph is in its registry; flag as registry-extension if missing     |
| Frame with background fill     | If a card-style wrapper exists, use it; else compose inline with semantic bg token                 |
| Stack (vertical / horizontal)  | Inline `<div className="flex flex-col gap-N">` / `flex-row gap-N`; never a new wrapper             |
| Text (display / headings)      | Semantic heading element with the type-scale class from `docs/ui/design-system.md`                 |
| Text (body)                    | Bare text using `text-foreground` / `text-muted-foreground`                                        |
| Image (avatar-shaped, ≥2 uses) | Propose a new `Avatar` wrapper (no existing one); justify and pair with story + `play()` test      |

Quote real wrapper names from the live `src/components/ui/` listing — never name a wrapper that the inventory grep did not find.

## Out of scope for this skill

- Accessibility audits (use the play() tests in `.stories.tsx` and the `testing-standards` skill)
- i18n string review (`react-i18next` and the project's i18n rules cover that)
- Type-level review of component props (covered by `typescript-standards`)
- Storybook story shape (covered by `storybook-stories`)
