# Layouts

## Objective

Define the reusable layout structures. The app has two layouts: a **full-width layout** for the outside tree picker, and the **in-tree shell** — a persistent icon-navigation header above a fixed three-column layout (left panel / page body / right panel) — for every page inside an open tree.

The two layouts are the visual expression of the **two app contexts** (outside picker vs in-tree shell). For the architectural framing, lifecycle, and invariants, see [`docs/architecture/app-structure.md`](../architecture/app-structure.md).

## Two Layout Modes

| Layout mode   | When used                                     | Key characteristic                                                       |
| ------------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| Picker layout | Before opening a tree (tree selection screen) | Full-width content, no header, no side panels                            |
| In-tree shell | Every page inside an open tree                | Icon-navigation header + fixed three-column layout (left / body / right) |

## The In-Tree Shell

`TreeShell` (`src/components/tree-shell.tsx`) frames every route under `/tree/$treeId/...`:

- A persistent **header** carrying `TreeNav` — the icon navigation bar for the tree's sections (Home, People, Families, Sources, Repositories). It does not remount as the user moves between sections, and highlights the section in view.
- A fixed **three-column** body: a left panel, the routed page, and a right panel. Column widths are fixed; each column scrolls independently.

The two side panels are reserved structural space — they hold contextual content (entity lists, contextual detail panels) added in later work. The shell applies to **all** in-tree routes, the tree overview included — there is no full-width exception.

## Forms Open in Separate Windows

All create/edit operations open in a **separate native Tauri window** — no header, no side panels, only the form content. This is a non-obvious platform decision: it lets the user keep a form open alongside the main shell (or several forms at once) instead of blocking the view with a modal.
