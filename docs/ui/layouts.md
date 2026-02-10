# Layouts

## Objectif

Définir les structures de layout réutilisables. L'app utilise une **barre de navigation en haut** combinée à un **layout trois panneaux** (sidebar / centre / aside) pour les modules d'entités, et un layout pleine largeur pour l'écran d'accueil.

> **Adoption par MVP** : MVP3 implémente routes et layouts en **HTML uniquement** (pas de Mantine). MVP4 applique le layout complet avec Mantine (AppShell, panels, etc.).

---

## What We Display

### Global Structure

The app has two distinct layout modes:

| Layout mode   | When used                                                        | Key characteristic                               |
| ------------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| Home layout   | Before opening a tree (tree selection screen)                    | Full-width content, no sidebar, no aside         |
| Module layout | Inside a tree, for all entity modules and the tree overview page | Top nav bar + three-panel layout (or full-width) |

### Top Navigation Bar

Present across the entire app once a tree is open. Sits at the very top of the viewport, full width, fixed height (~48-56px). Does not scroll with content.

| Element            | Position | Description                                                                                |
| ------------------ | -------- | ------------------------------------------------------------------------------------------ |
| Home icon          | Leftmost | Always visible; returns to tree overview                                                   |
| Module icons       | Center   | Individuals, Families, Events, Places -- displayed in a row                                |
| Active module icon | Center   | The currently active module icon is visually highlighted (background, underline, or color) |

| Edge case                           | Expected behavior                                            |
| ----------------------------------- | ------------------------------------------------------------ |
| User navigates to another module    | Corresponding icon becomes highlighted, previous deactivates |
| Bar is always visible, never hidden | The bar does not collapse or scroll away                     |

### Module Layout (Three-Panel: Sidebar / Center / Aside)

Used by all entity modules (Individuals, Families, Events, Places). The viewport below the top nav bar is divided into three panels side by side.

#### Panel A -- Sidebar (Entity List, Left)

| Element              | Description                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| "New" button         | At the top; creates a new entity for the current module                                          |
| Search field         | Filters the entity list in real-time as the user types                                           |
| Entity list          | Scrollable list of all entities for the current module                                           |
| List item content    | Entity name (primary label), secondary info (ID, type, dates, gender/status depending on module) |
| Selected item        | Visually highlighted; clicking an item selects it and updates the center + aside panels          |
| Chevron on each item | Indicates the item is selectable                                                                 |

| Edge case                                    | Expected behavior                             |
| -------------------------------------------- | --------------------------------------------- |
| Entity list is empty (no entities in module) | Show empty state + "New" button prominent     |
| Entity list has hundreds of items            | Virtualized scrolling, search field to filter |
| Very long entity name in sidebar list        | Truncate with ellipsis                        |

#### Panel B -- Center (Entity Detail, Middle)

| Element                 | Description                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| Header                  | Entity primary name/title, "Edit" button, dropdown menu (chevron) for more actions          |
| Key-value detail rows   | The entity's main fields presented as label/value pairs (like a form in read mode)          |
| Clickable values        | Rendered as links (e.g., a place name links to the place, a parent links to the individual) |
| Rich content (optional) | Depends on module (e.g., a map for places, a timeline for individuals)                      |

The center panel scrolls independently if content is long.

| Edge case                  | Expected behavior                                                 |
| -------------------------- | ----------------------------------------------------------------- |
| No entity selected         | Show empty state ("Select an item") or auto-select the first item |
| Selected entity is deleted | Deselect; center returns to empty state or selects next entity    |

#### Panel C -- Aside (Supplementary Details, Right)

| Element                        | Description                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| Collapsible sections           | Each section groups related data (e.g., Parents, Families, Events)                      |
| Section title + count badge    | Shows the section name and a count of items (e.g., "Events (12)")                       |
| Collapse/expand toggle         | Each section can be collapsed or expanded                                               |
| Compact entity lists           | Each item shows key info + chevron for navigation to that entity                        |
| Action buttons within sections | E.g., "Add Brother", "Add Sister" in Parents section; "Add" at bottom of Events section |
| "Show all" link                | Shown when the list is truncated (e.g., showing 5 of 42 events); expands or navigates   |

The aside panel scrolls independently.

| Edge case                          | Expected behavior                                                |
| ---------------------------------- | ---------------------------------------------------------------- |
| Aside section has 0 related items  | Section still visible with "0" badge, shows "None" or add button |
| Aside section has many items (50+) | Show first N items + "Show all" link                             |

### Home Layout (Tree Selection)

Used before a tree is open. No three-panel layout, no top nav module icons.

| Element                | Description                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| App branding / header  | App logo or name, tree selection header                                  |
| Tree grid              | Responsive card grid, or empty state if no trees exist                   |
| "New Tree" button      | Primary action to create a tree                                          |
| "Import GEDCOM" button | Secondary action to import from a GEDCOM file                            |
| Content centering      | Full-width but constrained to a max-width; centered if viewport is wider |
| Top nav bar            | May show only the Home icon or a simplified version (no module icons)    |

No sidebar, no aside -- content is a full-width centered layout.

### Form Layout (Standalone Window)

Used for all create/edit operations across all modules. Each form opens in a **separate native Tauri window** (no MainLayout, no top nav, no sidebar, no aside -- only the form content).

| Element              | Description                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Window title         | Describes the action (e.g., "Create Person", "Edit Event")                                 |
| Scrollable form body | Contains the form fields; scrolls if content exceeds available height                      |
| Sticky footer        | Contains Cancel and Save/Create buttons; always visible at the bottom of the window        |
| Max width            | Constrained (e.g., 560px)                                                                  |
| Close behavior       | Escape key or native window close button closes the window if there are no unsaved changes |

| Edge case                              | Expected behavior                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| Form window with very long content     | Form body scrolls, footer stays sticky                                                      |
| Multiple form windows open at once     | Allowed (e.g., edit person in one window, edit family in another)                           |
| Escape or close with unsaved changes   | An in-window confirmation dialog prompts the user to discard changes or cancel the close    |

### Panel Sizing and Behavior

| Panel                 | Approximate width                   | Scrolling             | Resizable            |
| --------------------- | ----------------------------------- | --------------------- | -------------------- |
| Top nav bar           | Full width, fixed height (~48-56px) | No                    | No                   |
| Sidebar (entity list) | ~240-280px                          | Vertical, independent | To be decided        |
| Center (detail)       | Flexible, takes remaining space     | Vertical, independent | No (fills available) |
| Aside (supplementary) | ~280-320px                          | Vertical, independent | To be decided        |

### Responsive Behavior

| Viewport               | Top nav                        | Sidebar                              | Center     | Aside                                               |
| ---------------------- | ------------------------------ | ------------------------------------ | ---------- | --------------------------------------------------- |
| < 1024px (compact)     | Icons only, possibly hamburger | Hidden, accessible via toggle/drawer | Full width | Hidden, accessible via toggle/drawer or slides over |
| 1024-1440px (standard) | Full icon bar                  | Visible                              | Flexible   | Visible or toggle                                   |
| > 1440px (wide)        | Full icon bar                  | Visible                              | Wide       | Always visible                                      |

| Edge case                                    | Expected behavior                                        |
| -------------------------------------------- | -------------------------------------------------------- |
| Window resized from wide to compact          | Sidebar and aside collapse, center takes full width      |
| User navigates to another module via top nav | Sidebar list changes to new module, center/aside reset   |
| Clicking a link in center (e.g., place name) | Navigates to that module, selects that entity in sidebar |
| Back/forward browser navigation              | Restores module + selected entity state                  |

### Grid and Alignment Rules

| Property            | Value                                      |
| ------------------- | ------------------------------------------ |
| Page padding        | 24px (desktop), 16px (compact)             |
| Gap between cards   | 16px (used in home grid)                   |
| Max width           | 1440px for home layout (centered if wider) |
| Card columns        | auto-fit, min 280px, max 1fr               |
| Titles              | Left-aligned                               |
| Numbers (in tables) | Right-aligned                              |
| Dates               | Right-aligned                              |
| Actions             | Right-aligned                              |

---

## Actions

### Click Module Icon in Top Nav

- **Trigger:** Click on a module icon (Individuals, Families, Events, or Places)
- **Behavior:** Switch to that module. The sidebar shows the entity list for the selected module. The center and aside panels reset (either empty state or auto-select the first entity).

### Click Home Icon in Top Nav

- **Trigger:** Click on the Home icon
- **Behavior:** Return to the tree overview page (tree dashboard). If already on the tree overview, no-op.

### Click "New" in Sidebar

- **Trigger:** Click the "New" button at the top of the sidebar
- **Behavior:** Open a form window for the current module's entity type.

### Type in Sidebar Search

- **Trigger:** Type in the sidebar search field
- **Behavior:** Filter the entity list in real-time. Only entities matching the search query are shown.

### Click Entity in Sidebar List

- **Trigger:** Click on an entity item in the sidebar list
- **Behavior:** Select it. The center panel shows the entity detail. The aside panel shows related/supplementary data.

### Click "Edit" in Center Header

- **Trigger:** Click the "Edit" button in the center panel header
- **Behavior:** Open the edit form in a new window for the currently selected entity.

### Click Dropdown (Chevron) in Center Header

- **Trigger:** Click the dropdown chevron next to the "Edit" button
- **Behavior:** Show a context menu with additional actions (e.g., delete, export, etc.).

### Click Linked Value in Center

- **Trigger:** Click a linked value in the center panel (e.g., a place name, a parent name)
- **Behavior:** Navigate to the target module and select the linked entity in its sidebar.

### Click Chevron on Aside Item

- **Trigger:** Click the chevron on an item in an aside section
- **Behavior:** Navigate to that entity's detail. May switch to a different module if the entity belongs to another module.

### Click "Add" in Aside Section

- **Trigger:** Click an "Add" button within an aside section
- **Behavior:** Open the relevant creation form in a new window (e.g., "Add" in Events section opens the Add Event form window).

### Click "Show All" in Aside Section

- **Trigger:** Click the "Show all" link in a truncated aside section
- **Behavior:** Expand to the full list within the aside, or navigate to a filtered view of that module.

### Close Form Window (Escape or Native Close)

- **Trigger:** Press the Escape key or click the native window close button
- **Behavior:** Close the form window if there are no unsaved changes. If there are unsaved changes, an in-window confirmation dialog prompts the user to discard changes or cancel the close.

---

## Navigation Map

| Clickable element                    | Destination                                           | Condition             |
| ------------------------------------ | ----------------------------------------------------- | --------------------- |
| Home icon (top nav)                  | Tree overview page                                    | --                    |
| Module icon (top nav)                | Respective module page (sidebar + center + aside)     | --                    |
| "New" in sidebar                     | Opens creation form window for current module         | --                    |
| Entity in sidebar list               | Selects entity, updates center + aside                | --                    |
| "Edit" in center header              | Opens edit form window for current entity             | --                    |
| Dropdown (chevron) in center header  | Opens context menu                                    | --                    |
| Linked value in center (e.g., place) | Navigates to target module, selects entity            | --                    |
| Chevron on aside item                | Navigates to that entity's detail (may switch module) | --                    |
| "Add" in aside section               | Opens relevant creation form window                   | --                    |
| "Show all" in aside section          | Expands full list or navigates to filtered view       | More items than shown |
| Escape or window close               | Closes form window (with unsaved prompt if dirty)     | No unsaved changes    |
