## Why

The current individual detail page is a basic vertical layout (header + names card + events card) that doesn't surface key genealogical context at a glance. A researcher viewing an individual needs to immediately see vital dates, family relationships (parents, siblings, spouse, children), and events — all in a structured, information-dense layout. The current page requires navigating away to understand family context, breaking the research flow.

## What Changes

- **Redesign the individual detail page** into a three-panel master-detail layout:
  - **Left panel**: Scrollable individual list with search, allowing quick switching between individuals without leaving the page
  - **Center panel**: Individual summary as a structured key-value table (ID, gender, alternative names, birth/death dates and places, father, mother, siblings, half-siblings) with clickable links to related individuals and places
  - **Right panel**: Contextual sidebar showing Parents (with "Add Brother"/"Add Sister" actions), Families (spouse + children), and Events (timeline with "Add" action)
- **Replace the current card-based layout** with a denser, more informative presentation inspired by professional genealogy software
- **Add relationship display** directly on the individual page (father, mother, siblings, half-siblings) — data exists via families DB but is not currently surfaced on this page
- **Add quick navigation** between related individuals via clickable links (parent, sibling, spouse names navigate to their detail pages)

## Capabilities

### New Capabilities

- `individual-detail-layout`: Three-panel master-detail layout for individual browsing (list + detail + sidebar)
- `individual-relationships`: Display and navigate family relationships (parents, siblings, half-siblings, spouse, children) on the individual detail page
- `individual-summary-panel`: Structured key-value summary of an individual's vital information (dates, places, names, family links)
- `individual-sidebar`: Right sidebar showing parents, families, and events with quick-add actions

### Modified Capabilities

_None — no existing spec-level requirements are changing._

## Impact

- **Pages**: `IndividualViewPage.tsx` — full rewrite into multi-panel layout; `IndividualsPage.tsx` — the list may be extracted into a reusable panel component
- **Components**: New components for the three panels, relationship display, and summary table
- **Hooks/Data**: New hook or query to fetch an individual's relationships (parents, siblings, half-siblings) by composing existing `getParentFamilies`, `getSpouseFamilies`, `getChildrenInFamily` DB functions
- **Routes**: The `/tree/$treeId/individual/$individualId` route will need to accommodate the new layout; the `/tree/$treeId/individuals` list route may merge into the detail page as the left panel
- **No database changes** — all relationship data is already available through the families/family_members tables
