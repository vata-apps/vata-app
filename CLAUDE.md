# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production (includes TypeScript compilation)
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript type checking
pnpm preview          # Preview production build

# Database
pnpm db:reset         # Reset Supabase database to initial state (includes seed data)
pnpm db:types         # Generate TypeScript types from Supabase schema
pnpm db:diff          # Generate diff for database changes
```

## Project Architecture

### Core Technology Stack
- **Frontend**: React 19 with TypeScript and Vite
- **Routing**: TanStack Router (v1.130+) with type-safe routing
- **State Management**: TanStack Query for server state
- **UI Framework**: Mantine UI v8 with Tabler icons
- **Backend**: Supabase (database, auth, API)
- **Database**: PostgreSQL via Supabase with RLS policies

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
├── api/           # Supabase API functions organized by module
├── components/    # Shared React components
├── db/           # Database utilities and types
├── lib/          # Core libraries (Supabase client, Query client)
├── router/       # TanStack Router configuration
├── ui/           # Page components and layouts
└── utils/        # Utility functions
```

### Database Architecture
- Uses Supabase with PostgreSQL
- All tables have RLS (Row Level Security) policies
- GEDCOM ID system for genealogy standards compliance
- Hierarchical relationships for places (country → state → city)
- Event system with participants, subjects, and roles
- See `/documentation/database-schema/` for detailed schema docs

## Coding Standards

### TypeScript Rules
- Never use `any` type
- Avoid type casting with `as` when possible
- Reuse types from `database.types.ts` and Supabase `Table<>` generic
- Always validate types after changes
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
- Never use ALTER TABLE statements in development
- Modify CREATE TABLE statements directly in migration files
- Update documentation in `/documentation/database-schema/` after changes
- Database is reset frequently during development

## Important Files
- `src/database.types.ts` - Generated Supabase types (regenerated via `pnpm db:types`)
- `src/lib/supabase.ts` - Supabase client configuration
- `src/router/index.ts` - Main router configuration
- `/documentation/` - Comprehensive project documentation
- `/supabase/migrations/` - Database schema and migration files

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

## Development Notes
- Application comes with comprehensive seed data for testing
- Uses TanStack Query for all data fetching with proper caching
- Implements proper loading and error states throughout
- Follows React 19 best practices and patterns
- All database operations go through dedicated API functions in `src/api/`