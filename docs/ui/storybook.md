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

## MCP server (for AI agents)

`@storybook/addon-mcp` exposes a Model Context Protocol server at `http://localhost:6006/mcp` while `pnpm storybook` is running. Claude Code is wired to it via `.mcp.json` under the `storybook` server name.

Tools the server provides:

- `list-all-documentation` — discover every component and docs ID in the running Storybook.
- `get-documentation` / `get-documentation-for-story` — full props, usage, and story details.
- `get-storybook-story-instructions` — framework-specific patterns the agent should follow before writing stories.
- `preview-stories` — preview URLs for visual verification.

The server is only reachable while the dev server is up. Start it with `pnpm storybook` before asking an agent to author or check stories.

---

## Where stories live

Stories are colocated with the component they describe:

```text
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

### Strings in stories — by atomic-design tier

The rule scales with the component tier:

- **Atoms** (`src/components/ui/`): hardcoded English literals are fine. `t()` is not required.
- **Molecules**: case-by-case. Thin compositions of atoms can stay literal; molecules that own meaningful user copy (empty states, banners, confirmations) should use `t()`.
- **Organisms and pages**: use `t()` for any string that ships to users — the story should look like production usage. The Locale toolbar then exercises real translation across both languages.

**Never write a dedicated `I18nDemo` story.** When `t()` is needed, weave it into the regular stories. To call hooks, extract a small component inside the story file and render it from the story:

```tsx
function EmptyStateBanner() {
  const { t } = useTranslation('individuals');
  return <Banner>{t('list.empty')}</Banner>;
}

export const Empty: Story = {
  render: () => <EmptyStateBanner />,
};
```

The Locale toolbar (defined in `.storybook/preview.tsx`) calls `i18n.changeLanguage()` on the global instance, so any story whose tree calls `t()` re-renders in the chosen language automatically.

### Stories are tests

Behavior is verified by `play()` functions inside the stories themselves. `@storybook/addon-vitest` discovers every story and runs its `play()` as a Vitest test in headless Chromium (Playwright). There are no `*.test.tsx` files for UI wrappers.

```tsx
import { expect, fn, userEvent, within } from 'storybook/test';

const meta = {
  // …
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
```

Assertions stay on user-observable outcomes — role, accessible name, attributes, callback invocation. Never assert classes, styles, or test IDs.

Run modes:

- `pnpm vitest run` — runs both projects (jsdom unit tests + Chromium story tests).
- `pnpm vitest run --project storybook` — only the story `play()` tests.
- `pnpm vitest run --project unit` — only the jsdom tests.

The `unit` project explicitly excludes `src/components/**/*.{test,spec}.tsx` so component behavior never accidentally gets a parallel home in regular Vitest tests.

---

## Adding a new wrapper

When you add a file under `src/components/ui/` (anything except `*.stories.tsx`), the `storybook-stories` skill (`.claude/skills/storybook-stories/SKILL.md`) auto-loads and reminds you to create the colocated `<name>.stories.tsx` with at least:

- one story per variant,
- a matrix story (variants × sizes),
- a `play()` function on each story that asserts something meaningful — accessible name, attribute, callback, typed value, etc.

No exceptions for "trivial" wrappers. If it's worth wrapping, it's worth a story with a play().

---

## Out of scope (today)

These are intentionally not set up yet — add them when there's a need:

- Stories for layouts, pages, or composed components (Home, DataBrowser, …).
- A "Design Tokens" MDX showcase page (color/spacing/radii).
- Visual regression (Chromatic, Loki) and any CI hookup.
- Deploying Storybook (GH Pages, Vercel, …).
