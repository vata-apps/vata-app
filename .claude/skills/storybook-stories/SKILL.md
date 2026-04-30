---
name: storybook-stories
description: Ensures every UI wrapper in src/components/ui has a colocated Storybook story. Use when creating or modifying src/components/ui/**/*.tsx (excluding *.test.tsx and *.stories.tsx).
---

# Storybook Stories — UI Wrappers

Storybook is the local design-system surface. Every wrapper under `src/components/ui/` ships with a colocated `<name>.stories.tsx`. No exceptions for "trivial" wrappers.

This skill is intentionally minimal and will be iterated as patterns emerge.

## When to Apply

- Creating a new file under `src/components/ui/` (anything except `*.test.tsx` and `*.stories.tsx`).
- Modifying an existing wrapper's variants, sizes, or props — update the story to reflect the new surface.

## Rules

### 1. Every wrapper has a story

If the file is a UI wrapper (Button, Input, Dialog, Select, …), it ships in the same commit as:

- `<name>.test.tsx` — behavioral tests (see `feedback_ui_wrapper_conventions.md` and the `testing-standards` skill).
- `<name>.stories.tsx` — at minimum: one story per variant, one matrix story (variants × sizes).

### 2. Minimal story-file shape

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

- `title` lives under the `UI/` namespace so primitives sort together.
- `tags: ['autodocs']` — the component's JSDoc renders as Docs automatically. Keep JSDoc rich (the `typescript-standards` and component conventions already require it).
- One `StoryObj` per variant; add a `Matrix` story for side-by-side variant × size comparison.

### 3. Hardcoded strings are fine in stories

Stories are dev-facing fixtures, not the app. Use plain English literals for `children`, `placeholder`, sample values, etc. — `t()` is not required here (CLAUDE.md scopes the i18n rule to client-facing app code; stories are out of scope).

### 4. Stories are visual docs, not tests

Never assert classes, styles, or test IDs inside story `play()` functions. Behavior is verified in `<name>.test.tsx` with React Testing Library. If you want to add a `play()` to drive interactions for visual review, do it without assertions on internals.

### 5. Fragments inside `.map()`

If a story renders a fragment from `.map()` (matrix-style layouts), use `<Fragment key={…}>` from `react`, never `<>` (CLAUDE.md "Common Pitfalls").

## Authoring Reference

Full guide: [`docs/ui/storybook.md`](../../../docs/ui/storybook.md) — covers the run command, toolbars (theme + locale), the i18n decorator, and the out-of-scope list.

## Iteration

This skill is a starting point. Add rules here when a real pattern emerges (e.g. once we have async components, form composition, or compound components with subcomponent stories). Do not pre-add rules for hypothetical needs.
