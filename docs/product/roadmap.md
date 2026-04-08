# Roadmap

## Overview

Development is organized into 6 MVPs, each delivering a coherent set of capabilities. MVPs 1–3 focus on core functionality with a minimal UI. MVP4 delivers source-centric data entry with media attachments (the app's core differentiator). MVP5 replaces all inline styles with a design system (shadcn/ui + Tailwind CSS) and adds internationalization. MVP6 adds the file manager.

```mermaid
graph LR
    MVP1[MVP1 Foundation] --> MVP2[MVP2 GEDCOM]
    MVP2 --> MVP3[MVP3 Primary Entities]
    MVP3 --> MVP4[MVP4 Sources & Media]
    MVP4 --> MVP5[MVP5 UI & i18n]
    MVP5 --> MVP6[MVP6 File Manager]
```

## Status by MVP

| MVP | Name             | JTBD                                                                      | Status      | Dependencies |
| --- | ---------------- | ------------------------------------------------------------------------- | ----------- | ------------ |
| 1   | Foundation       | Create, modify, open, close, and delete a tree.                           | Complete    | —            |
| 2   | GEDCOM           | Create a tree by importing a GEDCOM file and export a tree to GEDCOM.     | Complete    | MVP1         |
| 3   | Primary Entities | Create, modify, and delete primary entities and navigate between modules. | Complete    | MVP1, MVP2   |
| 4   | Sources & Media  | Create sources with media, link entities via source workspace.            | Complete    | MVP3         |
| 5   | UI & i18n        | Have a polished UI with design system, dark mode, and i18n (EN/FR).       | In Progress | MVP4         |
| 6   | File Manager     | Browse and manage all media files in a tree.                              | Not Started | MVP5         |

## Key Milestones

### MVP1 — Foundation

- Application starts with `pnpm tauri dev`, no console errors
- system.db created automatically on first launch
- Tree CRUD operations functional (create, open, rename, delete)
- Home page displays and manages the tree list

Spec: [MVP1 Product Spec](../mvps/mvp-1-foundation/spec.md) · Implementation: [MVP1 Phases](../mvps/mvp-1-foundation/README.md)

### MVP2 — GEDCOM

- GEDCOM 5.5.1 files import successfully (individuals, families, events, places)
- Export produces valid, re-importable GEDCOM
- Error handling with clear user feedback
- Import/export UI integrated into the home page

Spec: [MVP2 Product Spec](../mvps/mvp-2-gedcom/spec.md) · Implementation: [MVP2 Phases](../mvps/mvp-2-gedcom/README.md)

### MVP3 — Primary Entities

- Complete CRUD for individuals, names, families, events, places
- Date handling integrated via in-app module `@vata-apps/gedcom-date`
- Functional navigation between entities (individual → family → events)
- Minimal but usable HTML UI

Spec: [MVP3 Product Spec](../mvps/mvp-3-primary-entities/spec.md) · Implementation: [MVP3 Phases](../mvps/mvp-3-primary-entities/README.md)

### MVP4 — Sources & Media

- Source-centric data entry: source workspace with side-by-side image viewer and entity linking panel
- Event-type templates (marriage, baptism, census, etc.) with inline entity creation
- Repository, source, citation, and file management (data layer + basic UI)
- Tree storage in user-chosen directories with `media/` subfolder
- Entity timeline integration: media thumbnails inline with events on individual profiles
- HTML-only UI, minimal CSS

Implementation: [MVP4 Phases](../mvps/mvp-4-sources-media/README.md)

### MVP5 — UI & i18n

- shadcn/ui components integrated (Radix UI + Tailwind CSS v4)
- Complete design system (dark/light mode, CSS variables, typography)
- All screens migrated from inline styles to Tailwind classes
- Data tables with sorting, search, and pagination
- Internationalization (react-i18next, EN + FR)
- React Hook Form + Zod for form validation

Spec: [MVP5 Design Spec](../mvps/mvp-5-ui-i18n/spec.md) · Implementation: [MVP5 Phases](../mvps/mvp-5-ui-i18n/README.md)

### MVP6 — File Manager

- Standalone file browser for all media files in a tree
- File metadata, orphan detection, preview

## External Dependencies

| Dependency     | Required by | Description                                                                                                                  |
| -------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| In-app modules | MVP2, MVP3  | `@vata-apps/gedcom-parser` (MVP2), `@vata-apps/gedcom-date` (MVP3) — see [ADR-004](../decisions/adr-004-gedcom-libraries.md) |
