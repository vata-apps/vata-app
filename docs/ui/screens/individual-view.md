# Individual View Screen (Person Record)

## Purpose

Display all information about a person — identity and names, life events, families (parents, spouses, children), notes. The most complex module; uses the three-panel layout (sidebar / center / aside).

## Domain rules

- **Multiple names, none marked primary** — fall back to the first name as the primary display name.
- **Half-siblings are a distinct relationship category** — separate from full siblings, because they share only one parent.
- **One origin family + N formed families** — a person is a child in exactly one family but may be a spouse in many; the view shows all of them.
- **A family without a spouse shows its children alone** — single-parent or unknown-spouse families are valid and render their children without a couple.
- **Living person → limited displayed info** — for a person marked living, the view restricts what it shows (configurable privacy).

## Implementation

`src/pages/IndividualViewPage.tsx`.
