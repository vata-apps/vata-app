## Context

The shared `DataTable` component (`src/components/data-table.tsx`) is used by the Individuals, Families, Sources, and Repositories pages. Typing in its search input currently freezes the app. Investigation identified four compounding causes:

1. **No debouncing** — `src/components/data-table.tsx:80` calls `setGlobalFilter(e.target.value)` synchronously on every keystroke. TanStack Table's `getFilteredRowModel()` runs `includesString` over the entire dataset for each character.
2. **Columns recreated per render** — All four pages build their `columns: ColumnDef[]` array inline inside the component body (e.g., `IndividualsPage.tsx:19-46`). When the parent re-renders, a new array reference is passed to `DataTable`, which causes `useReactTable` to recompute internal state and all row/cell memoization to invalidate.
3. **N+1 queries in managers** — `IndividualManager.getAll()` (`src/managers/IndividualManager.ts:81-93`) loops over base individuals and calls `getById(id)` per row, which itself fires 3 more queries (`getPrimaryName`, `getNamesByIndividualId`, `getEventsByIndividualIdWithDetails`). For a tree with 500 individuals, that's ~2,000 SQL calls per `useIndividuals()` load. `FamilyManager.getAll()` (`src/managers/FamilyManager.ts:107-119`) has the same pattern.
4. **Heavy `IndividualWithDetails` payload** — each row returned to the table carries all names, birth event details, and death event details. Filtering iterates over every row's nested objects repeatedly.

Issues 1 and 2 are the primary causes of the typing freeze. Issue 3 makes the initial load and any cache invalidation very slow. Issue 4 amplifies both.

## Goals / Non-Goals

**Goals:**

- Typing in any search input is responsive — characters appear immediately, no frame drops
- Filtering runs against in-memory cached data, not against SQL queries
- Initial page load for Individuals / Families completes in a single SQL round-trip per logical entity (constant number of queries, independent of row count)
- No change to visible behavior — same columns, same filter semantics (substring match), same pagination

**Non-Goals:**

- Virtualized rendering of table rows (not needed once debounce + memoization are in place for typical tree sizes)
- Server-side / DB-side filtering (in-memory filter is fine once the data is shaped correctly)
- Rewriting TanStack Table usage or swapping libraries
- Adding new search features (fuzzy match, field-specific filters, etc.)
- Changing the data model or adding indexes — the queries are fast individually; the problem is volume

## Decisions

### D1: Debounce the input value with a 250 ms delay

**Decision**: Introduce a small `useDebouncedValue<T>(value, delay)` hook (~15 lines) and use it in `DataTable` so that the `<Input>` remains controlled by an immediate `useState` (instant visual feedback), while `globalFilter` is set from the debounced value.

**Rationale**: The input must update immediately so the user sees their keystrokes. The expensive operation (`getFilteredRowModel`) must only run when typing pauses. Two-state decoupling is the standard React pattern.

**Alternative considered**: Debounce directly inside `onChange`. Rejected because that would also delay the visible input value, making the input feel laggy.

**Alternative considered**: `useDeferredValue`. Rejected because it doesn't guarantee a coalescing window — under sustained keystrokes on a slow machine the filter can still run on every intermediate value. A fixed 250 ms debounce is simpler and more predictable.

### D2: Memoize columns arrays in every page using DataTable

**Decision**: Wrap each page's `columns` definition in `useMemo(() => [...], [t])`. Depend only on translation function `t` (for column headers) so the array reference is stable across unrelated re-renders.

**Rationale**: TanStack Table's `useReactTable` treats `columns` as a dependency. Passing a new array on every render invalidates its internal memoization, which means `getFilteredRowModel` must recompute from scratch on every keystroke-driven re-render. Stable references fix this at the root.

**Alternative considered**: Move columns to module scope (outside component). Rejected because columns need `t()` for headers and cell renderers reference hooks like `useTranslation`.

### D3: Rewrite `IndividualManager.getAll()` and `FamilyManager.getAll()` with batch queries

**Decision**: Replace the per-row loop with a fixed number of SQL calls that fetch all rows at once, then assemble the enriched objects in JS:

For individuals:

1. `SELECT ... FROM individuals ORDER BY id` — all individuals
2. `SELECT ... FROM names WHERE is_primary = 1 ORDER BY individual_id` — all primary names
3. `SELECT ... FROM names ORDER BY individual_id, is_primary DESC` — all names grouped by individual
4. Birth and death events: either a single query joining `events` + `event_participants` filtered by `event_type IN ('BIRT','DEAT')` and role `principal`, or two targeted queries
5. In JS, build maps keyed by `individual_id` and assemble `IndividualWithDetails[]`

**Rationale**: This turns O(N) queries into O(1). For the list view we only need primary name + birth/death summary; heavier detail loads stay on the individual detail page via the existing `getById` path.

**Alternative considered**: A single large JOIN query returning denormalized rows. Rejected because it complicates row mapping (cartesian products with multiple names/events) and obscures the SQL. Separate focused queries are easier to reason about and still constant-time.

### D4: Keep the "enriched" shape of list rows but load it cheaply

**Decision**: The list rows still expose `primaryName`, `birthEvent`, `deathEvent` so the existing column definitions keep working unchanged. Only the loading strategy changes.

**Rationale**: Minimizes blast radius — no changes to column definitions, no changes to table rendering logic, no changes to consumer code beyond the manager.

**Alternative considered**: Introduce a slimmer `IndividualListRow` type. Rejected as scope creep — the performance problem is the query count, not the payload size.

### D5: Do not memoize `DataTable` with `React.memo`

**Decision**: Rely on stable `columns` + `data` props + debounced filter state. Do not wrap `DataTable` in `React.memo`.

**Rationale**: Once D1 + D2 land, re-renders of the parent page become cheap and infrequent (only on actual data/filter changes). `React.memo` adds equality-check cost on every render and is unnecessary.

**Revisit if**: profiling after D1–D4 still shows render storms.

## Risks / Trade-offs

- **Debounce delay feels sluggish on fast typists** → 250 ms is short enough to feel snappy; can tune to 150–300 ms based on feel after implementation. The filter result appearing 250 ms after the last keystroke is industry standard.
- **Batch query assumes all data fits in memory** → Trees can have thousands of individuals. JS maps over thousands of rows are fine; the in-memory filter is fine too. If trees ever reach 100k+, we'd move to server-side filtering — out of scope now.
- **Code duplication in batch assembly** → Both `IndividualManager.getAll` and `FamilyManager.getAll` need similar "fetch all, build map, assemble" logic. Each manager stays self-contained; no premature shared abstraction.
- **Refactor touches hot code** → Mitigated by keeping return types unchanged and relying on existing unit/integration tests for the managers.
- **`useMemo` deps easy to get wrong** → If a column cell uses a closure over a prop, forgetting that in the deps array causes stale renders. Mitigation: keep column definitions pure / only depend on `t`, and extract any prop-dependent logic to a separate memoized value.
