# ADR-011: Full-Width In-Tree Shell — Pages Own Their Panels

**Status**: Accepted
**Date**: 2026-06-02

## Context

The in-tree shell (`TreeShell`) framed every page under `/tree/$treeId/...` with a fixed **three-column** body: a 332px left panel holding the active section's entity list (`PeopleSidebar`, `FamilySidebar`, `EventsSidebar`, `PlacesSidebar`, all built on `EntityListPanel`), the routed page in the centre, and a 320px right panel reserved — but never used — for "contextual detail, added in later work."

In practice the scaffold inverted the cost it was meant to save. The entity **lists lived only in the sidebars**, so every centre page (`IndividualsPage`, `FamiliesPage`, …) was a placeholder stub — a back button and a heading — and the right panel was permanently empty. Two of the three columns were either dead space or the _only_ content, and the page body — the part that should carry a section's work — had nothing. [ADR-010](./0010-pure-radix-themes.md) already flagged the four sidebars as "scheduled for removal when the new entity page lands"; this is that landing.

## Decision

The shell provides **only a persistent header and a full-width page body**. The fixed left panel, the reserved right panel, and the two vertical separators are removed.

- **Pages render full-width by default.** A page that needs its own panels (a list rail, a contextual detail pane) builds them inside its own body, when the need is real — not by inheriting an always-present shared scaffold.
- **The entity lists move into their pages as full-width tables.** People, Families, Events, and Places each render a Radix `Table` directly in the page body. A row click opens that entity's detail route. The four `*Sidebar` components and the shared `EntityListPanel` are deleted; a new `EntityTable` organism carries the column-driven table, loading/empty/error states, and row navigation shared by all four.
- **Tables are read-only this pass.** No toolbar, no count badge, no "New" action, no sort control — each table has a single fixed default sort (People by surname, Families by husband surname, Events by date oldest-first, Places by name). The sort UI and the disabled "New" affordance the sidebars carried are dropped, to be reintroduced per-page when each section's real design lands.
- **The top nav drops the `ghost` variant.** Section buttons use `variant="soft"` (accent) when active and `variant="surface"` (gray) when not, so every item carries visible chrome instead of being invisible until hover.

## Why

- **The scaffold was premature.** A shared three-column frame only pays off when most pages want all three columns. Here the right column was never used and the left column _was_ the content. Letting each page own its layout matches how the sections actually differ.
- **No dead structural space.** Removing the empty right panel and the list-only left panel reclaims the full width for the page's real work.
- **Re-introduce panels on evidence, not by default.** When a page genuinely needs a detail rail (e.g. the forthcoming person-overview work), it builds exactly the panel it needs, rather than every page paying for a frame one page might use.

## Alternatives Considered

- **Keep the three-column shell, fill the panels later**: rejected — it preserves dead space and stub pages indefinitely, the exact state ADR-010 flagged for removal.
- **Move the lists into the page but keep the narrow card list (no table)**: rejected — a 332px card list stretched to full width reads as sparse; a table uses the horizontal space and is the right primitive for a scannable entity list.
- **Switch the top nav to `TabNav`**: rejected — the underline tab-bar look was not wanted for the primary navigation; the button-row look is kept, only the `ghost` variant is dropped.

## Consequences

**Positive**: full-width pages; no permanently-empty panel; the entity lists become real, scannable tables; one shared `EntityTable` organism replaces four sidebars plus `EntityListPanel`; the nav reads as a set of controls rather than near-invisible ghost text.

**Negative / Trade-offs**: the persistent always-visible section list (and its selected-row highlight while on a detail route) is gone — a section's list and an entity's detail no longer sit side by side; sort controls and the count badge are lost until reintroduced per page; the detail routes remain stubs (owned by the person-overview work), so a row click currently lands on a placeholder.

## References

- [ADR-010: Pure Radix Themes](./0010-pure-radix-themes.md) — flagged the four entity sidebars for removal "when the new entity page lands"; this ADR removes them and the `EntityListPanel` they shared.
- [ADR-007: Adopt Radix Themes](./0007-adopt-radix-themes.md)
- [`docs/ui/layouts.md`](../ui/layouts.md) — the layout doc updated to describe the full-width shell.
