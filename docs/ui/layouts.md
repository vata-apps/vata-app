# Layouts

## Objective

Define the reusable layout structures. The app has two layouts: a **full-width layout** for the outside tree picker, and the **in-tree shell** — a persistent navigation header above a full-width page body — for every page inside an open tree.

The two layouts are the visual expression of the **two app contexts** (outside picker vs in-tree shell). For the architectural framing, lifecycle, and invariants, see [`docs/architecture/app-structure.md`](../architecture/app-structure.md).

## Two Layout Modes

| Layout mode   | When used                                     | Key characteristic                                             |
| ------------- | --------------------------------------------- | -------------------------------------------------------------- |
| Picker layout | Before opening a tree (tree selection screen) | Full-width content, no header, no side panels                  |
| In-tree shell | Every page inside an open tree                | Navigation header + full-width page body; pages own any panels |

## The In-Tree Shell

`TreeShell` (`src/components/tree-shell.tsx`) frames every route under `/tree/$treeId/...`:

- A persistent **header** carrying `TreeNav` — the navigation bar for the tree's sections (Home, People, Families, Events, Places). Each section is an icon-and-label `Button`: the section in view uses `variant="soft"` in the accent color, the others `variant="surface"` in gray. A Settings button on the right opens the preferences popover. The header does not remount as the user moves between sections.
- A **full-width body** holding the routed page. The page owns the full width; there is no shared left or right panel.

**Pages render full-width by default.** The shell provides only the header and a full-width body — no fixed side panels. A page that needs its own panels (a list rail, a contextual detail pane) builds them inside its own body when the need is real, rather than inheriting an always-present shared scaffold. The entity sections (People, Families, Events, Places) render their list as a full-width `Table` directly in the page body, and a row click opens that entity's detail route.

## Forms Open in Separate Windows

All create/edit operations open in a **separate native Tauri window** — no header, no side panels, only the form content. This is a non-obvious platform decision: it lets the user keep a form open alongside the main shell (or several forms at once) instead of blocking the view with a modal.
