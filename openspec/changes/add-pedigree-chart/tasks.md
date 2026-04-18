## 1. Active person — DB and hooks

- [ ] 1.1 Create `src/db/trees/tree-meta.ts` (or extend existing) with `getHomePersonId()` and `setHomePersonId(individualId)` reading/writing the `home_person_id` key in `tree_meta`
- [ ] 1.2 Add integration tests for `getHomePersonId` / `setHomePersonId` covering unset → null, set → read back, overwrite, persistence
- [ ] 1.3 Create `src/hooks/useActivePerson.ts` — TanStack Query hook that returns the effective active person, falling back to the first individual if unset, or null if the tree is empty
- [ ] 1.4 Create `useSetActivePerson` mutation that writes the home person ID and invalidates `useActivePerson` and `useAncestors` queries
- [ ] 1.5 Add unit tests for the hook's fallback logic (explicit set, unset with individuals, unset with no individuals)

## 2. Ancestor fetch — DB function

- [ ] 2.1 Add `getAncestors(rootId: string, generations: number)` in `src/db/trees/individuals.ts` (or a new `src/db/trees/ancestors.ts`) implementing the iterative IN-query strategy from design D4
- [ ] 2.2 Clamp `generations` to the 1..5 range
- [ ] 2.3 Return results keyed by Ahnentafel slot number (root = 1, father = 2, mother = 3, etc.) with the shape `Record<number, PedigreeNode>` where missing ancestors have no entry
- [ ] 2.4 Include primary name, birth year, death year, living status, and gender on each `PedigreeNode` (reuse batch query helpers from `fix-search-input-freeze` if already landed; otherwise fetch them in the same iterative pass)
- [ ] 2.5 Add integration tests: full 4-generation pedigree, partial pedigree with missing grandparents, root with no parents, depth clamping, depth = 1 returns only the root
- [ ] 2.6 Create `src/hooks/useAncestors.ts` — TanStack Query hook wrapping the DB function, keyed by `(treeId, rootId, generations)`

## 3. Pedigree chart — layout

- [ ] 3.1 Create `src/lib/pedigree-layout.ts` with a pure function `computePedigreeLayout({ generations, cardWidth, cardHeight, hGap, vGap }): { slots: Record<number, { x: number; y: number }>; width: number; height: number }`
- [ ] 3.2 Layout rule: for slot `n` at level `L = floor(log2(n))`, place it at `x = L * (cardWidth + hGap)` and `y = ((slotInLevel + 0.5) * (totalHeight / 2^L))` where `slotInLevel = n - 2^L`
- [ ] 3.3 Unit test the layout function exhaustively for depths 1 through 5, verifying each slot's position and the total width/height

## 4. Pedigree chart — components

- [ ] 4.1 Create `src/components/pedigree/PedigreeNode.tsx` — renders one person card as an SVG group; props: position, person data (or null for empty slot), onClick; shows primary name (truncated), year range, gender indicator; handles Enter/Space for keyboard activation; sets `role="button"`, `tabIndex={0}`, `aria-label`
- [ ] 4.2 Create `src/components/pedigree/PedigreeConnector.tsx` — draws an SVG path connecting a child card's right edge to a parent card's left edge (right-angle path)
- [ ] 4.3 Create `src/components/pedigree/PedigreeChart.tsx` — top-level SVG component; props: `rootId`, `generations`; uses `useAncestors` + `computePedigreeLayout`; renders connectors first (below), then nodes (above); handles click to call `useSetActivePerson`
- [ ] 4.4 Create `src/components/pedigree/PedigreeEmptyState.tsx` — empty state for when the tree has no individuals
- [ ] 4.5 Add a small depth selector (3 / 4 / 5) as a local UI control above the chart; default 4
- [ ] 4.6 Add component tests: renders with full data, renders with missing ancestors (empty slots), click re-roots, keyboard activation works, correct number of nodes for each depth

## 5. Landing page integration

- [ ] 5.1 Update `src/pages/TreeView.tsx` to render the `PedigreeChart` as the main content
- [ ] 5.2 Keep the existing tree name/description and counts in a compact header above the chart
- [ ] 5.3 Handle the empty-tree case by rendering `PedigreeEmptyState` instead of the chart
- [ ] 5.4 Verify the route at `/tree/$treeId/` displays the chart after opening a populated tree

## 6. Verify and polish

- [ ] 6.1 Run `pnpm test` — all tests pass
- [ ] 6.2 Run `pnpm lint` and `pnpm format:check`
- [ ] 6.3 Manually test with `pnpm tauri:dev`: open a tree, verify chart renders, click an ancestor, verify re-rooting, refresh app, verify active person persisted, switch depth, verify re-layout
- [ ] 6.4 Verify the tree landing page still works for empty trees and single-person trees
