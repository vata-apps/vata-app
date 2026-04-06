# MVP5: UI & Internationalization — Design Spec

## Overview

Replace all inline styles with a professional design system (shadcn/ui + Tailwind CSS), add dark/light mode, introduce internationalization (EN + FR), and upgrade forms with React Hook Form + Zod. Progressive rollout: design system + pages first, source workspace in a later phase.

## Design Decisions

| Decision      | Choice                                                     |
| ------------- | ---------------------------------------------------------- |
| Look & feel   | Dense & professional — maximize visible data               |
| Theme         | Light + Dark with toggle, class-based (`dark` on `<html>`) |
| Navigation    | Top tab bar — horizontal tabs, full-width content below    |
| Entity lists  | Data tables (sortable columns, pagination)                 |
| i18n          | EN + FR, structured for community contributions            |
| Component lib | shadcn/ui (copied into project, Radix UI primitives)       |
| Forms         | React Hook Form + Zod schema validation                    |
| Tables        | @tanstack/react-table + shadcn Table                       |
| Scope         | Progressive — design system + pages first, workspace later |

## New Dependencies

| Package                          | Purpose                     |
| -------------------------------- | --------------------------- |
| tailwindcss (v4)                 | Utility-first CSS framework |
| shadcn/ui                        | UI component library        |
| react-i18next                    | React i18n bindings         |
| i18next                          | i18n core                   |
| i18next-browser-languagedetector | Auto language detection     |
| react-hook-form                  | Form state management       |
| @hookform/resolvers              | Zod resolver for RHF        |
| zod                              | Schema validation           |
| @tanstack/react-table            | Headless table utilities    |

## Architecture

### Layout: AppShell

A new `AppShell.tsx` replaces `MainLayout.tsx` as the root layout wrapper.

```
┌──────────────────────────────────────────────────┐
│ VATA    Individuals  Families  Sources  ...   ⚙️ │
├──────────────────────────────────────────────────┤
│                                                  │
│                   Page content                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

- **Left**: "VATA" logo/text — links to Home (tree list)
- **Center**: Entity tabs — Individuals, Families, Sources, Repositories, Places, Events. Visible only when a tree is open.
- **Right**: Dark/light toggle + settings dropdown (language selector)
- **Active tab**: underline or contrasting background indicator
- **Home (no tree open)**: entity tabs hidden, only VATA + settings visible

Desktop-only app (Tauri). No mobile responsive design. Optimize for windows >= 1024px.

### Component Organization

```
src/components/
  ui/                    # shadcn/ui primitives (button, input, table, dialog, etc.)
  app-shell.tsx          # Top-level layout with tab bar
  theme-toggle.tsx       # Dark/light mode switch
  language-selector.tsx  # i18n language picker
  data-table.tsx         # Reusable DataTable built on @tanstack/react-table + shadcn Table
  confirm-dialog.tsx     # Restyled with shadcn AlertDialog
  EventTimeline.tsx      # Restyled with Tailwind (same logic)
  workspace/             # Source workspace (phase 2, not restyled in phase 1)
```

### i18n Structure

```
src/i18n/
  config.ts              # i18next init, language detection, fallback: 'en'
  locales/
    en/
      common.json        # Shared: nav, buttons, labels, errors
      individuals.json
      families.json
      sources.json
      events.json
      places.json
      repositories.json
    fr/
      common.json
      individuals.json
      families.json
      sources.json
      events.json
      places.json
      repositories.json
```

- One namespace per entity keeps translation files manageable
- `common` namespace for shared UI strings (nav tabs, buttons, generic labels)
- Language detected from `navigator.language`, overridable via settings
- Language preference stored in Zustand (persisted to localStorage)

### Form Schemas

```
src/lib/schemas/
  individual.ts          # individualSchema (Zod)
  family.ts
  source.ts
  repository.ts
  event.ts
  place.ts
```

- One Zod schema per entity
- Shared between create and edit forms (same component, `mode: 'create' | 'edit'`)
- Validation on blur, error messages rendered via shadcn `FormMessage`

### Dark Mode

- Class-based: `dark` class toggled on `<html>` element
- shadcn/ui CSS variables handle all color switching automatically
- Toggle stored in Zustand app store (persisted to localStorage)
- Respects system preference on first visit via `prefers-color-scheme`

## Pages

### Home Page (no tree open)

- Tree list as compact cards in a responsive grid (current layout, restyled with shadcn Card)
- Actions: Create tree, Import GEDCOM, Rename, Delete
- GEDCOM import/export via shadcn Dialogs (replace current modals)

### Entity List Pages (Individuals, Families, Sources, Repositories, Places, Events)

Shared `DataTable` component with per-entity column definitions.

**Features:**

- Sortable columns (click header to toggle asc/desc)
- Global text search (client-side filtering)
- Pagination (50 items per page)
- Row click navigates to detail page
- Source count badge: green (>= 1), orange/warning (0)

**Columns per entity:**

| Page         | Columns                                              |
| ------------ | ---------------------------------------------------- |
| Individuals  | ID, Name, Gender, Birth, Death, Sources              |
| Families     | ID, Husband, Wife, Children count, Marriage, Sources |
| Sources      | ID, Title, Author, Repository, Citations             |
| Repositories | ID, Name, City, Country, Sources count               |
| Places       | ID, Name, Type, Parent, Events count                 |
| Events       | ID, Type, Date, Place, Participants                  |

**"+ New" button**: opens a shadcn Dialog with the React Hook Form + Zod form.

### Entity Detail Pages (Individual, Family, Source, Repository)

- "Back to [list]" link at top
- Entity header: name, ID, key metadata
- Edit and Delete action buttons
- Sections in shadcn `Card` components:
  - **Individual**: Names, Events (EventTimeline), Families
  - **Family**: Husband, Wife, Children, Events
  - **Source**: Metadata, Citations, Files, link to workspace
  - **Repository**: Metadata, linked Sources
- Cross-links between entities (click spouse name → individual page)
- Edit: shadcn Dialog with pre-filled form
- Delete: shadcn AlertDialog with confirmation

### Source Workspace (Phase 2 — not restyled in phase 1)

The workspace keeps its current inline styles in phase 1. It will be migrated to shadcn/ui + Tailwind in a follow-up phase after the core pages are complete.

## Phases

### Phase 1: Foundation

Install Tailwind v4, shadcn/ui, react-i18next, React Hook Form, Zod, @tanstack/react-table. Set up dark mode, i18n config, AppShell layout with top tab bar. Create the reusable DataTable component.

### Phase 2: Home Page

Migrate Home page: tree list, create/rename/delete dialogs, GEDCOM import/export modals. Extract all strings to i18n.

### Phase 3: Entity List Pages

Migrate all 6 entity list pages to use DataTable. Add sorting, search, pagination. Extract strings to i18n. Create Zod schemas and RHF-based creation forms in Dialogs.

### Phase 4: Entity Detail Pages

Migrate individual, family, source, repository detail/view pages. Restyle EventTimeline with Tailwind. Add edit dialogs with RHF + Zod. Extract strings to i18n.

### Phase 5: Source Workspace

Migrate the source workspace (3-panel layout, image viewer, person/place autocomplete, event templates) to shadcn/ui + Tailwind.

## Out of Scope

- Mobile responsive design (desktop app only)
- Additional languages beyond EN/FR (structure is ready, translations are community-contributed)
- New features or pages — this MVP is purely visual + i18n migration
- Database or API changes — no schema modifications
