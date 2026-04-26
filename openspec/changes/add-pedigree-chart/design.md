## Context

Vata has no graphical representation of a family tree. The tree landing page (`src/pages/TreeView.tsx`) shows only the tree name, description, and counts of individuals and families. All genealogical browsing happens through tabular lists (Individuals, Families, Sources, Repositories). Users have asked for the iconic pedigree chart view — a visual "ancestor tree" centered on an active person that every genealogy app ships as the default view.

Relevant current state:

- No "active person" concept exists. `useAppStore` only tracks `currentTreeId`, theme, and language. The `tree_meta` table is a free key-value store already wired up for schema version and software info.
- Family relationships are queryable via `getParentFamilies(individualId)` (`src/db/trees/families.ts`), but there's no function to walk N generations up the pedigree.
- No visualization libraries are installed. The stack is React 18 + Tailwind + shadcn/ui, which pairs naturally with inline SVG.

Constraints:

- The pedigree fits in a small, bounded space (up to 5 generations = max 31 nodes). Layout and performance are trivial.
- No new routes — replace the content of the existing landing page to make this the default view on tree open.
- Click-to-navigate only. No zoom/pan (user explicitly scoped this out).

## Goals / Non-Goals

**Goals:**

- Render a pedigree chart (subject + ancestors) as SVG on the tree landing page
- Support click-to-navigate: clicking any ancestor re-roots the chart around them
- Persist the active person per-tree so it survives navigation and app restart
- Handle missing ancestors gracefully (empty slots keep the binary layout stable)
- Show a default generation depth of 4 (1 subject + 3 ancestor generations = up to 15 people), with a simple control to switch to 3 or 5
- Keep the implementation light: no heavy viz libraries if they don't pay for themselves

**Non-Goals:**

- Pan / zoom interactions (explicitly excluded)
- Descendants view (children, grandchildren, etc.) — ancestors only
- Printing or exporting the chart
- Animations / smooth transitions when re-rooting
- Inline editing of ancestors from the chart
- Visual indicators for missing citations, consanguinity, or other advanced genealogy markers
- Virtualization or performance work beyond the 5-generation cap

## Decisions

### D1: Render with plain SVG — no layout library

**Decision**: Implement the pedigree chart as plain JSX rendering SVG elements (`<svg>`, `<g>`, `<rect>`, `<text>`, `<path>`). Compute node positions with a small pure function. Do not install d3-hierarchy, @visx/hierarchy, react-d3-tree, react-flow, or any other viz dependency.

**Rationale**: A pedigree is a _balanced binary tree of bounded depth_ (max 5 levels = 31 slots). Unlike general trees where variable-width subtrees demand the Reingold–Tilford algorithm, every slot has a fixed, deterministic position based only on its path from the root: `x = slotIndex * slotWidth`, `y = level * levelHeight`. The layout function fits in ~20 lines. React + SVG gives full control over node cards (we can embed Tailwind-styled HTML via `<foreignObject>` if needed) and integrates cleanly with the existing shadcn/ui / lucide-react stack.

**Alternatives considered:**

- **d3-hierarchy** (~8 KB): Industry standard for tree layouts, but it solves a harder problem than we have. It expects an arbitrary tree and computes balanced positions; for a fixed binary pedigree it adds no value. Data model mismatch too — a pedigree root has "parents" not "children", requiring an inversion.
- **@visx/hierarchy**: Nicer React API around d3-hierarchy, but inherits the data model mismatch and adds dependency weight.
- **react-d3-tree**: Full-featured with zoom/pan/collapse out of the box, but opinionated rendering, less control over node design, and brings features (zoom/pan) that are explicit non-goals.
- **react-flow / xyflow**: General-purpose diagram library, overkill for a fixed-layout pedigree. Would require custom layout code anyway, defeating the point.
- **family-chart**: Genealogy-specific but thin on React support and maintenance.

**Revisit if**: we later want descendants view with variable branching, then d3-hierarchy becomes the right tool.

### D2: Store `home_person_id` in `tree_meta` as a key-value row

**Decision**: Use the existing `tree_meta` key-value table. Add a `home_person_id` key whose value is the integer individual ID (stringified). No schema migration — `tree_meta` is already a free-form key-value store.

**Rationale**: `tree_meta` already exists for exactly this kind of lightweight per-tree configuration. Adding a new key is a pure data operation: no ALTER TABLE, no migration, no versioning concerns.

**Alternative considered**: Store in `useAppStore` (Zustand + localStorage). Rejected because it couples per-tree state to global UI state and doesn't survive if the user opens the tree on another machine (a likely future scenario with sync).

### D3: Active-person selection hook reads and writes `tree_meta`

**Decision**: Add `getHomePersonId()` / `setHomePersonId(id)` functions in a new file `src/db/trees/tree-meta.ts` (or extend whatever tree-meta code exists). Expose a TanStack Query hook `useActivePerson()` that reads the home person and auto-falls-back to the first individual in the tree if unset, and a mutation `useSetActivePerson()` that writes the value and invalidates the chart query.

**Rationale**: Matches the project's existing pattern (DB layer → hook → component). Falling back to the first individual gives a sensible first-run experience for newly imported trees.

**Alternative considered**: Show a first-run modal asking the user to pick a home person. Rejected as friction — a silent default is good enough, and the user can change it by clicking any ancestor.

### D4: Ancestor loading via an iterative IN query

**Decision**: Add `getAncestors(rootId, generations)` that loads the pedigree iteratively:

1. Start with `currentLevel = [rootId]`
2. For each level up to `generations`:
   a. Query `SELECT id, gender, is_living FROM individuals WHERE id IN (currentLevel)`
   b. Query parent relationships: `SELECT individual_id, family_id FROM family_members WHERE individual_id IN (currentLevel) AND role = 'child'` → get parent family IDs
   c. Query husband/wife from those families: `SELECT family_id, individual_id, role FROM family_members WHERE family_id IN (parentFamilyIds) AND role IN ('husband','wife')`
   d. Build `currentLevel = [all parent IDs]` for next iteration
3. After all levels, do one batch call to load primary names and birth/death events for every unique individual ID collected (reusing the batch functions introduced by `fix-search-input-freeze`)
4. Return a structured pedigree: `{ [slotIndex]: Person | null }` mapped onto binary-tree positions

**Rationale**: Each iteration is one small SQL query; total is ~`2 * generations + 1` queries regardless of tree size. With `generations = 4`, that's 9 queries — trivial on SQLite. Using IN clauses batches lookups across an entire generation at once, avoiding N+1.

**Alternative considered**: Recursive CTE (`WITH RECURSIVE ancestors AS ...`). Rejected because the `@tauri-apps/plugin-sql` API is fine with multiple small queries, and iterative JS code is easier to reason about, test, and debug than a recursive CTE that walks three join tables.

### D5: Data shape uses binary-tree slot indices

**Decision**: Represent the pedigree as a flat array indexed by "ancestor number" (Ahnentafel / Sosa–Stradonitz numbering):

- Slot 1 = subject (root)
- Slot 2 = father, Slot 3 = mother
- Slot 4 = paternal grandfather, 5 = paternal grandmother, 6 = maternal grandfather, 7 = maternal grandmother
- In general: for slot _n_, father = 2n, mother = 2n + 1

A single sparse array `Pedigree = Record<number, PedigreeNode | null>` covers all generations.

**Rationale**: Ahnentafel numbering is the standard genealogy convention for pedigree charts. It gives O(1) lookup for any ancestor, trivially maps to (level, positionInLevel) coordinates for layout, and null entries represent unknown ancestors without breaking the structure.

**Alternative considered**: Nested object tree (`{ self, father: {...}, mother: {...} }`). Rejected because recursive traversal is more awkward and the flat representation is what the renderer actually wants.

### D6: Layout — left-to-right, subject on the left

**Decision**: Orient the chart left-to-right: subject on the far left, each ancestor generation extending rightward. Fixed slot dimensions (~180×60 px card with ~40 px vertical gap and ~80 px horizontal gap).

- Level _L_ occupies column _L_ at `x = L * (cardWidth + hGap)`
- Within level _L_, slot _p_ (0-indexed) is at `y = (p + 0.5) * (totalHeight / 2^L)`
- Connectors are right-angle paths: from the right edge of a child node to the left edges of its two parents

**Rationale**: Left-to-right is the most common pedigree orientation in desktop genealogy software (RootsMagic, Gramps, Family Tree Maker all default to it). It matches reading order, accommodates wider name labels, and keeps the subject anchored on the left where the eye lands first.

**Alternative considered**: Top-down (subject at bottom, ancestors above). Rejected as less space-efficient for desktop aspect ratios.

### D7: Person card shows minimal fields

**Decision**: Each non-empty node card displays:

- Primary name (formatted, truncated with ellipsis if too long)
- Birth–death years range (e.g., `1842–1910`, or `1842–` for living, or `?` if unknown)
- Gender indicator (icon or colored left border)

No photos, no IDs, no places, no event lists. Empty slots show a muted dashed outline with a "+" or "?" placeholder.

**Rationale**: The pedigree chart is a navigational overview, not a detail view. Minimal data keeps cards small and the whole chart scannable at a glance. For more detail the user clicks through to the individual detail page (via the existing individual route).

### D8: Click behavior — re-root the chart

**Decision**: Clicking any ancestor card calls `setHomePersonId(clickedId)`, which updates `tree_meta` and invalidates the `useActivePerson` and `useAncestors` queries, causing the chart to re-render centered on the new subject. No route change, no modal.

**Rationale**: Re-rooting is the standard interaction for pedigree charts and keeps the user in a single view. Because TanStack Query handles the invalidation, the transition is automatic.

**Alternative considered**: Open the individual detail page. Rejected because the user explicitly chose "click to navigate" within the chart itself, not away from it. A separate link or button on the card can still navigate to the detail page later if desired.

## Risks / Trade-offs

- **No zoom/pan** → If 5 generations doesn't fit at common window sizes, the chart might overflow or look cramped. → Mitigation: Default to 4 generations (15 nodes) which fits comfortably. Overflow scrolls natively within the SVG container. User can reduce depth if needed.
- **Manual layout code is our responsibility** → No library to fall back on for edge cases. → Mitigation: Layout is simple enough that the code fits in one file with unit tests covering all positions up to 5 generations.
- **Default active person heuristic** → "First individual in the tree" is arbitrary and may surprise users with a disconnected individual who has no ancestors. → Mitigation: When `getAncestors` returns only the root (no parents), the chart still renders meaningfully and the user can navigate to a better starting point via the individuals list. A future improvement can suggest the individual with the most ancestors.
- **Performance with missing ancestors** → Not a real concern — the layout renders empty slots at the same cost as filled ones.
- **Accessibility of clickable SVG** → SVG elements need explicit `role="button"`, `tabIndex`, keyboard handlers. → Mitigation: Wrap each person card in a `<g>` with proper ARIA attributes and handle `Enter`/`Space` keys; testing-standards skill will flag any gaps.
