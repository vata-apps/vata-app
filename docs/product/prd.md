# Product Requirements Document (PRD)

## Vision

Vata is a desktop application that empowers genealogists to manage their family trees locally, with full control over their data and seamless interoperability through the GEDCOM standard.

## Problem

Genealogy enthusiasts face a difficult choice today:

- **Cloud-first platforms** (Ancestry, MyHeritage, FamilySearch) store data on remote servers. Users don't fully own or control their data, depend on subscriptions, and risk losing access if a service shuts down.
- **Existing desktop software** (Gramps, Legacy Family Tree, RootsMagic) exists but often feels dated, with aging UIs and limited modern development practices.
- **No modern local-first option** combines a contemporary tech stack, native desktop performance, and first-class GEDCOM support in a single application.

Vata fills this gap: a modern, performant, local-first desktop app built with current technologies, where the user's data never leaves their machine unless they explicitly export it.

## Target Users

See [Personas](./personas.md) for detailed user profiles.

In summary, Vata targets genealogists who want full ownership of their data — from beginners organizing their first family records to experienced researchers managing large trees with rigorous source citations.

## Guiding Principles

1. **Local-first** — All data remains on the user's computer. No account, no cloud, no subscription.
2. **Performance** — Responsive interface and fast operations, even on trees with thousands of individuals.
3. **Reliability** — Zero data loss. All write operations use database transactions.
4. **Extensibility** — Modular, layered architecture designed for future evolution.
5. **Standards** — GEDCOM 5.5.1 compliance for interoperability with other genealogy software.

## Technical Summary

| Aspect           | Choice                                       |
| ---------------- | -------------------------------------------- |
| Type             | Desktop application (Windows, macOS, Linux)  |
| Framework        | Tauri 2.0                                    |
| Frontend         | React 18 + TypeScript 5                      |
| UI Library       | shadcn/ui + Tailwind CSS (from MVP4)         |
| Database         | SQLite (local)                               |
| Exchange Format  | GEDCOM 5.5.1                                 |

For technical details, see [Architecture Overview](../architecture/overview.md) and [Tech Stack](../architecture/tech-stack.md).

## Scope

### In Scope

- Create, open, rename, and delete genealogical trees
- CRUD operations on primary entities: individuals, names, families, events, places
- Import and export GEDCOM 5.5.1 files
- Source and citation management
- File attachments linked to entities
- Complete desktop UI with design system
- Internationalization infrastructure

### Out of Scope

- Cloud synchronization or remote storage
- Multi-user collaboration or sharing
- DNA / genetic test integration
- Web publishing or online tree sharing
- GEDCOM 7.0 support (may be considered in the future)
- Mobile applications (iOS, Android)
- Built-in media editing (photo cropping, etc.)

## Assumptions & Constraints

- **Single-user**: One user per installation, no authentication required.
- **Desktop only**: Windows, macOS, and Linux via Tauri's cross-platform support.
- **Offline-first**: No network connection required for any feature.
- **GEDCOM 5.5.1 only**: The most widely supported version. GEDCOM 7.0 is not in scope.
- **No backend server**: All logic runs in the frontend (TypeScript) and native shell (Rust/Tauri plugins).
- **SQLite storage**: One system database for metadata, one file per tree for genealogical data.

## Planned Versions

| Version | Name               | Job to be Done                                                                                     |
| ------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| MVP1    | Foundation         | Create, modify, open, close, and delete a tree.                                                    |
| MVP2    | GEDCOM             | Create a tree by importing a GEDCOM file and export a tree to GEDCOM.                              |
| MVP3    | Primary Entities   | Create, modify, and delete primary entities and navigate between different modules.                 |
| MVP4    | UI                 | Have a complete, polished UI for the application (shadcn/ui, design system, i18n).                 |
| MVP5    | Sources            | Create, modify, and delete a source and associate/dissociate a source from an entity.              |
| MVP6    | Files              | Add and delete files and associate/dissociate a file from an entity.                               |

For timeline and status, see [Roadmap](./roadmap.md). For detailed specs per version, see the [MVP specs](../mvps/).

## Related Documents

- [Personas](./personas.md)
- [User Stories](./user-stories.md)
- [Roadmap](./roadmap.md)
- [Success Metrics](./success-metrics.md)
- [Glossary](./glossary.md)
- [Architecture Decision Records](../decisions/)
