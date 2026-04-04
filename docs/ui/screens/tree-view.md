# Tree View Screen (Main Tree View)

**MVP**: MVP3 (tree dashboard, module navigation). MVP4 applies the full design system.

## Objective

Home page after opening a tree, allowing users to:

- See a summary of the tree
- Quickly access key individuals
- Navigate to different sections
- View recent modifications

This is the dashboard/overview screen shown when a tree is first opened (Home icon in the top nav bar). It does **not** use the three-panel module layout -- it is a full-width content page below the top nav bar.

---

## What We Display

### Top Navigation Bar

The persistent top navigation bar is visible at the top of the viewport. It contains:

| Element      | Description                                                                |
| ------------ | -------------------------------------------------------------------------- |
| Home icon    | Leftmost icon, visually highlighted/active since this is the tree overview |
| Module icons | Individuals, Families, Events, Places -- navigate to each module           |

### Page Header

| Element             | Description                                                                           |
| ------------------- | ------------------------------------------------------------------------------------- |
| Tree name           | Displayed prominently, with a dropdown chevron that opens the tree menu               |
| "Close tree" action | Button or link to close the current tree and return to the home/tree-selection screen |

| Edge case           | Expected behavior                        |
| ------------------- | ---------------------------------------- |
| Very long tree name | Truncate in header with tooltip on hover |

### Statistics Section

Displays 5 stat cards in a horizontal row. Each card contains an icon, a count, and a label.

| Stat card   | Icon | Count                       | Label         |
| ----------- | ---- | --------------------------- | ------------- |
| Individuals | 👤   | Total number of individuals | "Individuals" |
| Families    | 👨‍👩‍👧   | Total number of families    | "Families"    |
| Events      | 📅   | Total number of events      | "Events"      |
| Places      | 📍   | Total number of places      | "Places"      |

Clicking a stat card navigates to the corresponding module.

| Edge case                        | Expected behavior                                      |
| -------------------------------- | ------------------------------------------------------ |
| Stat card shows 0                | Card still visible and clickable (leads to empty list) |
| Large tree (10,000+ individuals) | Stats load fast via indexed queries                    |

### Quick Actions Section

Displays 4 action buttons for the most common creation tasks:

| Button     | Action on click                  |
| ---------- | -------------------------------- |
| New person | Opens Create Person form window  |
| New family | Opens Create Family form window  |
| New event  | Opens Create Event form window   |
| New place  | Opens Create Place form window   |

### Recent Activity Section

A timeline of the latest modifications, grouped by day. Each entry displays:

| Field       | Description                              |
| ----------- | ---------------------------------------- |
| Action type | One of: created, updated, deleted        |
| Entity type | One of: individual, family, event, place |
| Entity name | The display name of the entity           |
| Timestamp   | Time of the action (e.g., "14:32")       |

Only the most recent 10 entries are shown initially.

| Edge case                            | Expected behavior                                             |
| ------------------------------------ | ------------------------------------------------------------- |
| Tree with no activity yet            | Section shows "No recent activity"                            |
| Activity references a deleted entity | Show strikethrough or "deleted" label; entry is not clickable |
| Large tree (10,000+ individuals)     | Activity section loads last 10 entries only                   |

### Individuals Without Parents Section

A horizontal scrollable list of person mini-cards representing individuals who have no assigned parents (potential tree roots). Each mini-card displays:

| Field       | Description                           |
| ----------- | ------------------------------------- |
| Gender icon | Male, female, or neutral icon         |
| Name        | Full display name of the individual   |
| Lifespan    | Birth year – death year (or "Living") |

| Edge case                      | Expected behavior                                      |
| ------------------------------ | ------------------------------------------------------ |
| No individuals without parents | Section hidden or shows "All individuals have parents" |
| All individuals have parents   | Section hidden                                         |

### Tree Menu Dropdown

Accessed via the chevron next to the tree name in the page header. Contains the following options:

| Menu item          | Action                                                  |
| ------------------ | ------------------------------------------------------- |
| Rename             | Opens Rename form window (pre-filled name, required field)    |
| Export GEDCOM      | Opens OS save dialog, generates .ged file                     |
| Statistics details | Navigates to a detailed statistics view                       |
| Delete tree        | Opens Delete confirmation (in-window dialog), then navigates to `/` |

### Empty Tree State

Shown when a newly created or imported tree contains no data.

| Element              | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| Message              | Informative text explaining the tree is empty                      |
| Quick action buttons | Prominent buttons to add the first person, family, event, or place |

| Edge case                  | Expected behavior                                            |
| -------------------------- | ------------------------------------------------------------ |
| Newly created tree (empty) | Show empty tree state with quick actions to add first person |

### Loading State

While data is loading, each section displays a skeleton loader matching the shape and size of its final content (stat cards, activity entries, person mini-cards).

---

## Actions

### Navigate to Module via Stat Card

- **Trigger:** Click on any stat card
- **Behavior:** Navigates to the corresponding module (Individuals, Families, Events, or Places). The module's sidebar list and content area load accordingly.

### Create Entity via Quick Action

- **Trigger:** Click on one of the 4 quick action buttons (New person, New family, New event, New place)
- **Behavior:** Opens a creation form window for the selected entity type. On successful creation, the new entity appears in the corresponding module.

### Click Activity Entry

- **Trigger:** Click on a recent activity entry
- **Precondition:** The referenced entity has not been deleted
- **Behavior:** Navigates to the appropriate module and selects the referenced entity

### Click Person Mini-Card

- **Trigger:** Click on a person mini-card in the "Individuals without parents" section
- **Behavior:** Navigates to the Individuals module and selects that individual

### Close Tree

- **Trigger:** Click on "Close tree" button
- **Behavior:**
  1. Closes the database connection for the current tree
  2. Resets the application store (currentTreeId = null)
  3. Navigates to the home/tree-selection screen (`/`)

### Tree Menu: Rename

- **Trigger:** Select "Rename" from the tree menu dropdown
- **Behavior:** Opens a Rename form window with the current tree name pre-filled
- **Validation:** Name is required

### Tree Menu: Export GEDCOM

- **Trigger:** Select "Export GEDCOM" from the tree menu dropdown
- **Behavior:** Opens the OS save dialog. Generates a `.ged` file from the tree data and saves it to the chosen location.

### Tree Menu: Delete Tree

- **Trigger:** Select "Delete tree" from the tree menu dropdown
- **Behavior:** Opens a Delete confirmation (in-window dialog) showing the tree name and warning about permanent deletion. On confirmation:
  1. Deletes the tree database file
  2. Removes the entry from the system database
  3. Navigates to `/` (home)

---

## Navigation Map

| Clickable element         | Destination                                         | Condition          |
| ------------------------- | --------------------------------------------------- | ------------------ |
| Home icon (top nav)       | This page (tree overview) -- no-op if already here  | --                 |
| Module icons (top nav)    | Respective module page                              | --                 |
| Stat card "Individuals"   | Navigates to Individuals module                     | --                 |
| Stat card "Families"      | Navigates to Families module                        | --                 |
| Stat card "Events"        | Navigates to Events module                          | --                 |
| Stat card "Places"        | Navigates to Places module                          | --                 |
| Quick action "New person" | Opens Create Person form window                     | --                 |
| Quick action "New family" | Opens Create Family form window                     | --                 |
| Quick action "New event"  | Opens Create Event form window                      | --                 |
| Quick action "New place"  | Opens Create Place form window                      | --                 |
| Activity entry            | Navigates to appropriate module, selects entity     | Entity not deleted |
| Person mini-card          | Navigates to Individuals module, selects individual | --                 |
| "Close tree" button       | `/` (home)                                          | --                 |
| Tree menu > Rename        | Opens Rename form window                            | --                 |
| Tree menu > Export GEDCOM | OS save dialog                                      | --                 |
| Tree menu > Statistics    | Navigates to statistics detail view                 | --                 |
| Tree menu > Delete        | Opens Delete confirmation (in-window), then `/`     | --                 |
