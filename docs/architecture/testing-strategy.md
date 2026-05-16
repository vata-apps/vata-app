# Testing Strategy

## Philosophy

**Test use cases, not implementation details.**

A test should answer: _"Does this feature work correctly from the caller's point of view?"_ — not _"Does this function call that other function with these exact arguments?"_

A good test survives a complete internal refactoring as long as the observable behavior is unchanged. If a test breaks when you rename a variable or restructure a SQL query without touching behavior, the test is wrong.

---

## Tooling

| Tool                        | Role                                      | Status                                   |
| --------------------------- | ----------------------------------------- | ---------------------------------------- |
| Vitest 2                    | Test runner (TypeScript)                  | In use                                   |
| @testing-library/react      | React component tests                     | In use                                   |
| @testing-library/user-event | User interaction simulation               | In use                                   |
| better-sqlite3              | In-memory SQLite for DB integration tests | In use                                   |
| cargo test                  | Rust unit and integration tests           | When custom Rust commands exist          |
| tauri-driver                | E2E tests across the IPC boundary         | Future — when stable commands justify it |

Vitest is pinned to v2 for compatibility with Vite 5. The test configuration lives in `vitest.config.ts` (separate from `vite.config.ts` to avoid version conflicts).

Test commands (`pnpm test`, `pnpm test:coverage`, `cargo test`) are listed in `CLAUDE.md`.

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

The `src-tauri/` crate is currently a plugin-composition shell with no custom `#[tauri::command]` functions and no business logic. **There is nothing to test in Rust today** — do not add placeholder or trivial Rust tests.

Add Rust tests as soon as any of these appear in `src-tauri/src/`:

- A `#[tauri::command]` with non-trivial logic
- A data mapping function (DB row → struct)
- A helper that validates, transforms, or routes data
- A custom SQL query executed from Rust (not via `tauri-plugin-sql`)

When that happens, use inline `#[cfg(test)]` blocks for pure logic and `rusqlite` with an in-memory connection for SQL — do not mock SQL. E2E coverage via `tauri-driver` is reserved for flows that cross the IPC boundary and cannot be covered at a lower level; set it up only when the app has stable, non-trivial IPC commands worth protecting.

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
