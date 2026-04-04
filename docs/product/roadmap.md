# Roadmap

## Overview

Development is organized into 6 MVPs, each delivering a coherent set of capabilities. MVPs 1–3 focus on core functionality with a minimal UI. MVP4 introduces the complete design system. MVPs 5–6 add secondary entity management.

```mermaid
graph LR
    MVP1[MVP1 Foundation] --> MVP2[MVP2 GEDCOM]
    MVP2 --> MVP3[MVP3 Primary Entities]
    MVP3 --> MVP4[MVP4 UI]
    MVP4 --> MVP5[MVP5 Sources]
    MVP5 --> MVP6[MVP6 Files]
```

## Status by MVP

| MVP | Name              | JTBD                                                                              | Status      | Dependencies     |
| --- | ----------------- | --------------------------------------------------------------------------------- | ----------- | ---------------- |
| 1   | Foundation        | Create, modify, open, close, and delete a tree.                                   | Complete    | —                |
| 2   | GEDCOM            | Create a tree by importing a GEDCOM file and export a tree to GEDCOM.             | Complete    | MVP1             |
| 3   | Primary Entities  | Create, modify, and delete primary entities and navigate between modules.          | Complete    | MVP1, MVP2       |
| 4   | UI                | Have a complete, polished UI for the application.                                 | Not Started | MVP3             |
| 5   | Sources           | Create, modify, and delete a source and associate it with entities.               | Not Started | MVP4             |
| 6   | Files             | Add and delete files and associate them with entities.                             | Not Started | MVP5             |

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

### MVP4 — UI

- shadcn/ui components integrated (Radix UI + Tailwind CSS)
- Complete design system (theme via CSS variables, colors, typography)
- All screens redesigned with polished components
- Internationalization infrastructure (react-i18next)

### MVP5 — Sources

- Source and repository entity management
- Citation links between sources and other entities
- Source browsing and search UI

### MVP6 — Files

- File attachment linked to entities
- File browsing and preview

## External Dependencies

| Dependency     | Required by | Description                                                                 |
| -------------- | ----------- | --------------------------------------------------------------------------- |
| In-app modules | MVP2, MVP3  | `@vata-apps/gedcom-parser` (MVP2), `@vata-apps/gedcom-date` (MVP3) — see [ADR-004](../decisions/adr-004-gedcom-libraries.md) |
