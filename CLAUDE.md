# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
pnpm dev              # Start Vite development server (frontend only)
pnpm tauri dev        # Start Tauri development mode (frontend + desktop app)
pnpm build            # Build for production (includes TypeScript compilation)
pnpm tauri build      # Build desktop application for production
pnpm preview          # Preview production build

# Database
# Note: Database operations now use native Tauri Database API
# No external database commands needed - schema managed in code
```

## Project Architecture

### Core Technology Stack

- **Desktop Framework**: Tauri v2 for cross-platform desktop apps
- **Frontend**: React 19 with TypeScript and Vite
- **Routing**: TanStack Router (v1.131+) with type-safe routing
- **State Management**: TanStack Query for data fetching and caching
- **UI Framework**: Mantine UI v8 with Tabler icons
- **Database**: SQLite with native Tauri Database API for direct SQL operations
- **Backend**: Rust via Tauri (minimal, mostly for SQLite access)

### Application Structure

This is a genealogy application with these core modules:

- **Individuals**: Core module for family members with detailed profiles
- **Names**: Support for different name variations (birth, marriage, nickname)
- **Families**: Module for creating relationships between individuals
- **Places**: Geographic locations with hierarchical relationships
- **Events**: Life events connected to individuals and families
- **Trees**: Family tree organization system

### Key Directories

```
src/
├── lib/
│   ├── db/        # Database types and migrations
│   └── tauri/     # Tauri commands and database operations
├── components/    # Shared React components
├── router/        # TanStack Router configuration
├── ui/           # Page components and layouts
├── hooks/        # Custom hooks for data fetching
└── utils/        # Utility functions
src-tauri/        # Rust backend code (minimal)
```

### Database Architecture

- Uses SQLite with native Tauri Database API for direct SQL operations
- **UUIDs for all primary keys** - Never use integer IDs, always use UUIDs for better scalability and security
- GEDCOM ID system for genealogy standards compliance
- Hierarchical relationships for places (country → state → city)
- Event system with participants, subjects, and roles
- Schema managed through SQL DDL in migration files

## Coding Standards

### TypeScript Rules

- Never use `any` type
- Avoid type casting with `as` when possible
- Use TypeScript interfaces that match SQLite column names (snake_case)
- Always validate types after schema changes
- Prefix generic type parameters with `T` (e.g., `TKey`, `TValue`)

### Naming Conventions

- Files: kebab-case (`my-component.tsx`)
- Variables/Functions: camelCase (`myFunction`)
- Classes/Types/Interfaces: PascalCase (`MyInterface`)
- Constants/Enums: ALL_CAPS (`MAX_COUNT`)

### Code Style

- Use `const` instead of `let` (immutable code)
- Avoid ternary operators; use IIFE for conditionals
- Use functional components with TypeScript
- Implement proper error handling for database operations

### Database Changes

- Schema changes are made directly in `src/lib/db/migrations.ts`
- Use standard SQL DDL (CREATE TABLE, ALTER TABLE, etc.)
- Database initialization handled automatically when creating new trees
- For schema updates, modify the `SCHEMA_SQL` constant and update `initializeDatabase()`
- **Development tip**: Test schema changes by creating a new tree to verify initialization

### Database Best Practices

- ALWAYS use Tauri Database API (`Database.load()`) for all database operations
- **Use UUIDs for all primary keys** - Import `{ v4 as uuidv4 } from "uuid"` and generate manually
- All foreign key relationships MUST include appropriate ON DELETE actions (SET NULL, CASCADE, etc.)
- Use parameterized queries to prevent SQL injection
- Define TypeScript interfaces that match SQLite column names (snake_case)
- Handle SQLite data type conversions (INTEGER for booleans, proper date parsing)

## Important Files

- `src/lib/db/types.ts` - TypeScript interface definitions matching SQLite schema
- `src/lib/db/migrations.ts` - Database schema and initialization logic
- `src/lib/places.ts` - Places module with direct SQLite operations
- `src/lib/tauri/commands.ts` - Tauri command wrappers
- `src/lib/menu.ts` - Native macOS menu system with keyboard shortcuts
- `src/lib/theme/` - Theme management system with Tauri Store persistence
- `src/router/index.ts` - Main router configuration
- `src-tauri/src/main.rs` - Tauri backend entry point (minimal Rust)

## Commit Message Standards

Messages must follow conventional commit format:

- Use English only
- Keep under 100 characters
- Single line format
- Always check `git status` and `git diff` before committing

### Conventional Commit Types

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code formatting (no logic changes)
- `refactor:` - Code restructuring (no feature changes)
- `test:` - Adding or modifying tests
- `chore:` - Maintenance tasks, dependency updates

### Examples

```bash
feat: add user authentication system
fix: resolve login page crash on mobile devices
docs: update API documentation for Places module
refactor: simplify database query functions
chore: update dependencies to latest versions
```

## Code Quality Lessons Learned

### Clean Code Principles Applied (2025-01-15)

**Problem Patterns to Avoid:**

1. **Overly Complex Components**
   - ❌ Components with 500+ lines (e.g., original `PlacesPage.tsx`)
   - ❌ Mixing UI logic, data fetching, and business logic in one file
   - ✅ Extract custom hooks for data management (`usePlaces.ts`)
   - ✅ Create reusable form components (`PlaceForm.tsx`)
   - ✅ Keep components focused on rendering and user interaction

2. **Inconsistent Import Patterns**
   - ❌ Mixing static imports with dynamic imports for same module
   - ❌ `const Database = await import("@tauri-apps/plugin-sql")`
   - ✅ Use consistent static imports: `import Database from "@tauri-apps/plugin-sql"`
   - ✅ Avoid Vite bundle warnings by maintaining import consistency

3. **Redundant Error Handling**
   - ❌ Wrapping every database operation in try/catch with console.error
   - ❌ Verbose error messages that don't add value
   - ✅ Let errors bubble up to hook/component level for centralized handling
   - ✅ Use meaningful error messages for user-facing operations

4. **Unnecessary Comments and Code Noise**
   - ❌ "Temporary:" comments that become permanent
   - ❌ Obvious comments like "// Create async callback for Drizzle"
   - ❌ Redundant variable assignments like `description: description || undefined`
   - ✅ Self-documenting code through clear function and variable names
   - ✅ Only comment complex business logic or non-obvious decisions

5. **Function Naming Inconsistencies**
   - ❌ Mixing `async function` declarations with arrow functions in same context
   - ❌ Generic names like `createTree()` instead of `handleCreateTree()`
   - ✅ Use consistent arrow function patterns for event handlers
   - ✅ Prefix event handlers with "handle" for clarity

**Refactoring Strategy:**

- Extract data logic into custom hooks (separation of concerns)
- Create reusable UI components for forms and repeated patterns
- Simplify error handling by centralizing at appropriate levels
- Remove code noise (unnecessary comments, verbose try/catches)
- Maintain consistent import and naming patterns

**Component Size Guidelines:**

- Page components: aim for < 200 lines
- Reusable components: aim for < 100 lines
- Custom hooks: focus on single responsibility
- If component grows beyond these limits, consider extraction

### Database Operations - Mandatory Patterns (2025-09-06)

**CRITICAL: ALL database operations use native Tauri Database API directly.**

**Required Database Access Patterns:**

```typescript
// ✅ CORRECT: Tree-specific database operations
import Database from "@tauri-apps/plugin-sql";
import { v4 as uuidv4 } from "uuid";
import { PlaceType, Place } from "../db/types";

const dbPath = `sqlite:trees/${treeName}.db`;
const database = await Database.load(dbPath);
const result = await database.select<Place[]>(
  "SELECT id, created_at, name, type_id, parent_id, latitude, longitude, gedcom_id FROM places ORDER BY name",
);

// ✅ CORRECT: Trees metadata operations
const database = await Database.load("sqlite:trees-metadata.db");
const result = await database.select<
  Array<{
    name: string;
    file_path: string;
    created_at: number;
    description?: string;
  }>
>(
  "SELECT name, file_path, created_at, description FROM trees_metadata WHERE name = ?",
  [name],
);
```

**Standard CRUD Patterns:**

```typescript
// CREATE with manual UUID generation
const id = uuidv4();
await database.execute(
  "INSERT INTO places (id, name, type_id, parent_id, latitude, longitude, gedcom_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
  [id, name, typeId, parentId, latitude, longitude, gedcomId],
);

// READ single item
const result = await database.select<Place[]>(
  "SELECT id, created_at, name, type_id, parent_id, latitude, longitude, gedcom_id FROM places WHERE id = ?",
  [id],
);
return result[0] || null;

// READ multiple with ordering
const results = await database.select<Place[]>(
  "SELECT id, created_at, name, type_id, parent_id, latitude, longitude, gedcom_id FROM places ORDER BY name",
);

// UPDATE with dynamic query building
const updates: string[] = [];
const values: any[] = [];
if (name !== undefined) {
  updates.push("name = ?");
  values.push(name);
}
values.push(id);
await database.execute(
  `UPDATE places SET ${updates.join(", ")} WHERE id = ?`,
  values,
);

// DELETE
await database.execute("DELETE FROM places WHERE id = ?", [id]);

// COUNT
const result = await database.select<Array<{ count: number }>>(
  "SELECT COUNT(*) as count FROM places WHERE parent_id = ?",
  [parentId],
);
return result[0]?.count ?? 0;
```

**Database Initialization Pattern:**

```typescript
// Schema creation with SQL DDL
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS place_types (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
  name TEXT NOT NULL,
  key TEXT
);
`;

await database.execute(SCHEMA_SQL);

// Seed with default data using parameterized queries
for (const placeType of DEFAULT_PLACE_TYPES) {
  await database.execute(
    "INSERT INTO place_types (id, name, key) VALUES (?, ?, ?)",
    [uuidv4(), placeType.name, placeType.key],
  );
}
```

**Type Safety Guidelines:**

```typescript
// ✅ Define interfaces matching SQLite column names
interface Place {
  id: string;
  created_at: string;
  name: string;
  type_id: string; // snake_case matches SQLite
  parent_id: string | null;
  latitude: number | null;
  longitude: number | null;
  gedcom_id: number | null;
}

// ✅ Use TypeScript generics instead of 'as' type casting
const places = await database.select<Place[]>(
  "SELECT id, created_at, name, type_id, parent_id, latitude, longitude, gedcom_id FROM places ORDER BY name",
);

const countResult = await database.select<Array<{ count: number }>>(
  "SELECT COUNT(*) as count FROM places",
);

// ❌ AVOID: Type casting with 'as'
const places = (await database.select(
  "SELECT id, created_at, name, type_id, parent_id, latitude, longitude, gedcom_id FROM places ORDER BY name",
)) as Place[]; // Don't do this!

// ❌ AVOID: SELECT * queries
const places = await database.select<Place[]>(
  "SELECT * FROM places ORDER BY name", // Don't use *, be explicit!
);

// ✅ Handle SQLite data type conversions
const placeTypes = result; // Direct usage when no type conversion needed

// ✅ Safe date handling
const date = place.created_at
  ? new Date(
      typeof place.created_at === "number"
        ? place.created_at * 1000
        : place.created_at,
    )
  : null;
```

**Code Review Checklist:**

- [ ] All database operations use `Database.load()` with proper connection strings
- [ ] Parameterized queries used to prevent SQL injection
- [ ] TypeScript interfaces match SQLite column names (snake_case)
- [ ] TypeScript generics used instead of 'as' type casting (`database.select<T>()`)
- [ ] Explicit column names in SELECT queries (no `SELECT *`)
- [ ] UUIDs generated manually with `uuidv4()`
- [ ] SQLite data types properly converted (INTEGER booleans, timestamps)
- [ ] Proper error handling for database operations
- [ ] No direct string concatenation in SQL queries

## Development Notes

- Desktop-first application with offline functionality
- Uses TanStack Query for data fetching and caching
- All database operations use native Tauri Database API with direct SQL
- Implements proper loading and error states throughout
- Follows React 19 and Tauri best practices
- Minimal Rust code - most logic stays in TypeScript

### Application Data Location

- **Trees storage**: `~/Library/Application Support/com.stivaugoin.vata-app/trees/`
- **Trees metadata**: `~/Library/Application Support/com.stivaugoin.vata-app/trees-metadata.db`
- Each tree has its own SQLite database file: `{tree-name}.db`
- To reset all trees: `rm -rf "~/Library/Application Support/com.stivaugoin.vata-app"`

## Testing Strategy (Planned - 2025-09-06)

### Unit Testing Framework

- **Framework**: Vitest (compatible with Vite, faster than Jest)
- **Environment**: Node.js only (no UI testing initially)
- **Focus**: Business logic and data layer testing only

### Installation

```bash
pnpm add -D vitest @vitest/ui
```

### Configuration

**package.json scripts:**

```json
{
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:coverage": "vitest --coverage"
}
```

**vitest.config.ts:**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});
```

### Testing Priorities

**Priority 1 - Data Layer (Critical)**

- `src/lib/places.ts` - All CRUD operations and business logic
- `src/lib/trees.ts` - Tree management and file operations
- `src/lib/db/migrations.ts` - Database initialization and schema

**Priority 2 - Business Logic Hooks**

- `src/hooks/usePlaces.ts` - State management and async operations
- Other custom hooks with business logic

**Priority 3 - Utilities**

- `src/lib/db/types.ts` - Type validation and conversions
- Utility functions and helpers

### Mocking Strategy

- **Tauri Database API**: Mock `@tauri-apps/plugin-sql` for isolated testing
- **File System**: Mock `@tauri-apps/plugin-fs` operations
- **UUID Generation**: Mock `uuid` for predictable test data
- **Isolated Tests**: Each function tested independently without side effects

### Testing Patterns

- Test pure functions first (easiest wins)
- Mock external dependencies (Database, FileSystem)
- Focus on business logic validation
- Test error handling and edge cases
- Avoid testing implementation details

## Native Menu System (2025-09-08)

### Menu Architecture

The application uses Tauri's native menu system for cross-platform desktop menus with proper macOS integration.

**Key Components:**

- `src/lib/menu.ts` - Complete menu structure and window management
- `src-tauri/src/lib.rs` - Rust-side menu event handling
- `src/App.tsx` - Menu initialization and event routing

### Menu Structure

**macOS Standard Menus:**

1. **App Menu (vata-app)** - About, Preferences (cmd+,), Services, Hide, Quit
2. **File Menu** - New (cmd+N), Open (cmd+O), Save (cmd+S), Save As (cmd+shift+S)
3. **Edit Menu** - Undo, Redo, Cut, Copy, Paste, Select All (system-handled)
4. **Window Menu** - Minimize, Maximize, Close Window (system-handled)

### Implementation Pattern

**TypeScript Menu Creation:**

```typescript
// ✅ CORRECT: Following Tauri v2 best practices
import {
  Menu,
  MenuItem,
  Submenu,
  PredefinedMenuItem,
} from "@tauri-apps/api/menu";

export async function createApplicationMenu() {
  const appSubmenu = await Submenu.new({
    text: "vata-app",
    items: [
      await MenuItem.new({
        id: "preferences",
        text: "Preferences...",
        accelerator: "CmdOrCtrl+,",
      }),
      // ... other items
    ],
  });

  const menu = await Menu.new({
    items: [appSubmenu, fileSubmenu, editSubmenu, windowSubmenu],
  });

  return menu;
}
```

**Rust Event Handling:**

```rust
// ✅ CORRECT: Minimal event forwarding to TypeScript
use tauri::Emitter;

.on_menu_event(|app, event| {
    match event.id().0.as_str() {
        "preferences" => {
            let _ = app.emit_to("main", "menu", "preferences");
        }
        "new" | "open" | "save" | "save_as" | "about" => {
            let _ = app.emit_to("main", "menu", event.id().0.as_str());
        }
        _ => {}
    }
})
```

**Menu Initialization in App:**

```typescript
// ✅ CORRECT: Initialize menu and listen for events
useEffect(() => {
  const setupApp = async () => {
    const menu = await createApplicationMenu();
    await menu.setAsAppMenu();

    const unlisten = await listen<string>("menu", (event) => {
      const menuId = event.payload;
      switch (menuId) {
        case "preferences":
          openPreferencesWindow();
          break;
        // Handle other menu items
      }
    });

    return () => {
      unlisten();
    };
  };

  setupApp();
}, []);
```

### Window Management

**Preferences Window Pattern:**

```typescript
export async function openPreferencesWindow() {
  try {
    // Try to get existing window first
    const existingWindow = await WebviewWindow.getByLabel("preferences");
    if (existingWindow) {
      await existingWindow.show();
      await existingWindow.setFocus();
      return existingWindow;
    }
  } catch {
    // Window doesn't exist, create new one
  }

  // Create new window with proper configuration
  const preferencesWindow = new WebviewWindow("preferences", {
    url: "/preferences",
    title: "Preferences",
    width: 700,
    height: 550,
    center: true,
    maximizable: false,
    // ... other options
  });

  await preferencesWindow.show();
  await preferencesWindow.setFocus();
  return preferencesWindow;
}
```

### Menu Development Guidelines

**Best Practices:**

- Use `PredefinedMenuItem` for standard system items (Cut, Copy, Paste, etc.)
- Use `MenuItem` with custom IDs for application-specific actions
- Always include proper keyboard accelerators (`CmdOrCtrl+Key`)
- Handle menu events in Rust by forwarding to TypeScript via events
- Separate window creation logic into dedicated functions
- Check for existing windows before creating new ones

**Required Tauri Permissions:**

```json
{
  "permissions": [
    "core:window:allow-show",
    "core:window:allow-hide",
    "core:window:allow-set-focus",
    "core:window:allow-center",
    "core:webview:allow-create-webview-window"
  ]
}
```

**Menu Event Flow:**

1. User clicks menu item or uses keyboard shortcut
2. Rust `on_menu_event` handler receives event
3. Event forwarded to TypeScript via `app.emit_to("main", "menu", menuId)`
4. TypeScript `listen("menu")` handler processes the event
5. Appropriate action taken (open window, execute command, etc.)

### Troubleshooting

**Common Issues:**

- **Menu not updating after code changes**: Restart Tauri dev server completely
- **Preferences window not opening**: Check window permissions in tauri.conf.json
- **Menu items missing**: Ensure proper submenu structure (macOS requires all items in submenus)
- **Keyboard shortcuts not working**: Use `CmdOrCtrl+Key` format for cross-platform compatibility

**Development Tips:**

- Test menu functionality after full restart, not just hot-reload
- macOS caches menu structures - kill processes if needed: `pkill -f "vata-app"`
- Use proper TypeScript types from `@tauri-apps/api/menu`
- Follow official Tauri v2 documentation for menu patterns
