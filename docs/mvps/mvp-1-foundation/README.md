# MVP1: Foundation

## Job to be Done

**Create, modify, open, close, and delete a tree.**

## Scope

MVP1 establishes the technical infrastructure base: Tauri project setup, configuration, database architecture, and initial UI. **No UI library in MVP1** — HTML-only UI with minimal CSS. shadcn/ui and the design system are added in MVP4.

## Prerequisites

- Node.js and pnpm installed
- Rust toolchain installed
- Basic understanding of React, TypeScript, and Tauri

## Contents

- Tauri project initialization
- TypeScript, Vite, ESLint, Prettier configuration
- Dependency installation (TanStack Query, TanStack Router, Zustand, Tauri plugins)
- Database layer setup (system.db for tree metadata)
- Tree CRUD operations
- Minimal HTML layout and Home page

## Development Phases

1. **[Phase 1: Setup](phase-1-setup.md)** — Tauri project initialization, configuration, dependencies, folder structure
2. **[Phase 2: Database](phase-2-database.md)** — Database connection management, system database schema, tree CRUD operations
3. **[Phase 3: Home UI](phase-3-home-ui.md)** — Minimal HTML layout, Home page with tree list

## Deliverables Checklist

- [x] Application starts (`pnpm tauri dev`)
- [x] No console errors
- [x] TypeScript configuration with path aliases
- [x] ESLint and Prettier configured
- [x] system.db database created automatically
- [x] Tree CRUD operations functional
- [x] Home page displays tree list
- [x] Create/Open/Rename/Delete tree actions work
- [x] Lint and format pass
- [x] Folder structure in place

## Estimated Duration

This MVP establishes the foundation for the entire project. It is the most critical phase and should be completed carefully.

## Next Steps

After completing MVP1, proceed to [MVP2: GEDCOM](../mvp-2-gedcom/README.md) for import/export functionality.
