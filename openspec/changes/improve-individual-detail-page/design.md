## Context

The current `IndividualViewPage` is a single-column layout: a back link, a header with name/gender/status/ID, a "Names" card, and an "Events" card. The `IndividualsPage` is a separate route showing a searchable table. There is no way to browse between individuals without leaving the detail view.

The Figma mockup shows a three-panel layout: individual list (left), structured summary (center), contextual sidebar (right). All relationship data (parents, siblings, half-siblings, spouse, children) is already queryable via the families/family_members DB layer — it just isn't surfaced on the individual page.

## Goals / Non-Goals

**Goals:**

- Redesign the individual detail page into a three-panel master-detail layout matching the Figma mockup
- Surface family relationships (parents, siblings, half-siblings) directly on the individual page
- Enable quick navigation between related individuals without route changes
- Keep the layout responsive and performant with existing data queries

**Non-Goals:**

- Inline editing of individual fields (buttons shown as disabled/placeholder)
- Creating new individuals from the detail page (the "New" button in the list is already available on IndividualsPage)
- Modifying the database schema or adding new DB tables
- Mobile/tablet responsive layout (desktop-first for Tauri app)
- CRUD operations for family relationships ("Add Brother"/"Add Sister"/"Add" event are shown in the mockup but will be non-functional placeholders initially)

## Decisions

### D1: Merge list and detail into a single route

**Decision**: Replace the separate `/individuals` list page and `/individual/$individualId` detail page with a unified master-detail view at `/tree/$treeId/individuals` that shows the list on the left and the selected individual on the right.

**Rationale**: The Figma mockup shows them as one screen. This avoids full page transitions when browsing individuals and keeps context. The list route already exists; we add an optional selected individual state.

**Alternative considered**: Keep separate routes and use a layout route to render the list alongside. Rejected because it adds routing complexity for a feature that's fundamentally a single view with selection state.

### D2: Use URL search params for selected individual

**Decision**: The selected individual ID is stored in a URL search param (`?id=I-0001`) on the `/individuals` route, not as a route param.

**Rationale**: This keeps the list always visible, allows deep-linking to a specific individual, and avoids needing a new nested route. Back/forward browser behavior works naturally.

**Alternative considered**: Zustand state for selection. Rejected because it breaks deep-linking and browser history.

### D3: New `useIndividualRelationships` hook

**Decision**: Create a dedicated hook that composes existing DB functions (`getParentFamilies`, `getSpouseFamilies`, `getChildrenInFamily`, family member lookups) to return a structured relationships object: `{ father, mother, siblings, halfSiblings, spouseFamilies }`.

**Rationale**: The data exists but requires multiple queries to assemble. Encapsulating this in a TanStack Query hook with proper cache keys keeps the component layer clean. The hook depends on `useFamily` internals but not on new DB functions.

**Alternative considered**: Extend `IndividualWithDetails` type to include relationships. Rejected because it would require changing the existing `getIndividualById` query to do expensive joins for every fetch, even when relationships aren't needed.

### D4: Three-panel layout with CSS Grid

**Decision**: Use a CSS Grid layout with three columns: `280px 1fr 320px`. The left panel scrolls independently, center panel scrolls independently, right sidebar scrolls independently.

**Rationale**: Grid provides stable column sizing without flex-based hacks. Independent scroll regions match the mockup's UX where each panel is its own viewport.

**Alternative considered**: Flexbox with fixed widths. Grid is more semantic for this layout pattern.

### D5: Reuse existing components where possible

**Decision**: The left panel reuses the existing individuals list data/query (`useIndividuals`) with a simplified display (no table, just a card-per-row list). The center panel is a new component. The right sidebar is a new component. EventTimeline is reused as-is in the sidebar.

**Rationale**: Avoids duplicating data-fetching logic while allowing visual customization per panel.

## Risks / Trade-offs

- **Performance with large trees**: The left panel loads all individuals via `useIndividuals()`. For trees with thousands of entries, this could be slow. → Mitigation: The existing pagination from IndividualsPage is already implemented; we can reuse the search/filter logic. Virtual scrolling can be added later if needed.
- **Multiple concurrent queries**: Rendering the detail view triggers `useIndividual` + `useIndividualRelationships` + `useEventTimeline`. → Mitigation: TanStack Query handles deduplication and caching. These are lightweight SQLite queries.
- **Route consolidation**: Merging two routes into one changes existing URLs. → Mitigation: The old `/individual/$individualId` route can redirect to `/individuals?id=$individualId` for any bookmarks.
