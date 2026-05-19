# Layouts

## Objective

Define the reusable layout structures. The app has two layouts: a **full-width layout** for the outside tree picker, and the **in-tree shell** — a persistent navigation header above a fixed three-column layout (left panel / page body / right panel) — for every page inside an open tree.

The two layouts are the visual expression of the **two app contexts** (outside picker vs in-tree shell). For the architectural framing, lifecycle, and invariants, see [`docs/architecture/app-structure.md`](../architecture/app-structure.md).

## Two Layout Modes

| Layout mode   | When used                                     | Key characteristic                                                  |
| ------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| Picker layout | Before opening a tree (tree selection screen) | Full-width content, no header, no side panels                       |
| In-tree shell | Every page inside an open tree                | Navigation header + fixed three-column layout (left / body / right) |

## The In-Tree Shell

`TreeShell` (`src/components/tree-shell.tsx`) frames every route under `/tree/$treeId/...`:

- A persistent **header** carrying `TreeNav` — the navigation bar for the tree's sections (Home, People, Families, Events, Places). Each section is an icon-and-label button; the section in view is highlighted, and Events and Places render disabled until their routes exist. A Settings button on the right opens the preferences popover. The header does not remount as the user moves between sections.
- A fixed **three-column** body: a 332px left panel, the routed page, and a 320px right panel. Column widths are fixed; each column scrolls independently.

The **left panel** holds the active section's entity list — for the People section, the list of people (`PeopleSidebar`); the shell picks it from the active navigation section, so it persists (and keeps the open entity highlighted) as the user moves between a section's list and detail routes. The **right panel** is reserved structural space for contextual detail, added in later work. The shell applies to **all** in-tree routes, the tree overview included — there is no full-width exception.

## Forms Open in Separate Windows

All create/edit operations open in a **separate native Tauri window** — no header, no side panels, only the form content. This is a non-obvious platform decision: it lets the user keep a form open alongside the main shell (or several forms at once) instead of blocking the view with a modal.
