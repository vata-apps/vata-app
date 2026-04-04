# Testing Strategy

## Philosophy

**Test use cases, not implementation details.**

A test should answer: _"Does this feature work correctly from the caller's point of view?"_ — not _"Does this function call that other function with these exact arguments?"_

A good test survives a complete internal refactoring as long as the observable behavior is unchanged. If a test breaks when you rename a variable or restructure a SQL query without touching behavior, the test is wrong.

---

## Tooling

| Tool                        | Role                                      | MVP introduced                           |
| --------------------------- | ----------------------------------------- | ---------------------------------------- |
| Vitest 2                    | Test runner (TypeScript)                  | MVP3                                     |
| @testing-library/react      | React component tests                     | MVP3                                     |
| @testing-library/user-event | User interaction simulation               | MVP3                                     |
| better-sqlite3              | In-memory SQLite for DB integration tests | MVP3                                     |
| cargo test                  | Rust unit and integration tests           | When custom Rust commands exist          |
| tauri-driver                | E2E tests across the IPC boundary         | Future — when stable commands justify it |

Vitest is pinned to v2 for compatibility with Vite 5. The test configuration lives in `vitest.config.ts` (separate from `vite.config.ts` to avoid version conflicts).

Scripts:

```bash
pnpm test              # watch mode
pnpm test:coverage     # single run with coverage report
cargo test             # Rust tests (run from src-tauri/)
```

---

## Test Layers

### 1. Integration tests — DB layer (TypeScript)

The most valuable tests in the project. They run the full DB function against a real in-memory SQLite instance (via `better-sqlite3`), using the actual schema.

**What they validate:** the data is correctly stored, retrieved, ordered, and mutated — end to end through the DB function, not through mock assertions.

**What they do not do:** assert SQL string contents, count how many times a mock was called, or inspect internal query structure.

Located at: co-located with source files (`src/db/**/*.test.ts`)

```
src/db/
  system/
    trees.ts
    trees.test.ts     ← real SQLite in-memory
  trees/
    individuals.ts
    individuals.test.ts
```

In-memory DB helper: `src/test/sqlite-memory.ts`

### 2. Unit tests — pure logic (TypeScript)

For functions with no side effects: data transformations, Zustand store state transitions, utility helpers.

Only add these when the logic is non-trivial. Do not write unit tests for files that are just re-exports, trivial wrappers, or configuration objects.

**Examples that warrant unit tests:**

- A Zustand store with non-trivial state transitions
- A date formatting helper with edge cases
- A GEDCOM tag mapping function

**Examples that do not:**

- `queryKeys.ts` — just array literals
- `MainLayout.tsx` — just `<div>{children}</div>`

### 3. Component tests — React (TypeScript)

Test what the user sees and can do. Use `@testing-library/react` with `userEvent`. Never assert on internal state, class names, or component structure.

Located at: co-located with source files (`src/components/**/*.test.tsx`)

Query priority:

1. `getByRole` — interactive elements
2. `getByLabelText` — form fields
3. `getByText` — static content
4. `getByTestId` — last resort only

### 4. Rust tests

See [Rust tests](#rust-tests) section below.

---

## Rust Tests

### Current state

The `src-tauri/` crate is currently a plugin-composition shell with no custom `#[tauri::command]` functions and no business logic. **There is nothing to test in Rust today.**

Do not add placeholder or trivial Rust tests.

### When to add Rust tests

Add them as soon as any of these appear in `src-tauri/src/`:

- A `#[tauri::command]` with non-trivial logic
- A data mapping function (DB row → struct)
- A helper that validates, transforms, or routes data
- A custom SQL query executed from Rust (not via `tauri-plugin-sql`)

### Unit tests

Inline `#[cfg(test)]` blocks for pure logic:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn maps_db_row_to_tree_struct() {
        let row = RawTree { id: 1, name: "Smith Family".to_string(), /* ... */ };
        let tree = map_to_tree(row);
        assert_eq!(tree.id, "1");
        assert_eq!(tree.name, "Smith Family");
    }
}
```

### Integration tests (in-memory SQLite)

When Rust owns SQL queries directly, use `rusqlite` with `:memory:` — do not mock SQL.

```toml
# src-tauri/Cargo.toml
[dev-dependencies]
rusqlite = { version = "0.31", features = ["bundled"] }
```

```rust
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

### E2E tests (tauri-driver)

Reserved for flows that cross the Tauri IPC boundary and cannot be covered at a lower level. Only set this up when the app has stable, non-trivial IPC commands worth protecting.

---

## What Not to Test

| Situation                                  | Reason                                            |
| ------------------------------------------ | ------------------------------------------------- |
| Auto-generated files (`routeTree.gen.ts`)  | Not authored code                                 |
| Trivial layout wrappers (`MainLayout.tsx`) | No logic to break                                 |
| Configuration objects (`queryKeys.ts`)     | Assertions would just repeat the definition       |
| SQL string structure                       | Refactor the query freely; test the data returned |
| Internal mock call counts                  | Tests the plumbing, not the outcome               |

---

## Coverage Targets

| Layer               | Target                                 | Approach                                        |
| ------------------- | -------------------------------------- | ----------------------------------------------- |
| `src/db/**`         | All public functions                   | Integration tests — real SQLite in-memory       |
| `src/managers/**`   | All business logic paths               | Integration tests                               |
| `src/components/**` | Critical interactions and error states | RTL behavior tests                              |
| `src/hooks/**`      | All custom hooks                       | Vitest + RTL                                    |
| `src-tauri/src/**`  | All custom commands and DB functions   | Rust unit + integration tests (when they exist) |

Coverage is a signal, not a goal. A 90% coverage score that mostly tests trivial code is worse than 60% coverage on the paths that actually matter.
