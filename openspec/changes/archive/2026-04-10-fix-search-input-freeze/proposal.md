## Why

Every search input in the app (Individuals, Families, Sources, Repositories pages) freezes the UI when typing: characters don't appear, the main thread blocks, and users must restart the app. Root causes are compounding performance problems in the shared `DataTable` component and the manager layer: no input debouncing, column definitions recreated on every render (breaking TanStack Table memoization), and N+1 query patterns in `IndividualManager.getAll()` / `FamilyManager.getAll()` that load hundreds of rows with 3–5 extra queries per row. This makes the app essentially unusable on any non-trivial tree.

## What Changes

- **Debounce search input** in `DataTable` so `globalFilter` state only updates after the user stops typing (~250ms), decoupling typing from the filter computation
- **Memoize column definitions** in all pages using `DataTable` (Individuals, Families, Sources, Repositories) via `useMemo` so `useReactTable` doesn't recompute internal state on every render
- **Fix N+1 queries** in `IndividualManager.getAll()` and `FamilyManager.getAll()` by fetching aggregate data in a single query (or a small fixed number of joined queries) instead of looping with per-row `getById` calls
- **Optional**: memoize the `DataTable` component itself (`React.memo`) and the cell renderers to reduce cascade re-renders

## Capabilities

### New Capabilities

- `data-table-search-performance`: Behavioral requirements for the shared DataTable's search input — responsiveness while typing, debouncing, and stable column references
- `bulk-entity-fetch`: Efficient loading of enriched entity lists (individuals, families) without N+1 queries

### Modified Capabilities

_None — no existing spec-level requirements are changing._

## Impact

- **Components**: `src/components/data-table.tsx` — debounce logic, possibly `React.memo`
- **Pages**: `src/pages/IndividualsPage.tsx`, `src/pages/FamiliesPage.tsx`, `src/pages/SourcesPage.tsx`, `src/pages/RepositoriesPage.tsx` — wrap column definitions in `useMemo`
- **Managers**: `src/managers/IndividualManager.ts`, `src/managers/FamilyManager.ts` — rewrite `getAll()` to avoid per-row queries
- **DB layer**: Possibly new batch-fetch functions in `src/db/trees/individuals.ts`, `src/db/trees/names.ts`, `src/db/trees/events.ts`, `src/db/trees/families.ts` to support loading all primary names / birth-death events / family memberships in one query each
- **No schema changes** — purely a performance and render-behavior fix
- **No new dependencies** — debouncing can be implemented inline with `setTimeout`/`useEffect` or a tiny custom hook
