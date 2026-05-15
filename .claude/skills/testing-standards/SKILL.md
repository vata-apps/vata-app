---
name: testing-standards
description: Defines testing conventions for the project. Use when writing or reviewing any test surface — `**/*.{test,spec}.{ts,tsx}` for unit tests, AND `src/components/**/*.stories.tsx` since each component story's `play()` function is the component test (run by `@storybook/addon-vitest`). Also use when creating any UI wrapper under `src/components/ui/` — every wrapper ships with a colocated story.
---

# Testing Standards

Apply this skill when writing tests, or when creating/modifying a UI wrapper (its story is its test).

## When to Apply

- Writing or reviewing `**/*.test.{ts,tsx}` or `**/*.spec.{ts,tsx}` files
- Writing or reviewing any `*.stories.tsx` — a component story's `play()` is the component test
- Creating or modifying a wrapper under `src/components/ui/` — it ships with a colocated `<name>.stories.tsx`
- Planning test coverage for a new feature

---

## 1. Core Philosophy — Test Use Cases, Not Implementation

**Tests must validate observable behavior, not implementation details.**

A test should answer: _"Does this feature work correctly from the caller's point of view?"_ — not _"Does this function call that other function with these exact arguments?"_

### What this means in practice

| Bad (implementation detail)                               | Good (use case)                                      |
| --------------------------------------------------------- | ---------------------------------------------------- |
| Assert `db.execute` was called with a specific SQL string | Assert the returned data is correct                  |
| Assert a mock was called with specific internal params    | Assert the state changed as expected                 |
| Assert internal SQL clause structure                      | Assert the right records are created/updated/deleted |
| Snapshot the component's rendered HTML                    | Assert the user can complete an action               |

### Red flags — rewrite if you see these

- `expect(mockFn).toHaveBeenCalledWith(expect.stringContaining('SET name = $1'))` — you're testing SQL syntax, not behavior
- `expect(mockFn).toHaveBeenCalledTimes(3)` — you're testing how many times something was called internally
- A test breaks when you refactor internals without changing behavior

### The right question before writing a test

> "If I completely rewrite the implementation but keep the same behavior, does this test still pass?"

If no → the test is testing implementation, not behavior.

---

## 2. TDD — Tests First

Tests are written **before** implementation code. This is enforced by the `test-writer` agent.

### The flow

1. **Describe** the feature (what the function/component must do)
2. **Write tests** (red) — the `test-writer` agent handles this
3. **Implement** the code to make the tests pass (green)
4. **Refactor** if needed — tests must still pass
5. **Commit** tests + implementation together

### Why tests first

- Forces you to think about the API before the implementation
- Tests written after code tend to mirror the implementation instead of testing behavior
- Red → green confirms the test is actually verifying something

---

## 3. Test Layers

Use two complementary layers:

### Integration tests (TypeScript)

Test complete flows through multiple layers (DB function → manager → returned data), using a real in-memory SQLite database instead of mocking `db.execute`/`db.select`.

**When to use:** `src/db/**`, `src/managers/**`

**Setup:** Use `better-sqlite3` or `sql.js` for an in-memory SQLite that runs the real schema and migrations. This tests the full DB layer without Tauri runtime.

```typescript
// trees.test.ts — test the behavior, not the SQL
it('returns trees sorted by most recently opened first', async () => {
  await createTree({ name: 'Old Tree', filename: 'old.db' });
  await createTree({ name: 'Recent Tree', filename: 'recent.db' });
  await markTreeOpened(recentId);

  const trees = await getAllTrees();

  expect(trees[0].name).toBe('Recent Tree');
  expect(trees[1].name).toBe('Old Tree');
});
```

### Unit tests (TypeScript)

Test pure logic with no side effects: utility functions, query key factories, Zustand store reducers, data transformation helpers.

Only mock at the boundary of your test scope — never mock internal implementation details of the module under test.

### E2E tests (Rust / Tauri)

See section 7.

---

## 4. File Structure

Co-locate tests with source files:

```
src/
  {layer}/
    {module}.ts
    {module}.test.ts      ← test file next to implementation
  test/
    setup.ts               ← global test setup (@testing-library/jest-dom)
    utils.tsx              ← shared renderWithProviders
src-tauri/
  src/
    {module}.rs
    {module}_test.rs      ← Rust tests inline or in _test.rs
```

The exact structure follows the source directories (`src/db/`, `src/managers/`, `src/components/`, etc.).

---

## 5. Naming Conventions

```typescript
describe('TreeList', () => {
  it('shows the most recently opened tree first', async () => { ... });
  it('shows an empty state when no trees exist', async () => { ... });
});

describe('createTree', () => {
  it('makes the new tree available in getAllTrees', async () => { ... });
  it('throws when a tree with the same filename already exists', async () => { ... });
});
```

Rules:

- `describe`: the feature or component under test (not the function name)
- `it`: a plain English statement of what the user/caller observes
- No `should` prefix — state the fact
- No French in test descriptions (CLAUDE.md: English only)

---

## 6. Component Tests — Storybook Stories

UI components are tested through Storybook, not through `*.test.tsx` files. Storybook is also the project's design-system surface.

### Every wrapper ships with a story

Every wrapper under `src/components/ui/` (Button, Input, Dialog, Select, …) ships with a colocated `<name>.stories.tsx` **in the same commit** — no exceptions for "trivial" wrappers. **Do not** create a `<name>.test.tsx` for a component: behavior is verified by `play()` functions inside the stories, which `@storybook/addon-vitest` discovers and runs as Vitest tests in headless Chromium (Playwright).

(Non-component code — DB layer, hooks, libs, managers, store — keeps using regular Vitest unit tests in `*.test.{ts,tsx}` against jsdom.)

### Story-file shape

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ConfirmDialog } from './confirm-dialog';

const meta = {
  title: 'UI/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    title: 'Delete?',
    message: 'Sure?',
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmsOnClick: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Confirm' }));
    await expect(args.onConfirm).toHaveBeenCalledOnce();
  },
};

export const HiddenWhenClosed: Story = {
  args: { isOpen: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  },
};
```

- `title` lives under the `UI/` namespace so primitives sort together.
- `tags: ['autodocs']` — the component's JSDoc renders as Docs automatically. Keep JSDoc rich (`typescript-standards` already requires it).
- One `StoryObj` per variant; add a `Matrix` story for side-by-side variant × size comparison.
- For event-handler args, use `fn()` from `storybook/test` so the Actions panel logs the call AND `play()` can assert on it.
- Providers (theme, i18n, QueryClient) are wired globally in `.storybook/preview.tsx` — stories don't wrap manually.
- Rendering a fragment from `.map()` (matrix layouts) uses `<Fragment key={…}>` from `react`, never `<>` (CLAUDE.md "Common Pitfalls").

### `play()` is the test — assert behavior, not implementation

- ✅ `expect(canvas.getByRole('button', { name: 'Save' })).toBeInTheDocument()`
- ✅ `expect(args.onClick).toHaveBeenCalledOnce()` after `userEvent.click(...)`
- ✅ `expect(input).toHaveAttribute('aria-invalid', 'true')`
- ❌ never `expect(el).toHaveClass('bg-primary')` / `toHaveStyle(...)` — couples the test to implementation
- ❌ never query by `data-testid` — query by role / label / text / placeholder

Query priority (highest to lowest): `getByRole` (interactive elements) → `getByLabelText` (form fields) → `getByText` (static content) → `getByTestId` (last resort only).

### i18n in stories — by atomic-design tier

- **Atoms** (`src/components/ui/` — Button, Input, Badge, …): hardcoded English literals are fine; `t()` not required.
- **Molecules**: case-by-case. A thin composition of atoms (icon button with a static label) → literals fine. A molecule that owns user-facing copy (empty-state card, confirmation banner) → use `t()`.
- **Organisms and pages**: use `t()` for any string that ships to users — the story should look like production usage.

**Never write a dedicated `I18nDemo` story.** When `t()` is needed, weave it into the regular stories — the Locale toolbar in `.storybook/preview.tsx` drives language switching globally. To call hooks, extract a small component inside the file and have the story render it:

```tsx
function EmptyStateBanner() {
  const { t } = useTranslation('individuals');
  return <Banner>{t('list.empty')}</Banner>;
}

export const Empty: Story = {
  render: () => <EmptyStateBanner />,
};
```

### Run modes

`pnpm vitest run` runs both the `unit` project (jsdom, non-component code) and the `storybook` project (Chromium, component `play()` functions). `pnpm vitest run --project storybook` runs just stories.

Full authoring guide: [`docs/ui/storybook.md`](../../../docs/ui/storybook.md) — run command, toolbars (theme + locale), the i18n decorator, the out-of-scope list.

---

## 7. Rust / Tauri Tests

### When to write Rust tests

Do not add placeholder or trivial Rust tests. Add them when there is real logic to validate in `src-tauri/src/`:

- A `#[tauri::command]` function with non-trivial logic
- A data mapping function (e.g., converting a DB row to a struct)
- A helper that validates, transforms, or routes data
- A custom DB query executed from Rust (not via the SQL plugin)

### Unit tests (inline, `#[cfg(test)]`)

Test pure Rust logic: data mapping, error handling, helper functions.

```rust
// src-tauri/src/db/trees.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn maps_db_row_to_tree_struct() {
        let row = RawTree {
            id: 1,
            name: "Smith Family".to_string(),
            filename: "smith.db".to_string(),
            description: None,
            individual_count: 0,
            family_count: 0,
            last_opened_at: None,
            created_at: "2024-01-01T00:00:00".to_string(),
            updated_at: "2024-01-01T00:00:00".to_string(),
        };
        let tree = map_to_tree(row);
        assert_eq!(tree.id, "1");
        assert_eq!(tree.name, "Smith Family");
    }
}
```

### Integration tests (with in-memory SQLite)

When Rust owns DB queries directly, use `rusqlite` with `:memory:` — do not mock SQL.

```rust
// src-tauri/src/db/trees.rs (in #[cfg(test)] block)
use rusqlite::Connection;

fn setup_db() -> Connection {
    let conn = Connection::open_in_memory().unwrap();
    conn.execute_batch(include_str!("../migrations/001_initial.sql")).unwrap();
    conn
}

#[test]
fn created_tree_is_retrievable() {
    let conn = setup_db();
    let id = create_tree(&conn, "Smith Family", "smith.db", None).unwrap();
    let tree = get_tree_by_id(&conn, &id).unwrap().unwrap();
    assert_eq!(tree.name, "Smith Family");
}
```

Add `rusqlite` to `Cargo.toml` under `[dev-dependencies]`:

```toml
[dev-dependencies]
rusqlite = { version = "0.31", features = ["bundled"] }  # check current version in Cargo.lock
```

### E2E tests (tauri-driver / WebDriver)

Reserved for critical flows that cross the Tauri IPC boundary and cannot be covered at a lower level. Use `tauri-driver` with `WebdriverIO`.

Only set this up when the app has stable, non-trivial IPC commands worth protecting.

### Run Rust tests

```bash
cargo test                          # all tests
cargo test db::trees                # specific module
cargo test -- --nocapture           # show println! output
```

---

## 8. What Not to Test

- Auto-generated files (`routeTree.gen.ts`)
- Trivial wrappers with no logic (e.g., `MainLayout.tsx` is just `<div>{children}</div>`)
- `query-keys.ts` — if the only assertions are `['trees', id] === ['trees', id]`, delete the test
- Internal SQL string structure — test the data returned, not the query syntax

---

## 9. What to Test Per Layer

No coverage thresholds. A test's value is measured by its ability to prevent regressions — not by a percentage. 20 useful tests that catch real bugs are better than 100 tests that give a green coverage badge but break on every refactor.

| Layer               | What to test                                           | Approach                                                                                 |
| ------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `src/db/**`         | All public CRUD functions — input/output behavior      | Integration tests with in-memory SQLite                                                  |
| `src/managers/**`   | Orchestration logic and end-to-end workflows           | Integration tests with in-memory SQLite                                                  |
| `src/components/**` | User interactions, error states, conditional rendering | Storybook stories with `play()` (run via `@storybook/addon-vitest` in headless Chromium) |
| `src/hooks/**`      | Data flow and state transitions                        | Vitest + RTL (jsdom)                                                                     |
| `src/lib/**`        | Pure logic, edge cases, round-trip behavior            | Unit tests, no mocks                                                                     |
| Auto-generated      | Nothing — excluded                                     | —                                                                                        |

---

## 10. Common Mistakes to Avoid

- **Every in-memory test database must enable `PRAGMA foreign_keys = ON`**: SQLite disables foreign keys by default; in-memory databases do not inherit PRAGMAs. Always execute this immediately after creating the DB, before running the schema.
- **Apply the same PRAGMAs in tests as production**: At minimum, `foreign_keys = ON`. This ensures tests catch constraint violations that would occur in production.
- **Test DB wrappers must satisfy the `Database` type**: Include `path` and `close()` properties so the wrapper can be passed to functions expecting the Tauri SQL `Database` type.
