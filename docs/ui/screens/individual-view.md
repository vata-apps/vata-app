# Individual View Screen (Person Record)

## Objective

Display all information about a person: identity and names, life events, families (parents, spouses, children), notes.

Most complex module. Uses the three-panel layout (sidebar / center / aside).

---

## What We Display

### Sidebar (Entity List, Left Panel)

- **"New" button** at the top to create a new individual
- **Search field** to filter individuals by name
- **Scrollable list** of all individuals. Each item shows:

| Field         | Description                            |
| ------------- | -------------------------------------- |
| Full name     | Primary display name of the individual |
| ID            | Internal identifier                    |
| Gender        | Male, female, or unknown icon          |
| Birth date    | Date of birth (if known)               |
| Living status | "Alive" or "Deceased"                  |

- The currently selected individual is highlighted
- Clicking an individual loads their detail in the center and aside panels

### Center Panel (Individual Detail)

**Header:**

| Element           | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| Full primary name | Prefix + given names + SURNAME + suffix, displayed prominently |
| "Edit" button     | Opens the Edit Person form window                              |
| Dropdown chevron  | Opens a context menu with additional actions                   |

**Key-value detail rows:**

| Field             | Description                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| ID                | Internal identifier with a copy button                                                         |
| Gender            | Male, Female, or Unknown                                                                       |
| Alternative names | All non-primary names listed, each with an edit icon                                           |
| Birth date        | Date of birth; shows "Birth unknown" if no birth event                                         |
| Birth place       | Clickable link to the Places module                                                            |
| Death date        | Date of death; shows "Living" if person is alive, "Death unknown" if deceased but date unknown |
| Death place       | Clickable link to the Places module; follows same logic as death date                          |
| Father            | Clickable link showing name, lifespan, and living status                                       |
| Mother            | Clickable link showing name, lifespan, and living status                                       |
| Siblings          | Clickable links to each sibling                                                                |
| Half-siblings     | Clickable links, or "None" if no half-siblings                                                 |

The center panel scrolls independently if content is long.

### Aside Panel (Supplementary Details, Right)

**Parents section** (collapsible):

- Father card and mother card, each showing ID, gender, birth date, living status, and a chevron to navigate
- "Add Brother" and "Add Sister" buttons (visible when parents exist)
- Siblings listed under the parents

**Families section** (collapsible, with count badge):

- List of families where the person is a spouse
- Each family shows: spouse name, marriage info (date if available), child count
- Chevron on each family to navigate to the Families module

**Events section** (collapsible, with count badge):

- Compact list of events showing: type, ID, date, place
- "Add" button at the bottom
- "Show all" link when the list is truncated

Each aside section scrolls independently.

### Edit Person Form Window

Opens in a separate native window (no MainLayout).

| Field         | Description                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| Gender        | Select: Male, Female, Unknown                                                                                |
| Living status | Toggle between living and deceased                                                                           |
| Names         | Add, edit, and delete names. Each name has: prefix, given names, surname, suffix, nickname, type, is_primary |
| Notes         | Free-text textarea                                                                                           |

### Context Menu (Dropdown Chevron in Center Header)

| Menu item     | Action                                |
| ------------- | ------------------------------------- |
| Edit person   | Opens Edit Person form window         |
| Add event     | Opens Add Event form window           |
| Add to family | Opens family linking form window      |
| Delete person | Opens Delete confirmation (in-window) |

### Edge Cases

| Situation                                         | Expected behavior                                                                 |
| ------------------------------------------------- | --------------------------------------------------------------------------------- |
| No name at all                                    | Show "Unknown" or "No name" placeholder                                           |
| Multiple names, none marked primary               | Use first name as primary                                                         |
| No events at all                                  | Overview shows "No events" + add event link; Events section shows empty state     |
| No birth event                                    | Birth line shows "Birth unknown"; lifespan shows "?"                              |
| No death event, person not living                 | Death line shows "Death unknown"                                                  |
| No death event, person living                     | Death line shows "Living" or is not shown                                         |
| Age calculation with approximate dates            | Show "~75 years" (prefixed with tilde)                                            |
| No family at all (no parents, no spouse)          | Aside shows "Unknown parents" + "No family" with add buttons                      |
| Person has parents but no spouse                  | Families section shows empty state + add button                                   |
| Person is child in one family, spouse in multiple | All displayed: one origin family + N formed families                              |
| Family without marriage event                     | Family entry shows "Family with {Spouse name}" without date                       |
| Family without spouse (single parent)             | Entry shows "Family -- Children alone"                                            |
| Family without children                           | Shows couple info + "No children" + add child link                                |
| Person is living                                  | Limit displayed information (configurable privacy)                                |
| Gender unknown                                    | Neutral icon, gray color                                                          |
| Very long name                                    | Truncate in header and sidebar; full display in names section of Edit form window |
| Person referenced in 50+ events                   | Events section paginated or virtualized                                           |
| Delete person who is linked to families           | Confirmation warns about cascade effect on linked families                        |

---

## Actions

### Edit Person

1. User clicks "Edit" in the center header or selects "Edit person" from the context menu
2. Edit Person form window opens with current values pre-filled
3. User can change gender, living status, names, and notes
4. On submit: update the individual record in the database
5. Center and aside panels refresh with updated data

### Add a Name

1. User opens the Edit Person form window
2. User clicks "Add name" within the names management section
3. User fills in name fields: prefix, given names, surname, suffix, nickname, type
4. User optionally marks the name as primary (only one name can be primary at a time)
5. On submit: the new name is saved and appears in the alternative names list

### Edit a Name

1. User clicks the edit icon next to an alternative name in the center panel, or opens the Edit Person form window
2. User modifies the desired name fields
3. On submit: the name record is updated

### Remove a Name

1. User opens the Edit Person form window
2. User clicks the delete action on a name entry
3. If the name is the only name: show a warning that the person will have no name
4. On confirm: the name record is removed

### Add an Event

1. User clicks "Add" in the Events section of the aside panel or selects "Add event" from the context menu
2. Add Event form window opens
3. User selects an event type, enters date, place, and description
4. On submit: the event is created and linked to this individual
5. Events section in the aside refreshes

### Edit an Event

1. User clicks the chevron on an event in the aside to navigate to the Events module
2. User edits the event in the Events module

### Delete an Event

1. User navigates to the event in the Events module
2. User deletes the event from there
3. The event is removed from this individual's Events section

### Add Parents

1. User clicks an "Add parents" button (when no parents exist).
2. A form window opens. The user can either **link to an existing family** (whose husband/wife become the parents) or **create a new family**. In both cases, for the **father** and for the **mother**, the user can **search for and select an existing person** (autocomplete) or **create a new person** (inline minimal form), following the same pattern as adding spouses in the Family view.
3. When a family already exists (current person already has parents), adding or changing parents is done via the same rule: for each parent role, the user can select an existing person or create a new one.
4. On submit: the family relationship is updated.

### Add Brother / Add Sister

1. User clicks "Add Brother" or "Add Sister" in the Parents section of the aside (when the current person already has parents).
2. A form window opens that offers **search for an existing person** (autocomplete) or **create a new person** (inline minimal form: given names, surname, gender).
3. The selected or created person is linked to the same family as the current person (added as a child of that family, i.e. as a sibling). When the user chooses to create a new person, the UI may pre-fill or suggest gender (Male for "Add Brother", Female for "Add Sister").
4. On submit: the family relationship is updated; the new sibling appears in the Parents section.

### Add Spouse

1. User selects "Add to family" from the context menu or clicks the add button in the Families section.
2. A form window opens. The user can **select an existing person** (search/autocomplete) or **create a new person** (inline minimal form).
3. A new family record is created linking the current person and the selected or created spouse.
4. On submit: the family appears in the Families section of the aside

### Add Child

1. User navigates to a family in the Families module (via the family chevron in the aside)
2. User adds a child to the family from the family detail view

### Delete Person

1. User selects "Delete person" from the context menu
2. Delete confirmation (in-window dialog) opens, displaying the person's name
3. If the person is linked to families: the confirmation warns about cascade effects (the person will be removed from those families)
4. On confirm: the individual record and all associated names and event links are deleted
5. The sidebar list updates; center and aside return to empty state or select the next individual

### Navigate to Related People

1. User clicks a linked person (father, mother, sibling, spouse, child) in the center or aside panel
2. The clicked individual is selected in the sidebar
3. Center and aside panels update to show the clicked individual's detail

---

## Navigation Map

| Clickable element                   | Destination                                                                                                               | Condition             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Individual in sidebar list          | Selects individual, updates center + aside                                                                                | --                    |
| "New" in sidebar                    | Opens Create Person form window                                                                                           | --                    |
| "Edit" in center header             | Opens Edit Person form window                                                                                             | --                    |
| Dropdown chevron in center header   | Opens context menu                                                                                                        | --                    |
| Alternative names edit icon         | Opens Edit Person form window (names section)                                                                             | --                    |
| Birth place link (center)           | Navigates to Places module, selects that place                                                                            | Place exists          |
| Death place link (center)           | Navigates to Places module, selects that place                                                                            | Place exists          |
| Father link (center)                | Selects father in sidebar (stays in Individuals module)                                                                   | Father exists         |
| Mother link (center)                | Selects mother in sidebar (stays in Individuals module)                                                                   | Mother exists         |
| Sibling link (center)               | Selects sibling in sidebar                                                                                                | Sibling exists        |
| Half-sibling link (center)          | Selects half-sibling in sidebar                                                                                           | Half-sibling exists   |
| Parent card chevron (aside)         | Selects that parent in sidebar                                                                                            | --                    |
| "Add Brother" button (aside)        | Opens form window to select existing person or create new (pre-linked to same family as sibling; gender suggested Male)   | Parents exist         |
| "Add Sister" button (aside)         | Opens form window to select existing person or create new (pre-linked to same family as sibling; gender suggested Female) | Parents exist         |
| Family chevron (aside)              | Navigates to Families module, selects that family                                                                         | --                    |
| Spouse name in family entry (aside) | Selects spouse in sidebar (stays in Individuals module)                                                                   | Spouse exists         |
| Event chevron (aside)               | Navigates to Events module, selects that event                                                                            | --                    |
| "Add" in Events section (aside)     | Opens Add Event form window                                                                                               | --                    |
| "Show all" in aside section         | Expands to full list or navigates to filtered view                                                                        | More items than shown |
| Context menu > Edit person          | Opens Edit Person form window                                                                                             | --                    |
| Context menu > Add event            | Opens Add Event form window                                                                                               | --                    |
| Context menu > Add to family        | Opens family linking form window                                                                                          | --                    |
| Context menu > Delete person        | Opens Delete confirmation (in-window)                                                                                     | --                    |
