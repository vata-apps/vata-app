# Family View Screen

**MVP**: MVP3 (family CRUD). MVP4 citations/sources. MVP6 design system.

## Objective

Display and manage a family unit: spouses (husband/wife), children, and family events (marriage, divorce, etc.). This module uses the three-panel module layout (sidebar / center / aside).

---

## What We Display

### Sidebar (entity list, left panel)

- **"New" button** at the top to create a new family.
- **Search field** to filter families by spouse name.
- **Scrollable list of all families.** Each list item shows:
  - Husband name + wife name (or "Unknown" if a spouse is missing)
  - Marriage date (if a marriage event exists)
  - Child count
- The **selected family** is visually highlighted.
- Clicking a family item loads its detail in the center and aside panels.

| Situation                           | Expected behavior                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| Family list is empty                | Show empty state with "Create your first family" message and prominent "New" button |
| Family list has hundreds of entries | Virtualized scrolling for performance                                               |
| Search with no results              | Show "No families found" message                                                    |
| Search by spouse name               | Matches against husband or wife name                                                |
| Family with no husband              | List item shows "Unknown" in the husband position                                   |
| Family with no wife                 | List item shows "Unknown" in the wife position                                      |
| Very long spouse name in list       | Truncate with ellipsis                                                              |

### Center Panel (family detail)

- **Header:** family label (e.g., "Husband Name + Wife Name"), "Edit" button, dropdown menu (chevron) for more actions.
- **Key-value detail rows:**
  - **ID** — family identifier, with a copy-to-clipboard button
  - **Husband** — clickable link to the individual, or "No husband" with an "Add" button if missing
  - **Wife** — clickable link to the individual, or "No wife" with an "Add" button if missing
  - **Marriage date** — from the marriage event, if one exists
  - **Marriage place** — clickable link to the Places module, if a marriage event with a place exists
  - **Children list** — ordered list; each child shows name, birth date, and a pedigree badge (birth / adopted / foster / step). Each child name is a clickable link
  - **Notes** — free-text notes associated with the family
- The center panel scrolls independently if content is long.

| Situation                                   | Expected behavior                                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Family with no husband                      | Husband slot shows "No husband" + "Add" button                                                       |
| Family with no wife                         | Wife slot shows "No wife" + "Add" button                                                             |
| Family with no children                     | Children section shows "No children" + "Add child" button                                            |
| Family with no marriage event               | Marriage date and marriage place rows are not shown; family header shows spouse names without a date |
| Family with 15+ children                    | Scrollable list, all children visible                                                                |
| Child with pedigree "adopted"               | Show pedigree badge (e.g., "Adopted") on the child row                                               |
| Two families with same spouses (remarriage) | Both displayed separately as distinct family records                                                 |
| Spouse is also a child in another family    | No conflict — normal linking, both relationships displayed                                           |
| Very long family label                      | Truncate in header with tooltip showing full label                                                   |

### Aside Panel (supplementary details, right)

- **Events section** (collapsible, with count badge): list of family events (marriage, divorce, annulment, census, etc.). Each event shows type, date, and place. Includes an "Add" button at the bottom. Each event has a chevron to navigate to the Events module.
- **Children section** (collapsible, with count badge): quick list of children with name and birth date. Each child has a chevron to navigate to the Individuals module.

| Situation                          | Expected behavior                                   |
| ---------------------------------- | --------------------------------------------------- |
| Family with no events              | Events section shows "No events" + "Add" button     |
| Aside section has many items (50+) | Show first N items + "Show all" link                |
| Aside section has 0 items          | Section still visible with "0" badge and add button |

### Create Family Form Window

Opens in a separate native window (no MainLayout).

- **Spouse 1:** search for an existing person (autocomplete) or create a new person inline.
- **Spouse 2:** search for an existing person (autocomplete) or create a new person inline.
- **Optional marriage event:** date and place fields.
- Footer with Cancel and Create buttons.

| Situation                            | Expected behavior                                                  |
| ------------------------------------ | ------------------------------------------------------------------ |
| Both spouse fields left empty        | Allowed — a family can exist with no spouses initially             |
| Same person selected as both spouses | Validation error: "Spouse 1 and Spouse 2 must be different people" |
| Creating a new person inline         | Minimal form: given names, surname, gender                         |

### Add Child Form Window

Opens in a separate native window (no MainLayout).

- **Search existing person** field with autocomplete.
- **"Or create new person"** option with an inline form: given names, surname, gender.
- **Pedigree type** select: birth, adopted, foster, step.
- Footer with Cancel and Add buttons.

| Situation                             | Expected behavior                                                           |
| ------------------------------------- | --------------------------------------------------------------------------- |
| Person already a child of this family | Validation error: "This person is already a child of this family"           |
| Adding a spouse as a child            | Allowed (genealogically possible in certain edge cases), but show a warning |
| No pedigree selected                  | Default to "birth"                                                          |

### Context Menu (dropdown chevron in center header)

- Edit family
- Add child
- Add event
- Delete family (with confirmation)

---

## Actions

### Create family

- Open the Create Family form window from the sidebar "New" button.
- Optionally select or create Spouse 1 and Spouse 2.
- Optionally provide a marriage event (date, place).
- On Create: insert a new family record; if spouses are specified, link them; if a marriage event is provided, create it. Navigate to the newly created family in the sidebar.

### Add or change husband / wife

- From the center panel, click the "Add" button on an empty husband or wife slot.
- Opens a person search/create form window. The user can **select an existing person** (search/autocomplete) or **create a new person** (inline minimal form).
- On save: link the selected or created individual as the husband or wife of the family.
- To change an existing spouse: use the Edit Family form window to replace the current link.

### Add child

- From the center panel children section or from the context menu, click "Add child."
- Opens the Add Child form window. The user can **select an existing person** (search/autocomplete) or **create a new person** (inline minimal form).
- Select the pedigree type (birth, adopted, foster, step).
- On Add: link the selected or created individual as a child of the family with the specified pedigree.

### Remove child from family

- From the children list, use a remove action (e.g., right-click or inline button) on a specific child.
- Confirmation prompt: "Remove {Child Name} from this family? The person record will not be deleted."
- On confirm: unlink the child from the family. The person record remains intact.

### Add family event

- From the aside Events section "Add" button or from the context menu, click "Add event."
- Opens an Add Event form window with family-specific event types (marriage, divorce, annulment, census, residence, etc.).
- Fields: event type, date, place (search/select), description.
- On save: create the event linked to this family.

### Edit family event

- Click on an event in the aside or navigate to the Events module.
- Opens the Edit Event form window with pre-filled values.
- On save: update the event record.

### Delete family event

- From the event item, use a delete action.
- Confirmation prompt: "Delete this {Event Type} event?"
- On confirm: delete the event record.

### Reorder children

- Children can be reordered via drag-and-drop or manual sort order adjustment.
- The sort order is persisted per family.

### Edit family

- From the center header "Edit" button or context menu.
- Opens the Edit Family form window with pre-filled values for spouses and notes.
- On save: update the family record.

### Delete family

- From the context menu, click "Delete."
- Confirmation (in-window dialog): "Delete this family? Children and spouses will be unlinked but their individual records will not be deleted."
- On confirm: unlink all members (spouses, children), delete family events (CASCADE), delete the family record. Navigate to the next family in the list or show the empty state.

---

## Navigation Map

| Clickable element                           | Destination                                         | Condition             |
| ------------------------------------------- | --------------------------------------------------- | --------------------- |
| Family in sidebar list                      | Selects family, updates center + aside panels       | --                    |
| "New" in sidebar                            | Opens Create Family form window                     | --                    |
| "Edit" in center header                     | Opens Edit Family form window                       | --                    |
| Dropdown (chevron) in center header         | Opens context menu                                  | --                    |
| Husband link (center)                       | Navigates to Individuals module, selects husband    | Husband exists        |
| Wife link (center)                          | Navigates to Individuals module, selects wife       | Wife exists           |
| "Add" on empty husband/wife slot            | Opens person search/create form window              | --                    |
| Child link (center)                         | Navigates to Individuals module, selects child      | --                    |
| "Add child" button (center or context menu) | Opens Add Child form window                         | --                    |
| Marriage place link (center)                | Navigates to Places module, selects that place      | Place exists          |
| Event chevron (aside)                       | Navigates to Events module, selects that event      | --                    |
| "Add" in Events section (aside)             | Opens Add Event form window                         | --                    |
| Child chevron (aside)                       | Navigates to Individuals module, selects that child | --                    |
| "Show all" in aside section                 | Expands to full list or navigates to filtered view  | More items than shown |
| Context menu > Edit                         | Opens Edit Family form window                       | --                    |
| Context menu > Add child                    | Opens Add Child form window                         | --                    |
| Context menu > Add event                    | Opens Add Event form window                         | --                    |
| Context menu > Delete                       | Opens Delete confirmation (in-window)               | --                    |
