## 1. Debounce the DataTable search input

- [x] 1.1 Create `src/hooks/useDebouncedValue.ts` — a small generic hook `useDebouncedValue<T>(value: T, delay: number): T` backed by `useEffect` + `setTimeout`
- [x] 1.2 Add a unit test for `useDebouncedValue` covering: immediate first value, delayed update, rapid changes coalesced, cleanup on unmount
- [x] 1.3 In `src/components/data-table.tsx`, introduce a local `inputValue` state bound to the `<Input>`, pass `useDebouncedValue(inputValue, 250)` into `setGlobalFilter` via effect, so the visible input updates immediately while `globalFilter` only updates after the pause

## 2. Memoize column definitions in all pages

- [x] 2.1 Wrap the `columns` array in `src/pages/IndividualsPage.tsx` with `useMemo(() => [...], [t])`
- [x] 2.2 Wrap the `columns` array in `src/pages/FamiliesPage.tsx` with `useMemo(() => [...], [t])`
- [x] 2.3 Wrap the `columns` array in `src/pages/SourcesPage.tsx` with `useMemo(() => [...], [t])`
- [x] 2.4 Wrap the `columns` array in `src/pages/RepositoriesPage.tsx` with `useMemo(() => [...], [t])`
- [x] 2.5 Verify each page's columns closure only captures `t` (or adjust deps accordingly)

## 3. Batch-fetch individuals for the list view

- [x] 3.1 Add `getAllPrimaryNames(): Promise<Name[]>` in `src/db/trees/names.ts` — single query selecting all rows where `is_primary = 1`
- [x] 3.2 Add `getAllNames(): Promise<Name[]>` in `src/db/trees/names.ts` — single query, ordered by `individual_id, is_primary DESC`
- [x] 3.3 Add `getAllBirthDeathEvents(): Promise<EventWithDetails[]>` (or two targeted functions) in `src/db/trees/events.ts` — one query selecting BIRT/DEAT events joined with participants filtered by role `principal`
- [x] 3.4 Rewrite `IndividualManager.getAll()` in `src/managers/IndividualManager.ts` to call the three batch functions above, build `Map<individualId, ...>` lookups in JS, then assemble `IndividualWithDetails[]` — no per-row awaits
- [x] 3.5 Add/update manager tests covering: empty tree, individuals with/without primary name, with/without birth/death events, with multiple alternative names

## 4. Batch-fetch families for the list view

- [x] 4.1 Add `getAllFamilyMembers(): Promise<FamilyMember[]>` in `src/db/trees/families.ts` (or equivalent batch query)
- [x] 4.2 Add `getAllMarriageEvents(): Promise<EventWithDetails[]>` in `src/db/trees/events.ts` for role `principal` on `MARR` events
- [x] 4.3 Rewrite `FamilyManager.getAll()` in `src/managers/FamilyManager.ts` to compose the batch queries + the individual batch data, assemble `FamilyWithMembers[]` with JS maps
- [x] 4.4 Add/update manager tests covering: empty tree, families with no spouses, families with children, families with no marriage event

## 5. Verify and smoke-test

- [x] 5.1 Run `pnpm test` and ensure all existing tests still pass
- [x] 5.2 Manually test typing in search inputs on IndividualsPage, FamiliesPage, SourcesPage, RepositoriesPage — confirm no freeze, instant character display, filter applies after short pause
- [x] 5.3 Test initial load time on the Individuals page with a reasonably sized tree — confirm it's significantly faster than before (constant queries vs N+1)
- [x] 5.4 Verify column rendering, pagination, and sorting still work identically
