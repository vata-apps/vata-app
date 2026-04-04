# MVP4: Sources & Media

## Job to be Done

**Create, modify, and delete sources with media attachments, and associate them with entities via a source-centric workspace.**

## Scope

MVP4 implements source-centric data entry — the app's core differentiator. A source document (with its scanned image) is the starting point for creating and linking genealogical entities. This MVP merges the original MVP4 (Sources) and MVP5 (Files) because sources and their media are inseparable in this workflow.

Includes: repositories, sources, citations, citation links, file attachments, source workspace with event-type templates, inline entity creation, and entity timeline integration with media thumbnails.

The file manager (browsing/managing all tree files independently) is deferred to a future MVP.

UI is HTML-only with minimal CSS (shadcn/ui comes in MVP6).

## Prerequisites

- MVP1 (Foundation) completed
- MVP2 (GEDCOM) completed
- MVP3 (Primary Entities) completed

## Development Phases

1. **Phase 1: Data Layer & Schema** — Tree storage changes, new tables (repositories, sources, citations, files), CRUD functions, file utilities
2. **Phase 2: Basic Source & Repository UI** — Source list, source creation form, repository management, React Query hooks
3. **Phase 3: Source Workspace** — Side-by-side layout (image viewer + linking panel), event-type templates, inline entity creation, auto-citation
4. **Phase 4: Entity Timeline Integration** — Chronological event timeline with source media thumbnails on individual profiles

## Deliverables Checklist

### Phase 1: Data Layer & Schema

- [ ] Tree storage: `trees.filename` → `trees.path` (user-chosen directory)
- [ ] Tree creation: directory picker + `media/` subdirectory creation
- [ ] New tables: `repositories`, `sources`, `source_citations`, `citation_links`, `files`, `source_files`
- [ ] `citation_links.entity_type` includes `'place'`
- [ ] CRUD: Repositories (following existing DB layer pattern)
- [ ] CRUD: Sources
- [ ] CRUD: Citations + CitationLinks
- [ ] CRUD: Files + SourceFiles
- [ ] File utilities: copy/move to tree `media/`, relative path, filename deduplication
- [ ] Entity ID prefixes: S (Source), R (Repository) added to `entityId.ts`
- [ ] App setting: file copy vs. move default
- [ ] Unit tests for all new DB functions

### Phase 2: Basic Source & Repository UI

- [ ] Route: `/tree/$treeId/sources`
- [ ] Route: `/tree/$treeId/repositories`
- [ ] Source list page with search/filter
- [ ] Source creation form with file attachment
- [ ] Repository management (list, create, edit, delete)
- [ ] React Query hooks: sources, repositories, citations, files
- [ ] Query key factory entries for new entities

### Phase 3: Source Workspace

- [ ] Route: `/tree/$treeId/sources/$sourceId`
- [ ] Workspace layout: side-by-side (image left, linking panel right)
- [ ] Image viewer: zoom, pan, multi-file navigation
- [ ] Event type selector with template loading
- [ ] Template slots: Marriage, Baptism, Birth, Death, Burial, Census
- [ ] Slot interaction: search existing entities
- [ ] Slot interaction: create inline (adaptive detail by role)
- [ ] Free-form entity addition ("+ Add person")
- [ ] Event suggestion: "Create [event type] event?"
- [ ] Auto-citation: automatic citation + citation_link creation
- [ ] SourceWorkspaceManager: orchestrate multi-entity operations

### Phase 4: Entity Timeline Integration

- [ ] EventTimeline component: chronological event list
- [ ] Source media thumbnails inline with events
- [ ] Thumbnail generation for image files
- [ ] Click-through: thumbnail → source workspace
- [ ] Empty state: "Add source" link on unsourced events
- [ ] Update individual profile view to use EventTimeline

## Key Design Decisions

- **Source-centric paradigm**: Sources are the primary data entry point, not a secondary annotation on entities.
- **Trees in user-chosen directories**: Each tree stored where the user picks (e.g., ~/Documents/), not buried in app data dir. System DB stores absolute paths.
- **Relative file paths**: `files.relative_path` is relative to tree folder root for portability.
- **Copy or move**: App setting controls whether files are copied or moved into `media/`. Either way, the app has its own copy.
- **Event-type templates**: Structured guidance (named slots) based on document type, with free-form fallback.
- **Suggest, don't auto-create**: App suggests creating events but never forces it.
- **Adaptive inline creation**: Principal roles (husband, wife) get more fields; peripheral roles (parents, witnesses) just name + gender.
