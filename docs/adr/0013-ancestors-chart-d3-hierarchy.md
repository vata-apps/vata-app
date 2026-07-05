# ADR-013: Ancestors ("Pedigree") Chart via d3-hierarchy + SVG links + foreignObject nodes

**Status**: Accepted
**Date**: 2026-07-04

## Context

The Person screen's last inert tab — labelled **Pedigree** (EN) / **Ascendance** (FR) — needs
content: a chart of an Individual's ancestors. A real ancestor chart is a graph with connector
lines, which Radix Themes cannot express. ADR-0010 made Radix the only styling authority and drops
flourishes Radix cannot render — but ADR-0012 already set the precedent that a genuine data
visualization Radix cannot express earns a scoped library carve-out (Leaflet for the Places map).

V1 scope is deliberately small: **ancestors only** (no descendants), a **fixed 4 generations**,
a **single lineage** (the first parent Family at each step, matching `person-overview.ts`), and the
**full 4-generation skeleton is always rendered** with a uniform card in every slot — unknown
ancestors show the same card frame with placeholder content, so the chart's shape is stable
regardless of how complete the data is. Editing (adding a parent from an empty slot) is out of scope.

## Decision

Render the chart as a **layout/renderer split**:

- **Layout — `d3-hierarchy`** (ISC) computes node positions with its tidy-tree algorithm
  (`hierarchy()` + `tree()`), oriented **horizontally, focal person at the left**, ancestors opening
  rightward. Chosen over `@visx/hierarchy`, which merely wraps this same algorithm: d3-hierarchy is
  renderer-agnostic (keeps a future canvas renderer open if the tree ever outgrows SVG), lighter,
  and carries no React coupling. Connector-link paths are hand-written cubic béziers — `d3-shape`
  is not needed.
- **Nodes — HTML via SVG `<foreignObject>`**, reusing the existing `PersonRef` inside
  `IndividualLink`. Only the **connector lines are SVG**; everything visible and clickable stays a
  reused Radix component (avatar, name, life dates, keyboard focus, hover, relation-jump navigation
  to that person's Overview). This keeps the non-Radix surface as small as possible — a deliberate
  narrowing of the ADR-0012 carve-out to just the lines.
- **Approved exception to ADR-0010's `var(--…)` ban**: the connector `<path>`'s `stroke="var(--gray-a7)"`
  in `ancestors-chart.tsx` is a plain SVG presentation attribute (not a `style={{}}` prop), needed
  because raw SVG shapes have no other way to track the Radix light/dark palette. This is the same
  mechanism already accepted for the Places map's Leaflet `divIcon` markers (ADR-0012) — narrowed
  here to a single attribute on the carved-out connector lines, nowhere else in the app.

**Naming boundary.** The concept is named **`ancestors`** in code (route
`/individual/$individualId/ancestors`, DB `getAncestors`, `AncestorsChart`, tab id `ancestors`),
while the user-facing label stays **Pedigree** / **Ascendance**. This reserves the word **Pedigree**
in code exclusively for the parent–child link type (GEDCOM `PEDI`), following the same per-layer
naming pattern as Individual / Person. See `CONTEXT.md`.

## Alternatives Considered

- **Pure Radix, no library** (generation columns with `Flex justify` spacing, no connector lines):
  fully ADR-0010-compliant and needs no carve-out, but the parent→child mapping is ambiguous without
  lines once slots are unknown. Rejected — the maintainer chose a real chart.
- **`@visx/hierarchy`**: React-idiomatic wrapper over the same d3 layout, less glue code — but an
  extra dependency layer coupled to SVG + React, foreclosing a later canvas renderer. Rejected in
  favour of the leaner, renderer-agnostic `d3-hierarchy`.
- **`relatives-tree` / `react-family-tree`**: purpose-built for genealogy, but designed for the full
  family graph (spouses, siblings, descendants). Overkill and a semantic mismatch for an
  ancestors-only V1. Reserved for a possible future interactive full-family tree.
- **`@xyflow/react` (React Flow) / `d3-org-chart`**: a full flow editor (pan/zoom/minimap, needs an
  external layout lib) or org-chart semantics (one→many, inverted for ancestors). Both oversized for
  a fixed 15-node chart.
- **Canvas instead of SVG**: unwarranted at ≤15 nodes; SVG is crisper, trivially themeable with
  Radix tokens, and gives real click targets and focus. d3-hierarchy leaves the canvas door open if
  scale ever demands it.

## Amendment: visual polish (post-acceptance)

Live-screenshot verification against the running app surfaced four refinements, applied after this
ADR was first accepted:

- Every node (including "Unknown" slots) is wrapped in a Radix `Card` for a visible border — the
  original foreignObject content had no card chrome of its own.
- The card's sizing wrapper changed from `Flex` to `Grid`: `Flex`'s default cross-axis-only stretch
  left `Card` auto-sized to its content, so cards had visibly different widths and connector lines
  (which target a fixed footprint) didn't reach the card's actual edge. `Grid` stretches its child on
  both axes by default, forcing every `Card` to the exact same size — the same idiom already used for
  fixed-size cards on the Home page's tree grid (`Home.tsx`).
- Connector-line endpoints were moved from each card's center to its left/right edge, so the line
  never visually runs underneath a card.
- `PersonRef` gained a `compact` prop (independent of `variant`) that reuses the existing `subtle`
  variant's row/inline layout shape (small avatar, dates inline after the name) without its gray
  color — used here so both `normal` and `focal` ancestor cards stay short. Card dimensions were
  tuned alongside it (currently 248×48px) to fit one line of name and dates without wrapping, since a
  wrapped name would grow a card taller than its allotted slot.
