# Testing Setup

This project uses Vitest for unit testing with TypeScript support.

## Running Tests

```bash
# Run tests once
pnpm test:run

# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui
```

## Test Structure

- **Test files**: `*.test.ts` files alongside the source code
- **Setup file**: `src/test/setup.ts` - Contains global test configuration and mocks
- **Configuration**: `vitest.config.ts` - Vitest configuration with path aliases
- **TypeScript config**: `tsconfig.test.json` - TypeScript configuration for tests

## Mocking Strategy

The tests use Vitest's mocking capabilities to mock:

- Tauri plugins (`@tauri-apps/plugin-fs`, `@tauri-apps/plugin-sql`, etc.)
- Database modules (`$db/system`, `$db/trees`)
- File system operations

## Test Coverage

The current test suite covers:

- Tree creation with database initialization
- Tree updates with file renaming
- Tree deletion with file cleanup
- Error handling and rollback scenarios
- Helper function behavior

## Writing New Tests

When adding new tests:

1. Follow the existing naming convention: `describe('ModuleName', () => { ... })`
2. Use descriptive test names that explain the expected behavior
3. Mock all external dependencies
4. Test both success and error scenarios
5. Verify that database operations and file system changes are properly mocked

## TypeScript Configuration

The tests use a separate TypeScript configuration (`tsconfig.test.json`) that:

- Extends the main `tsconfig.json`
- Includes only test files and necessary source modules
- Excludes React components and main application files
- Provides proper type definitions for Vitest and Node.js

If you encounter TypeScript errors in tests:

1. Ensure the file is included in `tsconfig.test.json`
2. Check that path aliases are properly configured in `vitest.config.ts`
3. Verify that all necessary type definitions are installed
