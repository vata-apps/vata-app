# Layouts

## Objective

Define the reusable layout structures. The app combines a **top navigation bar** with a **three-panel layout** (sidebar / center / aside) for entity modules, and a full-width layout for the home screen.

The two layout modes below are the visual expression of the **two app contexts** (outside picker vs in-tree shell). For the architectural framing, lifecycle, and invariants, see [`docs/architecture/app-structure.md`](../architecture/app-structure.md).

## Two Layout Modes

| Layout mode   | When used                                                        | Key characteristic                               |
| ------------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| Home layout   | Before opening a tree (tree selection screen)                    | Full-width content, no sidebar, no aside         |
| Module layout | Inside a tree, for all entity modules and the tree overview page | Top nav bar + three-panel layout (or full-width) |

## Forms Open in Separate Windows

All create/edit operations open in a **separate native Tauri window** — no top nav, no sidebar, no aside, only the form content. This is a non-obvious platform decision: it lets the user keep a form open alongside the main shell (or several forms at once) instead of blocking the view with a modal.
