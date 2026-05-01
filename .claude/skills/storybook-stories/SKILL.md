---
name: storybook-stories
description: Ensures every UI wrapper in src/components/ui has a colocated Storybook story with play()-based tests. Use when creating or modifying anything under src/components/ui/ (the wrapper file `<name>.tsx` AND its `<name>.stories.tsx`), or any other `*.stories.tsx` in the repo.
---

# Storybook Stories — UI Wrappers

Storybook is the local design-system surface. Every wrapper under `src/components/ui/` ships with a colocated `<name>.stories.tsx`. No exceptions for "trivial" wrappers.

This skill is intentionally minimal and will be iterated as patterns emerge.

## When to Apply

- Creating a new file under `src/components/ui/` (anything except `*.test.tsx` and `*.stories.tsx`).
- Modifying an existing wrapper's variants, sizes, or props — update the story to reflect the new surface.

## Rules

### 1. Every wrapper has a story file — no separate test file

If the file is a UI wrapper (Button, Input, Dialog, Select, …), it ships in the same commit as `<name>.stories.tsx`. **Do not** create a `<name>.test.tsx` for components — behavior is verified by `play()` functions inside the stories themselves, which `@storybook/addon-vitest` runs as Vitest tests in headless Chromium.

(Non-component code — DB layer, hooks, libs, managers, store — keeps using regular Vitest unit tests in `*.test.{ts,tsx}` against jsdom.)

### 2. Minimal story-file shape

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { MyComponent } from './my-component';

const meta = {
  title: 'UI/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
```

- `title` lives under the `UI/` namespace so primitives sort together.
- `tags: ['autodocs']` — the component's JSDoc renders as Docs automatically. Keep JSDoc rich (the `typescript-standards` and component conventions already require it).
- One `StoryObj` per variant; add a `Matrix` story for side-by-side variant × size comparison.
- For event-handler args, use `fn()` from `storybook/test` so Storybook's Actions panel logs the call AND `play()` can assert on it.

### 3. i18n in stories — by atomic-design tier

The rule scales with the component tier:

- **Atoms** (`src/components/ui/` — Button, Input, Badge, …): hardcoded English literals are fine. `t()` is not required.
- **Molecules**: case-by-case. If the molecule is a thin composition of atoms (e.g. an icon button with a static label), literals are fine. If it owns a meaningful piece of copy that ships to users (e.g. an empty-state card, a confirmation banner), use `t()`.
- **Organisms and pages**: use `t()` for any string that ships to users. The story should look like the production usage.

**Never write a dedicated `I18nDemo` story.** When `t()` is needed, weave it into the regular stories — the Locale toolbar (in `.storybook/preview.tsx`) drives language switching globally, so a separate story adds no signal. To call hooks, extract a small component inside the file and have the regular story render it:

```tsx
function EmptyStateBanner() {
  const { t } = useTranslation('individuals');
  return <Banner>{t('list.empty')}</Banner>;
}

export const Empty: Story = {
  render: () => <EmptyStateBanner />,
};
```

### 4. `play()` is the test — assert behavior, not implementation

Use `play()` to drive interactions and assert what a user can observe:

- ✅ `expect(canvas.getByRole('button', { name: 'Save' })).toBeInTheDocument()`
- ✅ `expect(args.onClick).toHaveBeenCalledOnce()` after `userEvent.click(...)`
- ✅ `expect(input).toHaveAttribute('aria-invalid', 'true')`
- ❌ never `expect(el).toHaveClass('bg-primary')` or `expect(el).toHaveStyle(...)` — those couple tests to the implementation
- ❌ never query by `data-testid` — query by role / label / text / placeholder, like RTL

Run mode: `pnpm vitest run` runs both the `unit` project (jsdom for non-component code) and the `storybook` project (Chromium for component play() functions). `pnpm vitest run --project storybook` to run just stories.

### 5. Fragments inside `.map()`

If a story renders a fragment from `.map()` (matrix-style layouts), use `<Fragment key={…}>` from `react`, never `<>` (CLAUDE.md "Common Pitfalls").

## Authoring Reference

Full guide: [`docs/ui/storybook.md`](../../../docs/ui/storybook.md) — covers the run command, toolbars (theme + locale), the i18n decorator, and the out-of-scope list.

## Iteration

This skill is a starting point. Add rules here when a real pattern emerges (e.g. once we have async components, form composition, or compound components with subcomponent stories). Do not pre-add rules for hypothetical needs.
