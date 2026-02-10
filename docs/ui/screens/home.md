# Home Screen (Tree Selection)

**MVP**: MVP1 (tree list, create, open, close, delete). MVP2 adds Import/Export GEDCOM.

## Objective

Allow the user to view their existing trees, create a new tree, import a GEDCOM file, and quickly open a recent tree.

---

## What We Display

### Page Header

- App logo or name (left-aligned)
- "New Tree" button (primary action)
- "Import GEDCOM" button (secondary action)

### Tree Grid

- Responsive grid of tree cards (auto-fill, min 280px per column)
- Cards are sorted by last opened date (most recent first), then by created date

### Tree Card

Each card displays:

- **Tree name** -- truncated with ellipsis if too long
- **Description** (optional) -- truncated to 2 lines with ellipsis
- **Individual count** -- number of individuals in the tree
- **Family count** -- number of families in the tree
- **Last opened date** -- relative or absolute date; shows "Never opened" if `last_opened_at` is null
- **Created date** -- when the tree was created
- **Three-dot menu** icon to open the context menu

### Empty State

Shown when there are no trees at all:

- Illustration or icon
- Message (e.g., "No trees yet. Create your first tree or import a GEDCOM file.")
- Prominent "New Tree" button
- Prominent "Import GEDCOM" button

### Loading State

- Skeleton cards matching the tree card shape and layout
- Displayed while the tree list is being fetched

### New Tree Form Window

Opens in a separate native window (no MainLayout).

- **Name** field -- required, must be unique across all trees
- **Description** field -- optional, free text
- **Cancel** button -- closes the window without action
- **Create** button -- disabled until form is valid

### Import GEDCOM Form Window

Opens in a separate native window (no MainLayout).

- **File picker** -- supports drag-and-drop and browse
- **Validation step** -- after file is selected, displays stats: X individuals, X families, X events, X places
- **Name** field -- pre-filled from the filename (editable, required, must be unique)
- **Cancel** button -- closes the window without action
- **Import** button -- disabled until file is valid and name is provided

### Context Menu

Accessible via right-click on a card or the three-dot icon. Options:

- **Open** -- opens the tree
- **Rename** -- opens the Rename form window
- **Duplicate** -- duplicates the tree
- **Export GEDCOM** -- exports the tree as a .ged file
- **Delete** -- opens a Delete confirmation (in-window dialog)

### Rename Form Window

Opens in a separate native window (no MainLayout).

- **Name** field -- pre-filled with the current tree name, required, must be unique
- **Cancel** button
- **Save** button -- disabled until form is valid

### Delete Confirmation

Displayed as an in-window confirmation dialog (not a separate native window).

- Displays the tree name
- Warning message about permanent deletion (tree data cannot be recovered)
- **Cancel** button
- **Delete** button (destructive styling)

### Edge Cases

| Situation                            | Expected behavior                                 |
| ------------------------------------ | ------------------------------------------------- |
| No trees at all                      | Show empty state with call-to-action buttons      |
| Tree name very long                  | Truncate with ellipsis on card                    |
| Tree description very long           | Truncate to 2 lines with ellipsis                 |
| Tree with 0 individuals / 0 families | Show "0" counts                                   |
| Duplicate tree name on create        | Validation error inline                           |
| GEDCOM file too large                | Show progress indicator, disable import button    |
| GEDCOM file invalid                  | Show error message with detail in the Import GEDCOM window |
| GEDCOM import partially fails        | Show summary of what was imported and what failed |
| Tree database file missing on disk   | Show error badge on card, disable open            |
| Hundreds of trees                    | Scrollable grid, consider virtualization          |
| Tree never opened                    | `last_opened_at` is null, show "Never opened"     |

---

## Actions

### Create Tree

1. User clicks "New Tree" button (page header or empty state)
2. New Tree form window opens
3. User enters a name (required) and optional description
4. System validates the name is not empty and is unique across all trees
5. On validation failure: inline error message under the name field
6. On submit: create an entry in `system.db`, create the corresponding `.db` file with the schema
7. Navigate to `/tree/{newTreeId}`

### Import GEDCOM

1. User clicks "Import GEDCOM" button (page header or empty state)
2. Import GEDCOM form window opens
3. User selects a `.ged` file via drag-and-drop or browse
4. System parses and validates the file
5. If the file is invalid: show an error message with detail (e.g., "Not a valid GEDCOM 5.5.1 file")
6. If valid: display a preview with stats (X individuals, X families, X events, X places)
7. Name field is pre-filled from the filename; user may edit it
8. System validates the name is not empty and is unique
9. On submit: create tree in `system.db`, create `.db` file, import all data
10. If import partially fails: show summary of what was imported and what failed
11. Navigate to `/tree/{newTreeId}`

### Open Tree

1. User clicks a tree card, double-clicks a card, or selects "Open" from the context menu
2. System marks the tree as recently opened (updates `last_opened_at`)
3. Navigate to `/tree/{treeId}`
4. Open connection to the tree database

### Rename Tree

1. User selects "Rename" from the context menu
2. Rename form window opens with the current name pre-filled
3. User edits the name
4. System validates the name is not empty and is unique (excluding the current tree)
5. On validation failure: inline error message
6. On submit: update the tree name in `system.db`
7. Card updates in place

### Duplicate Tree

1. User selects "Duplicate" from the context menu
2. System copies the `.db` file with an incremented name (e.g., "My Tree (Copy)")
3. System creates a new entry in `system.db`
4. A new card appears in the grid
5. No navigation occurs; the user stays on the home screen

### Export GEDCOM

1. User selects "Export GEDCOM" from the context menu
2. OS save dialog opens
3. System generates a `.ged` file from the tree data
4. File is saved to the user-selected location

### Delete Tree

1. User selects "Delete" from the context menu
2. Delete confirmation (in-window dialog) opens, displaying the tree name
3. User confirms deletion
4. System deletes the `.db` file and removes the entry from `system.db`
5. Card is removed from the grid
6. If it was the last tree, the empty state is shown

---

## Navigation Map

| Clickable element                 | Destination                     | Condition  |
| --------------------------------- | ------------------------------- | ---------- |
| Tree card (click or double-click) | `/tree/{treeId}`                | --         |
| "New Tree" button                 | Opens New Tree form window      | --         |
| "Import GEDCOM" button            | Opens Import GEDCOM form window | --         |
| Context menu > Open               | `/tree/{treeId}`                | --         |
| Context menu > Rename             | Opens Rename form window        | --         |
| Context menu > Duplicate          | Stays on home, new card appears | --         |
| Context menu > Export GEDCOM      | OS save dialog                  | --         |
| Context menu > Delete             | Opens Delete confirmation       | --         |
| New Tree form window > Create     | `/tree/{newTreeId}`             | Form valid |
| Import form window > Import       | `/tree/{newTreeId}`             | File valid |
