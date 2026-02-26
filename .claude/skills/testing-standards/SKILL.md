---
name: testing-standards
description: Defines testing conventions for the project. Use when writing or reviewing test files (**/*.{test,spec}.{ts,tsx}), setting up test infrastructure, or planning test coverage for a new feature.
---

# Testing Standards

Apply this skill when writing tests. Tests are not yet set up in the project (planned for a future MVP), but this skill defines the conventions to follow when they are introduced.

## When to Apply

- Writing or reviewing `**/*.test.{ts,tsx}` or `**/*.spec.{ts,tsx}` files
- Setting up the test runner or test utilities
- Planning test coverage for a new feature

---

## 1. Recommended Setup

Use **Vitest** — it integrates with Vite natively and has a Jest-compatible API.

```bash
pnpm add -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event jsdom
```

Add to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  // ... existing config
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

---

## 2. File Structure

Co-locate tests with source files:

```
src/
  db/
    system/
      trees.ts
      trees.test.ts        ← co-located
  managers/
    IndividualManager.ts
    IndividualManager.test.ts
  components/
    TreeCard.tsx
    TreeCard.test.tsx
  test/
    setup.ts               ← global test setup
    utils.tsx              ← shared renderWithProviders, mocks
    mocks/
      plugin-sql.ts        ← Tauri SQL plugin mock
```

---

## 3. Naming Conventions

```typescript
// Describe the module or function under test
describe('getAllTrees', () => {
  // Describe the scenario as a plain English fact
  it('returns all trees sorted by last opened date', async () => {
    // Arrange
    // Act
    // Assert
  });

  it('returns an empty array when no trees exist', async () => {
    // ...
  });
});
```

Rules:

- `describe`: module or function name
- `it`: plain English sentence starting with a verb (`returns`, `throws`, `calls`, `updates`)
- No `should` prefix — write the fact, not the expectation
- No French in test descriptions (CLAUDE.md: English only)

---

## 4. Mocking Tauri Plugins

Mock `@tauri-apps/plugin-sql` for DB layer unit tests:

```typescript
// src/test/mocks/plugin-sql.ts
import { vi } from 'vitest';

export const mockDb = {
  execute: vi.fn().mockResolvedValue({ rowsAffected: 1, lastInsertId: 1 }),
  select: vi.fn().mockResolvedValue([]),
  close: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@tauri-apps/plugin-sql', () => ({
  default: {
    load: vi.fn().mockResolvedValue(mockDb),
  },
}));
```

Use an in-memory SQLite (via `better-sqlite3` or `sql.js`) for integration tests of DB layer functions.

---

## 5. React Component Tests

Use `@testing-library/react`. Test behavior, not implementation:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TreeCard } from '$components/TreeCard'

it('displays the tree name', () => {
  render(<TreeCard tree={mockTree} />)
  expect(screen.getByText('Smith Family')).toBeInTheDocument()
})

it('calls onDelete when the delete button is clicked', async () => {
  const onDelete = vi.fn()
  render(<TreeCard tree={mockTree} onDelete={onDelete} />)
  await userEvent.click(screen.getByRole('button', { name: /delete/i }))
  expect(onDelete).toHaveBeenCalledWith(mockTree.id)
})
```

Query priority (highest to lowest):

1. `getByRole` — preferred for interactive elements
2. `getByLabelText` — for form fields
3. `getByText` — for static content
4. `getByTestId` — last resort only

Wrap components in app providers via a shared utility:

```typescript
// src/test/utils.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { render, type RenderOptions } from '@testing-library/react'

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    options
  )
}
```

---

## 6. Coverage Goals

When tests are introduced:

| Layer                | Target                                 |
| -------------------- | -------------------------------------- |
| `src/db/**`          | 90%+ line coverage                     |
| `src/managers/**`    | 80%+ line coverage                     |
| `src/components/**`  | Critical interactions and error states |
| `src/hooks/**`       | All custom hooks                       |
| Auto-generated files | Excluded (`routeTree.gen.ts`)          |
