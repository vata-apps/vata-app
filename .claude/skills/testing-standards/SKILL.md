---
name: testing-standards
description: Defines testing conventions for the project. Use when writing or reviewing test files (**/*.{test,spec}.{ts,tsx}), setting up test infrastructure, or planning test coverage for a new feature.
---

# Testing Standards

Apply this skill when writing tests.

## When to Apply

- Writing or reviewing `**/*.test.{ts,tsx}` or `**/*.spec.{ts,tsx}` files
- Setting up the test runner or test utilities
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

## 2. Test Layers

Use two complementary layers:

### Integration tests (TypeScript)

Test complete flows through multiple layers (DB function → manager → returned data), using a real in-memory SQLite database instead of mocking `db.execute`/`db.select`.

**When to use:** `src/db/**`, `src/managers/**`, `src/hooks/**`

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

## 3. Project Setup

**Vitest 2** (compatible with Vite 5) + `@testing-library/react`:

```bash
pnpm add -D vitest@^2 @vitest/coverage-v8@^2 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Use a **separate `vitest.config.ts`** (not inside `vite.config.ts`) to avoid Vite/Vitest version conflicts:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      $: path.resolve(__dirname, './src'),
      $lib: path.resolve(__dirname, './src/lib'),
      $components: path.resolve(__dirname, './src/components'),
      $hooks: path.resolve(__dirname, './src/hooks'),
      $managers: path.resolve(__dirname, './src/managers'),
      $db: path.resolve(__dirname, './src/db'),
      $types: path.resolve(__dirname, './src/types'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      exclude: ['src/routeTree.gen.ts', 'src/main.tsx'],
    },
  },
});
```

Scripts in `package.json`:

```json
"test": "vitest",
"test:coverage": "vitest run --coverage"
```

---

## 4. File Structure

Co-locate tests with source files:

```
src/
  db/
    system/
      trees.ts
      trees.test.ts        ← integration test with in-memory SQLite
  managers/
    IndividualManager.ts
    IndividualManager.test.ts
  components/
    TreeCard.tsx
    TreeCard.test.tsx
  test/
    setup.ts               ← global test setup (@testing-library/jest-dom)
    utils.tsx              ← shared renderWithProviders
src-tauri/
  src/
    db/
      trees.rs
      trees_test.rs        ← Rust unit + integration tests
```

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

## 6. React Component Tests

Use `@testing-library/react`. Test what the user sees and does, not internal state:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '$components/ConfirmDialog';

it('calls onConfirm when the user clicks the confirm button', async () => {
  const onConfirm = vi.fn();
  render(<ConfirmDialog isOpen title="Delete?" message="Sure?" onConfirm={onConfirm} onCancel={vi.fn()} />);

  await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

  expect(onConfirm).toHaveBeenCalledOnce();
});

it('does not render when closed', () => {
  const { container } = render(
    <ConfirmDialog isOpen={false} title="Delete?" message="Sure?" onConfirm={vi.fn()} onCancel={vi.fn()} />
  );
  expect(container).toBeEmptyDOMElement();
});
```

Query priority (highest to lowest):

1. `getByRole` — preferred for interactive elements
2. `getByLabelText` — for form fields
3. `getByText` — for static content
4. `getByTestId` — last resort only

Wrap components in providers via a shared utility:

```typescript
// src/test/utils.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    options
  );
}
```

---

## 7. Rust / Tauri Tests

### Current state

The `src-tauri/` crate is currently a **plugin-composition shell** — no custom `#[tauri::command]` functions, no business logic in Rust. All DB access goes through `tauri-plugin-sql` invoked from the frontend. **There is nothing to test in Rust today.**

Do not add placeholder or trivial Rust tests. Add them when there is real logic to validate.

### When to write Rust tests

Write Rust tests as soon as any of the following appear in `src-tauri/src/`:

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
rusqlite = { version = "0.31", features = ["bundled"] }
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

## 9. Coverage Goals

| Layer                | Target                                 | Approach                                |
| -------------------- | -------------------------------------- | --------------------------------------- |
| `src/db/**`          | High — all public functions            | Integration tests with in-memory SQLite |
| `src/managers/**`    | High — all business logic              | Integration tests                       |
| `src/components/**`  | Critical interactions and error states | RTL behavior tests                      |
| `src/hooks/**`       | All custom hooks                       | Vitest + RTL                            |
| `src-tauri/src/**`   | High — all DB functions and commands   | Rust unit + integration tests           |
| Auto-generated files | Excluded                               | —                                       |
