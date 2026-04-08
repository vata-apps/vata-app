# MVP5: UI & Internationalization

## Job to be Done

**Have a polished, professional UI with a design system, dark mode support, and internationalization (EN/FR).**

## Scope

MVP5 replaces all inline styles with shadcn/ui + Tailwind CSS v4, adds dark/light mode, introduces internationalization with react-i18next (English + French), and upgrades forms with React Hook Form + Zod. This is a visual and i18n migration — no new features, database changes, or API modifications.

The source workspace (12 components in `src/components/workspace/`) is deferred to Phase 5 and keeps its current inline styles until then.

## Prerequisites

- MVP1 (Foundation) completed
- MVP2 (GEDCOM) completed
- MVP3 (Primary Entities) completed
- MVP4 (Sources & Media) completed

## Development Phases

1. **Phase 1: Foundation** — Install Tailwind v4, shadcn/ui, react-i18next, React Hook Form, Zod, @tanstack/react-table. Set up dark mode, i18n config, AppShell with top tab bar.
2. **Phase 2: Home Page** — Migrate Home page: tree cards, create/rename/delete dialogs, GEDCOM import/export modals.
3. **Phase 3: Entity List Pages** — Migrate entity lists to shared DataTable component with sorting, search, pagination. Creation forms in shadcn Dialogs.
4. **Phase 4: Entity Detail Pages** — Migrate detail pages and EventTimeline to shadcn Cards, Badges, Tailwind classes.
5. **Phase 5: Source Workspace** — Migrate the source workspace to shadcn/ui + Tailwind (deferred).

## Deliverables Checklist

### Phase 1: Foundation

- [x] Install Tailwind CSS v4 + @tailwindcss/vite
- [x] Install and configure shadcn/ui (15+ components)
- [x] Install react-i18next + i18next + language detector
- [x] Install React Hook Form + @hookform/resolvers + Zod
- [x] Install @tanstack/react-table
- [x] i18n config: `src/i18n/config.ts`, namespace-per-entity structure
- [x] Translation files: `src/i18n/locales/{en,fr}/*.json`
- [x] Dark/light mode: class-based toggle, Zustand-persisted preference
- [x] AppShell layout: top tab bar replacing sidebar navigation
- [x] Theme toggle component
- [x] Language selector component (EN/FR)
- [x] Reusable DataTable component (sortable, searchable, paginated)
- [x] ConfirmDialog migrated to shadcn AlertDialog

### Phase 2: Home Page

- [x] Tree list with shadcn Card components
- [x] Create tree dialog with form validation
- [x] Rename tree dialog
- [x] Delete tree confirmation (shadcn AlertDialog)
- [x] GEDCOM import modal (shadcn Dialog)
- [x] GEDCOM export modal (shadcn Dialog)
- [x] All strings extracted to i18n (`home` namespace)

### Phase 3: Entity List Pages

- [x] Individuals list → DataTable with sorting, search, pagination
- [x] Families list → DataTable
- [x] Sources list → DataTable
- [x] Repositories list → DataTable
- [x] All strings extracted to i18n (entity namespaces)
- [ ] Places list → DataTable (deferred — no route yet)
- [ ] Events list → DataTable (deferred — no route yet)
- [ ] Zod schemas for creation forms (deferred)

### Phase 4: Entity Detail Pages

- [x] Individual detail page → shadcn Cards
- [x] Family detail page → shadcn Cards
- [x] Source detail page → shadcn Cards + edit form
- [x] Repository detail page → shadcn Cards
- [x] EventTimeline → Tailwind classes (same logic)
- [x] All strings extracted to i18n
- [x] TreeView page restyled
- [x] DataBrowser page restyled

### Phase 5: Source Workspace (deferred)

- [ ] Workspace layout → Tailwind (3-panel: citations, image viewer, linking panel)
- [ ] Image viewer → shadcn/ui controls
- [ ] Person/place autocomplete → shadcn Combobox
- [ ] Event templates panel → shadcn components
- [ ] All workspace strings extracted to i18n

## Key Design Decisions

- **Top tab bar**: Horizontal navigation replaces the sidebar — maximizes content area for a desktop app.
- **Dense & professional**: Compact layouts that maximize visible data (small fonts, tight spacing).
- **Progressive migration**: Core pages first (Phases 1–4), source workspace later (Phase 5).
- **Namespace-per-entity i18n**: One JSON file per entity keeps translations manageable.
- **No new features**: This MVP is purely visual + i18n — no schema or behavior changes.
