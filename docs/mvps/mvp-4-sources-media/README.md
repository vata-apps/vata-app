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

- [x] Tree storage: `trees.filename` → `trees.path` (user-chosen directory)
- [x] Tree creation: `media/` subdirectory created automatically by `openTreeDb()`
- [x] New tables: `repositories`, `sources`, `source_citations`, `citation_links`, `files`, `source_files`
- [x] `citation_links.entity_type` includes `'place'`
- [x] CRUD: Repositories (following existing DB layer pattern)
- [x] CRUD: Sources
- [x] CRUD: Citations + CitationLinks
- [x] CRUD: Files + SourceFiles
- [x] File utilities: copy/move to tree `media/`, relative path, filename deduplication
- [x] Entity ID prefixes: S (Source), R (Repository) — already existed in `entityId.ts`
- [ ] App setting: file copy vs. move default (deferred — hardcoded to copy for now)
- [x] Unit tests for all new DB functions (65 new tests, 467 total passing)
- [ ] Directory picker UI for tree creation (deferred to Phase 2 — currently uses app data dir)

### Phase 2: Basic Source & Repository UI

- [x] Route: `/tree/$treeId/sources`
- [x] Route: `/tree/$treeId/repositories`
- [x] Source list page with search/filter
- [x] Source creation form (file attachment deferred to Phase 3 workspace)
- [x] Repository management (list, create, edit, delete)
- [x] React Query hooks: sources, repositories, citations, files
- [x] Query key factory entries for new entities (done in Phase 1)

### Phase 3: Source Workspace

- [x] Route: `/tree/$treeId/source/$sourceId/edit`
- [x] Workspace layout: side-by-side (citations/image left, linking panel right)
- [x] Image viewer: zoom, pan, multi-file navigation
- [x] File attachment via Tauri file dialog (from workspace)
- [x] Event type selector with template loading (7 templates: Marriage, Baptism, Birth, Death, Burial, Census, Generic)
- [x] Slot interaction: search existing entities (autocomplete with 300ms debounce)
- [x] Slot interaction: create inline (name + gender; "More..." modal deferred post-Phase 3)
- [x] Free-form entity addition ("+ Add person")
- [x] Auto-citation: automatic citation + citation_link creation
- [x] SourceWorkspaceManager: orchestrate multi-entity operations
- [x] Citations summary on workspace left panel (joined query with event + individuals)

### Phase 4: Entity Timeline Integration

- [x] EventTimeline component: chronological event list
- [x] Source media thumbnails inline with events
- [x] Thumbnail generation for image files
- [x] Click-through: thumbnail → source workspace
- [x] Empty state: "Add source" link on unsourced events
- [x] Update individual profile view to use EventTimeline

## Key Design Decisions

- **Source-centric paradigm**: Sources are the primary data entry point, not a secondary annotation on entities.
- **Trees in user-chosen directories**: Each tree stored where the user picks (e.g., ~/Documents/), not buried in app data dir. System DB stores absolute paths.
- **Relative file paths**: `files.relative_path` is relative to tree folder root for portability.
- **Copy or move**: App setting controls whether files are copied or moved into `media/`. Either way, the app has its own copy.
- **Event-type templates**: Structured guidance (named slots) based on document type, with free-form fallback.
- **Suggest, don't auto-create**: App suggests creating events but never forces it.
- **Adaptive inline creation**: Principal roles (husband, wife) get more fields; peripheral roles (parents, witnesses) just name + gender.
