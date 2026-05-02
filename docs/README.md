# Vata — Documentation

Desktop application for managing genealogical trees. Local-first, GEDCOM 5.5.1 compatible, built with Tauri + React + TypeScript.

---

## Product

- [PRD](./product/prd.md) — Vision, problem, principles, scope, capabilities
- [Personas](./product/personas.md) — Target user profiles
- [User Stories](./product/user-stories.md) — Stories with acceptance criteria
- [Success Metrics](./product/success-metrics.md) — Performance targets, reliability, definition of done
- [Glossary](./product/glossary.md) — Genealogical and technical terms

## Decisions (ADR)

- [ADR-001: Desktop Framework](./decisions/adr-001-desktop-framework.md) — Tauri over Electron
- [ADR-002: Frontend Stack](./decisions/adr-002-frontend-stack.md) — React, TypeScript, Vite, TanStack, Zustand
- [ADR-003: Database Architecture](./decisions/adr-003-database-architecture.md) — Dual DB, string IDs, layer separation
- [ADR-004: GEDCOM Libraries (in-app)](./decisions/adr-004-gedcom-libraries.md) — gedcom-parser and gedcom-date as in-app modules (@vata-apps/\*)
- [ADR-005: UI Strategy](./decisions/adr-005-ui-strategy.md) — Radix + Tailwind v4 + tailwind-variants
- [ADR-006: Import/Export](./decisions/adr-006-import-export.md) — Two-phase import, round-trip export

## Architecture

- [App Structure](./architecture/app-structure.md) — Two-context model (picker outside vs in-tree shell), lifecycle, invariants for AI agents
- [Overview](./architecture/overview.md) — Global architecture, layers, data flow, state management
- [Database Schema](./architecture/database-schema.md) — Complete data model (system.db + tree.db)
- [Data Flow](./architecture/data-flow.md) — Communication between layers (UI → Hooks → Managers → DB)
- [Tech Stack](./architecture/tech-stack.md) — Technologies, versions, configurations, justifications
- [Testing Strategy](./architecture/testing-strategy.md) — Philosophy, tooling, layers (TS integration, Rust, E2E)

## API

- [Database Layer](./api/database-layer.md) — TypeScript interfaces, connection management, CRUD operations

## User Interface

- [Design System](./ui/design-system.md) — Colors, typography, components
- [Layouts](./ui/layouts.md) — Layout structure
- Screens: [Home](./ui/screens/home.md) · [Tree View](./ui/screens/tree-view.md) · [Individual View](./ui/screens/individual-view.md) · [Family View](./ui/screens/family-view.md) · [Sources](./ui/screens/sources.md)

## References

- [GEDCOM 5.5.1 Mapping](./references/gedcom-551-mapping.md) — GEDCOM tag to Vata model correspondences
- [Date Formats](./references/date-formats.md) — Supported genealogical date formats

## Dev Tools

- [Issue Tracking](./dev-tools/issue-tracking.md) — Org-level Issue Types, YAML templates, the Vata Roadmap Project, and the `capture-idea` / `link-task` skills

## GEDCOM logic (in-app)

GEDCOM parsing and genealogical date handling are implemented as in-app modules (see [ADR-004](./decisions/adr-004-gedcom-libraries.md)): `src/gedcom-date/` and `src/gedcom-parser/`, consumed via `@vata-apps/gedcom-date` and `@vata-apps/gedcom-parser`. They are structured for possible future extraction as separate packages.
