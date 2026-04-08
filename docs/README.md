# Vata — Documentation

Desktop application for managing genealogical trees. Local-first, GEDCOM 5.5.1 compatible, built with Tauri + React + TypeScript.

---

## Product

- [PRD](./product/prd.md) — Vision, problem, principles, scope, planned versions
- [Personas](./product/personas.md) — Target user profiles
- [User Stories](./product/user-stories.md) — Stories by MVP with acceptance criteria
- [Roadmap](./product/roadmap.md) — MVP timeline, status, milestones, dependencies
- [Success Metrics](./product/success-metrics.md) — Performance targets, reliability, definition of done
- [Glossary](./product/glossary.md) — Genealogical and technical terms

## Decisions (ADR)

- [ADR-001: Desktop Framework](./decisions/adr-001-desktop-framework.md) — Tauri over Electron
- [ADR-002: Frontend Stack](./decisions/adr-002-frontend-stack.md) — React, TypeScript, Vite, TanStack, Zustand
- [ADR-003: Database Architecture](./decisions/adr-003-database-architecture.md) — Dual DB, string IDs, layer separation
- [ADR-004: GEDCOM Libraries (in-app)](./decisions/adr-004-gedcom-libraries.md) — gedcom-parser and gedcom-date as in-app modules (@vata-apps/\*)
- [ADR-005: UI Strategy](./decisions/adr-005-ui-strategy.md) — HTML in MVP1–4, shadcn/ui in MVP5
- [ADR-006: Import/Export](./decisions/adr-006-import-export.md) — Two-phase import, round-trip export

## Architecture

- [Overview](./architecture/overview.md) — Global architecture, layers, data flow, state management
- [Database Schema](./architecture/database-schema.md) — Complete data model (system.db + tree.db)
- [Data Flow](./architecture/data-flow.md) — Communication between layers (UI → Hooks → Managers → DB)
- [Tech Stack](./architecture/tech-stack.md) — Technologies, versions, configurations, justifications
- [Testing Strategy](./architecture/testing-strategy.md) — Philosophy, tooling, layers (TS integration, Rust, E2E)

## MVPs

### MVP1: Foundation

- [README](./mvps/mvp-1-foundation/README.md) — Scope, phases, deliverables checklist
- [Product Spec](./mvps/mvp-1-foundation/spec.md) — Personas, stories, decisions, risks, success criteria
- Phases: [Setup](./mvps/mvp-1-foundation/phase-1-setup.md) · [Database](./mvps/mvp-1-foundation/phase-2-database.md) · [Home UI](./mvps/mvp-1-foundation/phase-3-home-ui.md)

### MVP2: GEDCOM

- [README](./mvps/mvp-2-gedcom/README.md) — Scope, phases, deliverables checklist
- [Product Spec](./mvps/mvp-2-gedcom/spec.md) — Personas, stories, decisions, risks, success criteria
- Phases: [Import](./mvps/mvp-2-gedcom/phase-1-import.md) · [Export](./mvps/mvp-2-gedcom/phase-2-export.md) · [UI](./mvps/mvp-2-gedcom/phase-3-ui.md)

### MVP3: Primary Entities

- [README](./mvps/mvp-3-primary-entities/README.md) — Scope, phases, deliverables checklist
- [Product Spec](./mvps/mvp-3-primary-entities/spec.md) — Personas, stories, decisions, risks, success criteria
- Phases: [Tree Schema](./mvps/mvp-3-primary-entities/phase-1-tree-schema.md) · [CRUD DB](./mvps/mvp-3-primary-entities/phase-2-crud-db.md) · [Dates](./mvps/mvp-3-primary-entities/phase-3-dates.md) · [Managers & Hooks](./mvps/mvp-3-primary-entities/phase-4-managers-hooks.md) · [Minimal UI](./mvps/mvp-3-primary-entities/phase-5-minimal-ui.md)

### MVP4: Sources & Media

- [README](./mvps/mvp-4-sources-media/README.md) — Scope, phases, deliverables checklist
- Source-centric data entry with media attachments (the app's core differentiator)

### MVP5: UI & i18n

- [README](./mvps/mvp-5-ui-i18n/README.md) — Scope, phases, deliverables checklist
- [Product Spec](./mvps/mvp-5-ui-i18n/spec.md) — Personas, stories, decisions, risks, success criteria

### MVP6: File Manager

- **MVP6: File Manager** — Browse and manage all media files in a tree

## API

- [Database Layer](./api/database-layer.md) — TypeScript interfaces, connection management, CRUD operations

## User Interface

> UI documentation will be updated iteratively during MVP5 implementation.

- [Design System](./ui/design-system.md) — Colors, typography, components
- [Layouts](./ui/layouts.md) — Layout structure
- Screens: [Home](./ui/screens/home.md) · [Tree View](./ui/screens/tree-view.md) · [Individual View](./ui/screens/individual-view.md) · [Family View](./ui/screens/family-view.md) · [Sources](./ui/screens/sources.md)

## References

- [GEDCOM 5.5.1 Mapping](./references/gedcom-551-mapping.md) — GEDCOM tag to Vata model correspondences
- [Date Formats](./references/date-formats.md) — Supported genealogical date formats

## GEDCOM logic (in-app)

GEDCOM parsing and genealogical date handling are implemented as in-app modules (see [ADR-004](./decisions/adr-004-gedcom-libraries.md)): `src/gedcom-date/` and `src/gedcom-parser/`, consumed via `@vata-apps/gedcom-date` and `@vata-apps/gedcom-parser`. They are structured for possible future extraction as separate packages.
