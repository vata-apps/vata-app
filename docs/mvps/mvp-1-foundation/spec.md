# MVP1: Foundation — Product Spec

## Objective (JTBD)

**Create, modify, open, close, and delete a tree.**

MVP1 establishes the technical foundation for Vata: a working application shell with tree management capabilities, without any genealogical data yet.

## Target Personas

- **Marie** (beginner): Needs a simple way to create her first tree.
- **Robert** (enthusiast): Needs to manage multiple trees reliably.

## User Stories

- [US-1.1: Create a tree](../../product/user-stories.md#us-11-create-a-tree)
- [US-1.2: Open and close a tree](../../product/user-stories.md#us-12-open-and-close-a-tree)
- [US-1.3: Rename a tree](../../product/user-stories.md#us-13-rename-a-tree)
- [US-1.4: Delete a tree](../../product/user-stories.md#us-14-delete-a-tree)

## Scope

### In

- Tauri project initialization and configuration
- TypeScript, Vite, ESLint, Prettier setup
- Dependency installation (TanStack Query, TanStack Router, Zustand, Tauri plugins)
- Database layer (system.db for tree metadata)
- Tree CRUD operations (create, open, rename, close, delete)
- Minimal HTML layout and Home page

### Out

- Genealogical data (individuals, families, events, places)
- GEDCOM import/export
- UI component library (Mantine is MVP4)
- Internationalization

## Key Decisions

- [ADR-001: Desktop Framework — Tauri](../../decisions/adr-001-desktop-framework.md)
- [ADR-002: Frontend Stack — React, TypeScript, TanStack, Zustand](../../decisions/adr-002-frontend-stack.md)
- [ADR-003: Database Architecture — Dual DB, String IDs](../../decisions/adr-003-database-architecture.md)

## Dependencies

- No dependencies on other MVPs.
- External: `@tauri-apps/plugin-sql`, `@tanstack/react-query`, `@tanstack/react-router`, `zustand`.

## Risks & Mitigation

| Risk                                   | Mitigation                                              |
| -------------------------------------- | ------------------------------------------------------- |
| Tauri plugin compatibility with v2.0   | Test all required plugins early in the setup phase      |
| Database connection management (multi-DB) | Robust error handling, proper open/close lifecycle    |
| TypeScript path alias inconsistencies  | Consistent configuration across Vite, TypeScript, ESLint |

## Success Criteria

- [ ] Application starts (`pnpm tauri dev`) with no console errors
- [ ] system.db created automatically on first launch
- [ ] Tree CRUD operations functional
- [ ] Home page displays and manages the tree list
- [ ] TypeScript with path aliases configured
- [ ] ESLint and Prettier configured and passing
- [ ] Folder structure in place

## Implementation Reference

Development phases and technical details: [MVP1 README](./README.md)
