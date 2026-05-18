# Product Requirements Document (PRD)

## Vision

Vata is a desktop application that empowers genealogists to manage their family trees locally, with full control over their data and seamless interoperability through the GEDCOM standard.

## Problem

Genealogy enthusiasts face a difficult choice today:

- **Cloud-first platforms** (Ancestry, MyHeritage, FamilySearch) store data on remote servers. Users don't fully own their data, depend on subscriptions, and risk losing access if a service shuts down.
- **Existing desktop software** (Gramps, Legacy Family Tree, RootsMagic) often feels dated, with aging UIs and limited modern development practices.

No modern local-first option combines a contemporary tech stack, native desktop performance, and first-class GEDCOM support. Vata fills that gap: the user's data never leaves their machine unless they explicitly export it.

## Guiding Principles

1. **Local-first** — All data stays on the user's computer. No account, no cloud, no subscription, no network required for any feature.
2. **Performance** — Responsive even on trees with thousands of individuals.
3. **Reliability** — Zero data loss. All write operations use database transactions.
4. **Extensibility** — Modular, layered architecture designed for future evolution.
5. **Standards** — GEDCOM 5.5.1 compliance for interoperability with other genealogy software.

For the stack and platform choices, see [Tech Stack](../architecture/tech-stack.md).

## Scope

### In Scope

- Create, open, rename, and delete genealogical trees
- CRUD on primary entities: individuals, names, families, events, places — with navigation between them
- Import and export GEDCOM 5.5.1 files with round-trip fidelity
- Source and citation management (data layer complete; screens to be built)
- File attachments linked to entities; browse all media in a tree
- Complete desktop UI on a custom design system, with internationalization

### Out of Scope

- Cloud synchronization or remote storage
- Multi-user collaboration or sharing
- DNA / genetic test integration
- Web publishing or online tree sharing
- GEDCOM 7.0 support (may be considered in the future)
- Mobile applications (iOS, Android)
- Built-in media editing (photo cropping, etc.)

## Related Documents

- [Personas](./personas.md)
- [Glossary](../../CONTEXT.md)
- [Architecture Decision Records](../adr/)
