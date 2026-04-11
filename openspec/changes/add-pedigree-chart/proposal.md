## Why

A graphical pedigree chart (an ancestor tree showing the active person with their parents, grandparents, and beyond) is the iconic, expected visualization for any genealogy application — usually the default view when opening a tree. Vata currently has no graphical representation at all: the tree landing page only shows summary stats (individual count, family count) and all browsing happens through tabular lists. Researchers lose their bearings when navigating across hundreds of individuals without a visual "map" of how people relate.

## What Changes

- **Add a pedigree chart view** that displays the active person and their ancestors up to 5 generations (configurable), rendered as SVG
- **Make the pedigree chart the default tree landing page** at `/tree/$treeId/`, replacing the current stats-only view
- **Introduce an "active person" concept** (the subject/proband of the pedigree chart), persisted per-tree so it survives navigation and app restart
- **Support click-to-navigate** on any ancestor node: clicking a person makes them the new active person and re-roots the chart around them
- **Show a minimal node card per ancestor**: primary name, birth–death years, gender indicator
- **Handle missing ancestors** as empty/placeholder slots so the binary structure stays visually stable
- **Auto-select a default active person** on first load if none is set (first individual in the tree, or null state with a picker if the tree is empty)

## Capabilities

### New Capabilities

- `pedigree-chart`: SVG pedigree visualization showing the active person and their ancestors, with click-to-navigate and generation depth configuration
- `active-person`: Per-tree "active person" (subject of the pedigree chart) stored in tree metadata, persisted across sessions, with hooks for reading/updating
- `ancestor-fetch`: DB/query layer to efficiently load an individual's ancestors up to N generations in a bounded number of queries

### Modified Capabilities

_None — the current tree landing page has no spec-level requirements; it's being replaced._

## Impact

- **New route content**: `/tree/$treeId/` (via `src/pages/TreeView.tsx`) becomes the pedigree chart. The summary stats (individual/family counts) move into a header or small sidebar.
- **New components**: `PedigreeChart` (SVG root), `PedigreeNode` (person card), `PedigreeConnector` (parent–child lines), `PedigreeEmptySlot` (missing ancestor placeholder), optional `ActivePersonPicker` (first-time selection).
- **New hook**: `useAncestors(individualId, generations)` — fetches the ancestor tree via a bounded SQL strategy.
- **New DB function**: `getAncestors(rootId, generations)` in `src/db/trees/individuals.ts` (or a new file) that loads ancestors using a CTE or iterative queries with IN clauses.
- **Schema change**: Add `home_person_id` key to the `tree_meta` table (already exists as a key-value store, so no migration — just a new row when set).
- **Store change**: The active person is stored in `tree_meta`, but we cache it in TanStack Query for reads.
- **No new dependencies required**. The design doc will evaluate library options (d3-hierarchy, @visx/hierarchy, react-d3-tree, manual layout) and justify the choice.
- **No breaking changes** — the existing individuals list and detail routes are unchanged.
