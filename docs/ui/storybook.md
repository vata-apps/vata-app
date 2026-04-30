# Storybook

Storybook is the local authoring tool for the design system. It renders every UI primitive against the live `@theme` tokens from `src/styles/app.css`, in light and dark mode, in English and French, with an a11y panel.

It is **not** part of the desktop app build. It does not ship to users. It is a development surface only.

---

## Run

```bash
pnpm storybook         # dev server on http://localhost:6006
pnpm build-storybook   # static build into storybook-static/ (gitignored)
```

The dev server reuses the project's `vite.config.ts`, so any path alias (`$components`, `$lib`, …) and the `@tailwindcss/vite` plugin work out of the box. The TanStack Router plugin and the project's React plugin are filtered out in `.storybook/main.ts` (Storybook supplies its own React handling, and stories don't need routing).

---

## Where stories live

Stories are colocated with the component they describe:

```
src/components/ui/
├── button.tsx
├── button.test.tsx        # behavioral RTL tests
├── button.stories.tsx     # Storybook stories
├── input.tsx
├── input.test.tsx
└── input.stories.tsx
```

The same convention as `*.test.tsx`. Storybook globs `src/**/*.stories.@(ts|tsx|mdx)`, so any new file is picked up automatically.

---

## Toolbars

Two global toolbars are available in every story:

- **Theme** (`light` / `dark`) — toggles the `.dark` class on `<html>`. Drives the dark-mode token map in `src/styles/app.css`.
- **Locale** (`en` / `fr`) — calls `i18next.changeLanguage()`. Use this to verify text length differences between languages.

Both are wired in `.storybook/preview.tsx`.

---

## Authoring a story file

Every wrapper in `src/components/ui/` ships with a colocated `<name>.stories.tsx`. Minimum shape:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MyComponent } from './my-component';

const meta = {
  title: 'UI/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

- **`tags: ['autodocs']`** — the JSDoc on the component and props is auto-rendered into a Docs page. Keep JSDoc rich; it doubles as Storybook documentation.
- **`title: 'UI/<Name>'`** — keep primitives under the `UI/` group so they sort together in the sidebar.
- **One `Story` per variant** plus a `Matrix` story (variants × sizes) for side-by-side review.

### i18n in stories

Stories are dev-facing fixtures, not the app. Hardcoded English literals are fine for demo content (`children: 'Save'`, `placeholder: 'Type something…'`) so the file stays readable.

What's required is that every wrapper which renders translatable text in production has at least one `I18nDemo` story that uses `useTranslation()` — that proves the i18n pipeline reaches the component and lets the Locale toolbar exercise it. To call hooks, extract a small component:

```tsx
function TranslatedSearchInput() {
  const { t } = useTranslation('trees');
  return <Input type="search" placeholder={t('searchPlaceholder')} />;
}

export const I18nDemo: Story = {
  render: () => <TranslatedSearchInput />,
};
```

`render` callbacks are not React components, so calling hooks directly inside them violates the React Hooks rules-of-hooks lint rule.

### What stories are _not_

Stories are visual documentation. **Never assert classes, styles, or test IDs in story `play()` functions.** Behavior is verified in the colocated `*.test.tsx` file with React Testing Library, where assertions target user-observable outcomes (`getByRole`, `getByLabelText`, …). See `feedback_ui_wrapper_conventions.md` in project memory for the full rationale.

---

## Adding a new wrapper

When you add a file under `src/components/ui/` (anything except `*.test.tsx` / `*.stories.tsx`), the `storybook-stories` skill (`.claude/skills/storybook-stories/SKILL.md`) auto-loads and reminds you to also create:

- `<name>.test.tsx` — behavioral tests (covered by `feedback_ui_wrapper_conventions.md`).
- `<name>.stories.tsx` — at minimum, one story per variant plus a matrix story.

No exceptions for "trivial" wrappers. If it's worth wrapping, it's worth a story.

---

## Out of scope (today)

These are intentionally not set up yet — add them when there's a need:

- Stories for layouts, pages, or composed components (Home, DataBrowser, …).
- A "Design Tokens" MDX showcase page (color/spacing/radii).
- `@storybook/addon-vitest` (running `play()` functions as Vitest tests).
- Visual regression (Chromatic, Loki) and any CI hookup.
- Deploying Storybook (GH Pages, Vercel, …).
