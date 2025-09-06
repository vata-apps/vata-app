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
pnpm db:generate      # Generate Drizzle migrations from schema changes
pnpm db:migrate       # Apply migrations to SQLite database
pnpm db:studio        # Launch Drizzle Studio for database management
```

## Project Architecture

### Core Technology Stack

- **Desktop Framework**: Tauri v2 for cross-platform desktop apps
- **Frontend**: React 19 with TypeScript and Vite
- **Routing**: TanStack Router (v1.131+) with type-safe routing
- **State Management**: TanStack Query for data fetching and caching
- **UI Framework**: Mantine UI v8 with Tabler icons
- **Database**: SQLite with Drizzle ORM for type-safe queries
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
│   ├── db/        # Drizzle schema, client, and migrations
│   └── tauri/     # Tauri commands and database operations
├── components/    # Shared React components
├── router/        # TanStack Router configuration
├── ui/           # Page components and layouts
├── hooks/        # Custom hooks for data fetching
└── utils/        # Utility functions
src-tauri/        # Rust backend code (minimal)
```

### Database Architecture

- Uses SQLite with Drizzle ORM for type-safe operations
- **UUIDs for all primary keys** - Never use integer IDs, always use UUIDs for better scalability and security
- GEDCOM ID system for genealogy standards compliance
- Hierarchical relationships for places (country → state → city)
- Event system with participants, subjects, and roles

## Coding Standards

### TypeScript Rules

- Never use `any` type
- Avoid type casting with `as` when possible
- Use Drizzle's inferred types from schema definitions
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

- Use Drizzle migrations for all schema changes
- Generate migrations with `pnpm db:generate` after schema updates
- Apply migrations with `pnpm db:migrate`
- Use Drizzle Studio (`pnpm db:studio`) for database inspection
- **Development tip**: In development phase (pre-production), delete all migrations and regenerate clean ones instead of creating complex migration chains
- **Migration naming**: Rename generated migration files from random names (e.g., `0000_loose_silhouette.sql`) to descriptive names (e.g., `0000_initial_schema.sql`) and update the corresponding `tag` in `meta/_journal.json`

### Database Best Practices

- ALWAYS use Drizzle ORM (`getDb()`) for all database operations - NEVER use Tauri Database API directly
- **Use UUIDs for all primary keys** - Import `{ v4 as uuidv4 } from "uuid"` and use `.$defaultFn(() => uuidv4())`
- All foreign key relationships MUST include appropriate ON DELETE actions (SET NULL, CASCADE, etc.)
- Use Drizzle's type-safe queries instead of raw SQL to maintain type safety
- Leverage Drizzle's inferred types for consistent typing across the application

## Important Files

- `src/lib/db/schema.ts` - Drizzle database schema definitions
- `src/lib/db/client.ts` - SQLite database client setup
- `src/lib/tauri/commands.ts` - Tauri command wrappers
- `src/router/index.ts` - Main router configuration
- `src-tauri/src/main.rs` - Tauri backend entry point (minimal Rust)
- `drizzle.config.ts` - Drizzle configuration

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

## Development Notes

- Desktop-first application with offline functionality
- Uses TanStack Query for data fetching and caching
- All database operations go through Tauri commands and Drizzle ORM
- Implements proper loading and error states throughout
- Follows React 19 and Tauri best practices
- Minimal Rust code - most logic stays in TypeScript
