# Storybook

Storybook is where the shared UI primitives in [`src/components/ui/`](../../src/components/ui/)
are developed and reviewed in isolation — every variant, in light and dark, with
an accessibility pass, without running the Tauri app.

```bash
pnpm storybook          # dev server on http://localhost:6006
pnpm build-storybook    # static build into storybook-static/ (gitignored)
```

## Where stories live

One `*.stories.tsx` per primitive, **colocated** beside it
(`src/components/ui/button.tsx` → `src/components/ui/button.stories.tsx`). The
`.storybook/main.ts` glob picks up `src/**/*.stories.tsx`, so a new primitive's
story just needs to sit next to it. Title convention: `UI/<PascalName>`.

Application organisms (`src/components/` outside `ui/`) have no stories — they
depend on the router, TanStack Query and tree DB, which Storybook does not wire
up.

## What a story is (and isn't)

Stories are **visual and interaction documentation** — they show a primitive's
variants and let a reviewer exercise them. They are not behavior tests: that job
belongs to the colocated `*.test.tsx` files (see [testing strategy](../architecture/testing-strategy.md)).
Don't assert in a story; don't add a story just for coverage.

Each file sets `tags: ['autodocs']`, so Storybook generates a docs page from the
primitive's module JSDoc plus its stories. Extend it with
`parameters.docs.description.component` when a compound API needs a usage snippet.

### Typing a story file

- **Default** — `component: X`, `satisfies Meta<typeof X>`, `type Story = StoryObj<typeof meta>`.
  Stories can be `args`-driven or `render`-driven.
- **Bare `satisfies Meta` + `type Story = StoryObj`** when Storybook can't derive
  one args shape: a namespace-object assembly (`export const X = { Root, … }`, so
  no `component:` at all — `avatar`, `dialog`, `popover`, `select`, `switch`,
  `toast`, `tooltip`), a generic component, a discriminated-union prop type, or
  all-required props (which would otherwise force `args` on every `render` story).
  These stories are always wrapper- or `render`-driven.

## Toolbars

- **Theme** (`@storybook/addon-themes`) — writes `data-theme="light|dark"` onto
  `<html>`, the same attribute [`app-theme.tsx`](../../src/components/app-theme.tsx)
  sets in the real app to drive the dark token set in
  [`theme.css.ts`](../../src/design/theme.css.ts). `.storybook/preview.css.ts`
  paints the story canvas so the backdrop tracks the toggle.
- **Locale** — calls `i18n.changeLanguage('en'|'fr')`. Only `toast` reads
  `useTranslation` today; other primitives take their strings as props, and
  stories pass literals (DEV-only, allowed by CLAUDE.md).

## Config

See [`.storybook/main.ts`](../../.storybook/main.ts) and
[`.storybook/preview.tsx`](../../.storybook/preview.tsx) — both are short and
commented. In brief: `main.ts` reuses the project `vite.config.ts` (Vanilla
Extract and the `$…` aliases pass straight through); `preview.tsx` imports the
app's global CSS and wraps every story in the theme, locale, and Toast
decorators.

`eslint-plugin-storybook` (flat config) lints the story files; `tsc --noEmit`
covers them and `.storybook/` via `tsconfig.json` `include`, so a broken story
fails `pnpm build`.
