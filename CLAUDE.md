# CLAUDE.md

Development guidance for Claude Code when working with this genealogy application.

## Quick Start

**Commands:**

```bash
pnpm tauri dev        # Development mode (recommended)
pnpm build            # Production build with TypeScript compilation
```

**Tech Stack:** Tauri v2 + React 19 + TypeScript + SQLite + Mantine UI

**Core Modules:** Individuals, Families, Places, Events, Trees (genealogy data)

## Project Architecture

### Technology Stack

- **Desktop**: Tauri v2 (cross-platform, minimal Rust backend)
- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: TanStack Router (type-safe)
- **State**: TanStack Query (data fetching/caching)
- **UI**: Mantine UI v8 + Tabler icons
- **Database**: SQLite via native Tauri Database API

### Directory Structure

```
src/
├── lib/
│   ├── db/        # Database types, migrations, schema
│   ├── tauri/     # Database operations and commands
│   └── menu.ts    # Native macOS menu system
├── components/    # Shared React components
├── ui/           # Page components and layouts
├── hooks/        # Custom hooks for data fetching
└── router/       # TanStack Router configuration
src-tauri/        # Rust backend (minimal)
```

### Database Design

- **SQLite** with native Tauri Database API (via connection helpers)
- **UUID primary keys** for all tables (never integers)
- **Snake_case** column names matching TypeScript interfaces
- **GEDCOM compliance** for genealogy standards
- **Tree isolation** - each family tree = separate SQLite file
- **Two databases**: Tree data (`trees/name.db`) + metadata (`trees-metadata.db`)

## Coding Standards

### Essential Rules

**TypeScript:**

- Never use `any` type or `as` casting
- Interfaces match SQLite columns (snake_case)
- Use TypeScript generics: `database.select<Place[]>()`

**Naming:**

- Files: `kebab-case.tsx`
- Variables/functions: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `ALL_CAPS`

**Code Style:**

- Use `const` over `let`
- Functional components only
- Proper error handling for database operations

### Database Requirements

**CRITICAL: Use database connection helpers from `src/lib/db/connection.ts`**

```typescript
// ✅ CORRECT: Standard pattern
import { withTreeDb } from "./db/connection";
import { v4 as uuidv4 } from "uuid";

// Tree-specific operations
export const myModule = {
  async getById(treeName: string, id: string): Promise<Place | null> {
    return withTreeDb(treeName, async (database) => {
      const result = await database.select<Place[]>(
        "SELECT id, name, type_id FROM places WHERE id = ?",
        [id],
      );
      return result[0] || null;
    });
  },
};
```

**Must-follow patterns:**

- Use `withTreeDb()` or `withMetadataDb()` wrapper functions
- UUID primary keys (manual generation with `uuidv4()`)
- Parameterized queries (prevent SQL injection)
- Explicit column names (no `SELECT *`)
- Snake_case column names matching TypeScript interfaces
- Export objects with methods, not standalone functions

## Key Files

**Database Layer:**

- `src/lib/db/connection.ts` - Database connection helpers (`withTreeDb`, `withMetadataDb`)
- `src/lib/db/types.ts` - TypeScript interfaces matching SQLite schema
- `src/lib/db/migrations.ts` - Schema definitions and initialization
- `src/lib/places.ts` - Places CRUD operations (reference implementation)

**Application Core:**

- `src/lib/menu.ts` - Native macOS menu system
- `src/router/index.ts` - TanStack Router configuration
- `src-tauri/src/main.rs` - Rust backend entry point

## Development Workflow

**Data Location:**

- Trees: `~/Library/Application Support/com.stivaugoin.vata-app/trees/`
- Metadata: `~/Library/Application Support/com.stivaugoin.vata-app/trees-metadata.db`
- Reset all: `rm -rf "~/Library/Application Support/com.stivaugoin.vata-app"`

**Commit Standards:**

- Format: `type: description` (under 100 chars)
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Always check `git status` and `git diff` before committing

## Code Quality Guidelines

**Component Architecture:**

- Page components: < 200 lines
- Reusable components: < 100 lines
- Extract custom hooks for data logic (separation of concerns)
- Keep components focused on UI, not business logic

**Clean Code Practices:**

- Use consistent static imports (avoid dynamic imports)
- Let errors bubble up to hook/component level
- No redundant comments or temporary code
- Self-documenting code through clear naming
- Event handlers prefixed with "handle"

**Anti-Patterns to Avoid:**

- Components mixing UI + data + business logic
- Wrapping every database operation in try/catch
- Generic function names (`createTree` → `handleCreateTree`)
- Mixing arrow functions with function declarations

## Database CRUD Reference

**Standard operations pattern:**

```typescript
import { withTreeDb } from "./db/connection";
import { v4 as uuidv4 } from "uuid";

export const myModule = {
  // CREATE
  async create(treeName: string, input: CreateInput): Promise<MyType> {
    return withTreeDb(treeName, async (database) => {
      const id = uuidv4();
      await database.execute(
        "INSERT INTO my_table (id, name, type_id) VALUES (?, ?, ?)",
        [id, input.name, input.typeId],
      );

      const result = await database.select<MyType[]>(
        "SELECT id, name, type_id FROM my_table WHERE id = ?",
        [id],
      );
      return result[0];
    });
  },

  // UPDATE with dynamic query building
  async update(
    treeName: string,
    id: string,
    updates: UpdateInput,
  ): Promise<MyType> {
    return withTreeDb(treeName, async (database) => {
      const updateFields: string[] = [];
      const values: (string | null)[] = [];

      if (updates.name !== undefined) {
        updateFields.push("name = ?");
        values.push(updates.name);
      }

      values.push(id);
      await database.execute(
        `UPDATE my_table SET ${updateFields.join(", ")} WHERE id = ?`,
        values,
      );

      const result = await database.select<MyType[]>(
        "SELECT id, name, type_id FROM my_table WHERE id = ?",
        [id],
      );
      return result[0];
    });
  },
};
```

**Database checklist:**

- [ ] Uses `withTreeDb()` or `withMetadataDb()` wrapper functions
- [ ] Parameterized queries (prevent SQL injection)
- [ ] TypeScript generics: `database.select<Place[]>()`
- [ ] Explicit column names (no `SELECT *`)
- [ ] Manual UUID generation with `uuidv4()`
- [ ] Export objects with methods, not standalone functions

## Native Menu System

**Architecture:** Native Tauri menus with macOS integration

**Key Files:**

- `src/lib/menu.ts` - Menu structure and window management
- `src-tauri/src/lib.rs` - Rust event handling (forwards to TypeScript)
- `src/App.tsx` - Menu initialization and event routing

**Menu Structure:** App Menu (About, Preferences), File Menu (New, Open, Save), Edit Menu (system-handled), Window Menu (system-handled)

**Implementation Pattern:**

```typescript
// Menu creation with keyboard shortcuts
const menu = await Menu.new({
  items: [appSubmenu, fileSubmenu, editSubmenu, windowSubmenu],
});

// Event handling
const unlisten = await listen<string>("menu", (event) => {
  switch (event.payload) {
    case "preferences":
      openPreferencesWindow();
      break;
  }
});
```

**Window Management:**

- Check for existing windows before creating new ones
- Use `WebviewWindow.getByLabel()` for window reuse
- Proper focus and visibility management

**Development Notes:**

- Menu updates require full Tauri dev server restart
- Test after restart, not just hot-reload
- macOS may cache menu structures - kill processes if needed

# Testing Guidelines

## Writing Meaningful Tests

**CRITICAL RULE: Only write tests that can catch bugs in OUR application code.**

### ✅ Tests We Want (Focus on Business Logic)

**Database Operations & Business Logic:**

```typescript
// ✅ GOOD: Tests critical business rules
it("should prevent deleting place types that are in use", async () => {
  // Tests our validation logic, not the framework
});

// ✅ GOOD: Tests data integrity
it("should handle null coordinates properly", async () => {
  // Tests our data validation, edge cases
});

// ✅ GOOD: Tests critical workflows
it("should be idempotent - multiple calls should not duplicate data", async () => {
  // Tests our initialization logic
});
```

**Error Handling & Edge Cases:**

- Database connection failures
- Invalid data validation
- Business rule enforcement
- Data corruption prevention
- Performance with large datasets

**Integration Points:**

- Database schema validation
- File system operations (trees management)
- Cross-module data consistency

### ❌ Tests We DON'T Want (Framework Testing)

**React Query/TanStack Query Tests:**

```typescript
// ❌ BAD: Tests TanStack Query, not our code
it("should invalidate cache when mutation succeeds", () => {
  // This tests the framework, not our business logic
});

// ❌ BAD: Tests React hooks behavior
it("should return loading state initially", () => {
  // React Query is already tested by its maintainers
});
```

**Tauri API Tests:**

```typescript
// ❌ BAD: Tests Tauri APIs
it("should create menu with correct configuration", () => {
  // Tauri menu creation is tested by Tauri team
});

// ❌ BAD: Tests external APIs
it("should call WebviewWindow.getByLabel", () => {
  // We don't control this API, it's not our bug to catch
});
```

**Mock-Heavy Tests:**

```typescript
// ❌ BAD: Mocks everything, tests nothing
it("should call all methods in correct order", () => {
  // If everything is mocked, we're not testing real behavior
});
```

### Testing Checklist

Before writing a test, ask:

1. **Does this test OUR business logic?**
   - ✅ Yes: Write it
   - ❌ No: Skip it

2. **Can this test catch a real bug in our code?**
   - ✅ Yes: Write it
   - ❌ No: Skip it

3. **Am I testing the framework instead of our code?**
   - ✅ Testing our code: Write it
   - ❌ Testing framework: Skip it

4. **Does this test duplicate what the framework already tests?**
   - ✅ Tests our unique logic: Write it
   - ❌ Duplicates framework tests: Skip it

### Test Organization

**Keep tests focused and minimal:**

- Test files should be co-located with business logic (`*.test.ts`)
- Avoid testing React Query hooks separately
- Focus on CRUD operations, validation, and business rules
- Test database operations with real scenarios
- Test error conditions and edge cases

**Quality over Quantity:**

- 80 focused tests > 300 redundant tests
- Each test should serve a specific purpose
- Delete tests that don't add value
- Code coverage is NOT the goal - catching bugs IS the goal

Remember: **We want tests that fail when we introduce bugs, not when we upgrade dependencies.**
