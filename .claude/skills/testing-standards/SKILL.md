---
name: testing-standards
description: Defines testing conventions for the project. Use when writing or reviewing any test surface — `**/*.{test,spec}.{ts,tsx}` for Vitest unit and integration tests, including component tests in `src/components/**`. In-memory SQLite covers the DB layer.
---

# Testing Standards

Apply this skill when writing or reviewing tests.

## When to Apply

- Writing or reviewing `**/*.test.{ts,tsx}` or `**/*.spec.{ts,tsx}` files
- Writing or reviewing component tests for application organisms under `src/components/**`
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

## 6. Component Tests — Vitest + RTL

The UI foundation is Radix Themes, consumed directly (see ADR-007). Radix Themes components are owned and tested upstream — **do not write tests for raw Radix Themes usage**. What gets tested is the project's own **application organisms** under `src/components/` (`tree-shell`, `tree-nav`, `app-status-bar`, `preferences-popover`, `dropzone`, …): their applicative behavior, conditional rendering, and user interactions.

Component tests are regular Vitest tests in a colocated `<name>.test.tsx`, run with React Testing Library against jsdom — the same harness as the rest of the suite.

### Test-file shape

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('calls onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="Delete?"
        message="Sure?"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('renders nothing when closed', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Delete?"
        message="Sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

- Wrap the render in shared providers (theme, i18n, QueryClient) via `renderWithProviders` from `src/test/utils.tsx` when the component needs them.
- Rendering a fragment from `.map()` uses `<Fragment key={…}>` from `react`, never `<>` (CLAUDE.md "Common Pitfalls").

### Assert behavior, not implementation

- ✅ `expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()`
- ✅ `expect(onClick).toHaveBeenCalledOnce()` after `userEvent.click(...)`
- ✅ `expect(input).toHaveAttribute('aria-invalid', 'true')`
- ❌ never `expect(el).toHaveClass(...)` / `toHaveStyle(...)` — couples the test to implementation
- ❌ never query by `data-testid` — query by role / label / text / placeholder

Query priority (highest to lowest): `getByRole` (interactive elements) → `getByLabelText` (form fields) → `getByText` (static content) → `getByTestId` (last resort only).

### i18n in component tests

Application organisms ship user-facing copy through `t()`. Tests run against the real i18n instance, so query by the rendered English string (the default locale). When a test needs another locale, switch it explicitly via `i18n.changeLanguage()` in the test setup.

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

| Layer               | What to test                                                                      | Approach                                |
| ------------------- | --------------------------------------------------------------------------------- | --------------------------------------- |
| `src/db/**`         | All public CRUD functions — input/output behavior                                 | Integration tests with in-memory SQLite |
| `src/managers/**`   | Orchestration logic and end-to-end workflows                                      | Integration tests with in-memory SQLite |
| `src/components/**` | Application organism behavior — interactions, error states, conditional rendering | Vitest + RTL (jsdom) — see §6           |
| `src/hooks/**`      | Data flow and state transitions                                                   | Vitest + RTL (jsdom)                    |
| `src/lib/**`        | Pure logic, edge cases, round-trip behavior                                       | Unit tests, no mocks                    |
| Auto-generated      | Nothing — excluded                                                                | —                                       |

---

## 10. Common Mistakes to Avoid

- **Every in-memory test database must enable `PRAGMA foreign_keys = ON`**: SQLite disables foreign keys by default; in-memory databases do not inherit PRAGMAs. Always execute this immediately after creating the DB, before running the schema.
- **Apply the same PRAGMAs in tests as production**: At minimum, `foreign_keys = ON`. This ensures tests catch constraint violations that would occur in production.
- **Test DB wrappers must satisfy the `Database` type**: Include `path` and `close()` properties so the wrapper can be passed to functions expecting the Tauri SQL `Database` type.
