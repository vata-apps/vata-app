# Sources Screen

**MVP4**: Source management, source ↔ entity associations.

## Objective

Manage documentary sources and citations: list and search sources, create/edit sources, view linked citations, and manage archive repositories. This module uses the three-panel module layout (sidebar / center / aside).

---

## What We Display

### Sidebar (entity list, left panel)

- **"New" button** at the top to create a new source.
- **Search field** to filter sources by title or author.
- **Scrollable list of all sources.** Each item shows:
  - Title
  - Author (if present)
  - Citation count
- The **selected source** is highlighted.
- Clicking a source loads its detail in the center and aside panels.

| Edge case              | Expected behavior                                                                |
| ---------------------- | -------------------------------------------------------------------------------- |
| Source list is empty   | Show empty state with "Add your first source" message and prominent "New" button |
| Hundreds of sources    | Virtualized scrolling; use search to filter                                      |
| Very long source title | Truncate with ellipsis in list; full title in detail                             |
| Search with no results | Show "No sources found" message                                                  |

### Center Panel (source detail)

- **Header:** source title, "Edit" button, dropdown menu (chevron) for more actions.
- **Key-value detail rows:**
  - ID (with copy button)
  - Author
  - Publisher
  - Publication date
  - Call number
  - URL (clickable, opens external link in browser)
  - Repository (clickable, opens repository detail window)
  - Notes

| Edge case                      | Expected behavior                                     |
| ------------------------------ | ----------------------------------------------------- |
| Source with no repository      | Repository field shows "None"                         |
| URL field contains a valid URL | Render as a clickable external link                   |
| URL field is empty or invalid  | Show "None" or hide the row                           |
| Very long source title         | Full title displayed in header (wraps if needed)      |
| All optional fields are empty  | Only show title and ID; other rows hidden or show "—" |

### Aside Panel (supplementary details, right)

#### Citations Section (collapsible, with count badge)

List of citation cards. Each card shows:

- Page reference (e.g., "p. 45", "Folio 23, recto")
- Quality badge (see Quality Badge below)
- Linked entities (entity type icon + name + field cited)
- Date accessed
- Chevron to expand or navigate
- **"Add" button** at the bottom to create a new citation
- **"Show all" link** when the list is truncated (e.g., showing 5 of 20 citations)

| Edge case                            | Expected behavior                                |
| ------------------------------------ | ------------------------------------------------ |
| Source with no citations             | Show "No citations" message + "Add" button       |
| Citation with no linked entities     | Show warning "Citation not linked to any record" |
| Citation with no quality rating      | Show "Unrated" badge (gray)                      |
| Citation linked to multiple entities | Show all linked entities in the citation card    |
| Very long text excerpt in citation   | Truncate in card with expand option              |
| Many citations (50+)                 | Show first N items + "Show all" link             |

#### Repository Section (collapsible)

- Repository name
- City
- Country
- Chevron to open repository management form window

| Edge case                                    | Expected behavior             |
| -------------------------------------------- | ----------------------------- |
| Source with no repository                    | Section shows "No repository" |
| Repository with all fields empty except name | Only show name                |

### Quality Badge

Visual indicator of citation quality:

| Quality level  | Appearance       |
| -------------- | ---------------- |
| Primary        | Green / 4 stars  |
| Secondary      | Blue / 3 stars   |
| Questionable   | Orange / 2 stars |
| Unreliable     | Red / 1 star     |
| Unrated (null) | Gray / no stars  |

### New Source Form Window

- Title (required)
- Author
- Publisher
- Publication date
- Call number
- URL
- Repository (search/select existing or create new)
- Notes
- **Footer:** Cancel and Create buttons

| Edge case        | Expected behavior                                        |
| ---------------- | -------------------------------------------------------- |
| Title left empty | Validation error; Create button disabled or inline error |
| Duplicate title  | Allowed (sources may share a title)                      |

### New Citation Form Window

- Source (pre-selected if opened from a source's detail)
- Page reference (free text: "p. 45", "Folio 23, recto")
- Quality select (Primary / Secondary / Questionable / Unreliable)
- Date accessed
- Text excerpt (transcription)
- Link to entity: entity type select + entity search + optional field name
- Notes
- **Footer:** Cancel and Create buttons

| Edge case                | Expected behavior                                    |
| ------------------------ | ---------------------------------------------------- |
| No entity linked         | Allowed, but show advisory that citation is unlinked |
| Multiple entities linked | All links saved and displayed                        |

### Repository Management Form Window

- List of repositories, each showing: name, city, country, source count
- Create / edit / delete repository
- Repository detail fields: name, address, city, country, phone, email, website

| Edge case                                    | Expected behavior                                         |
| -------------------------------------------- | --------------------------------------------------------- |
| Repository with no sources                   | Deletable; shows "0 sources"                              |
| Repository with all fields empty except name | Only show name                                            |
| Delete repository that has linked sources    | Confirmation warns sources will be unlinked (not deleted) |

---

## Actions

### Create Source

- **Trigger:** Click "New" button in sidebar.
- **Preconditions:** None.
- **Behavior:** Opens the New Source form window. User fills in fields (title is required). On "Create", the source is inserted into the database and appears in the sidebar list. The new source is auto-selected.
- **Validation:** Title is required; all other fields are optional.

### Edit Source

- **Trigger:** Click "Edit" button in center header, or context menu > Edit.
- **Preconditions:** A source is selected.
- **Behavior:** Opens the Edit Source form window pre-filled with current values. On save, the source is updated in the database and the detail view refreshes.
- **Validation:** Title remains required.

### Delete Source

- **Trigger:** Context menu > Delete.
- **Preconditions:** A source is selected.
- **Behavior:** Opens a delete confirmation (in-window dialog) warning that all citations linked to this source will also be deleted (CASCADE). On confirm, the source and its citations are removed. The sidebar deselects and center returns to empty state or selects the next source.

### Create Citation

- **Trigger:** Click "Add" in the Citations section of the aside panel.
- **Preconditions:** A source is selected (source is pre-filled in the form window).
- **Behavior:** Opens the New Citation form window. User fills in page reference, quality, linked entities, etc. On "Create", the citation is inserted and appears in the citations list.
- **Validation:** At minimum the source must be set. All other fields optional but an advisory is shown if no entity is linked.

### Edit Citation

- **Trigger:** Click chevron on a citation card, then edit action.
- **Preconditions:** Citation exists.
- **Behavior:** Opens the Edit Citation form window pre-filled with current values. On save, the citation is updated and the aside refreshes.

### Delete Citation

- **Trigger:** Delete action on a citation card.
- **Preconditions:** Citation exists.
- **Behavior:** Opens a delete confirmation (in-window dialog). On confirm, the citation is removed. The source remains.

| Edge case                            | Expected behavior                                 |
| ------------------------------------ | ------------------------------------------------- |
| Delete the last citation of a source | Allowed; source remains with "No citations" state |

### Create Repository

- **Trigger:** "Create new" option in repository search/select (New Source form window) or from the Repository management form window.
- **Preconditions:** None.
- **Behavior:** Opens a repository creation form. On save, the repository is created and can be linked to sources.
- **Validation:** Name is required.

### Edit Repository

- **Trigger:** Edit action in Repository management form window.
- **Preconditions:** Repository exists.
- **Behavior:** Opens the repository edit form pre-filled. On save, updates the repository.

### Delete Repository

- **Trigger:** Delete action in Repository management form window.
- **Preconditions:** Repository exists.
- **Behavior:** If the repository has linked sources, a confirmation warns that sources will be unlinked (not deleted). On confirm, the repository is removed and any linked sources have their repository reference cleared.

### Search / Filter Sources

- **Trigger:** Type in the sidebar search field.
- **Preconditions:** None.
- **Behavior:** The source list filters in real-time by title and author. Matching results are shown; non-matching items are hidden.

### Filter by Repository

- **Trigger:** Optional filter control in sidebar (if implemented).
- **Preconditions:** At least one repository exists.
- **Behavior:** Narrows the source list to sources linked to the selected repository.

---

## Navigation Map

| Clickable element                       | Destination                                                                       | Condition                     |
| --------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------- |
| Source in sidebar list                  | Selects source, updates center + aside                                            | --                            |
| "New" in sidebar                        | Opens New Source form window                                                      | --                            |
| "Edit" in center header                 | Opens Edit Source form window                                                     | --                            |
| Dropdown (chevron) in center header     | Opens context menu                                                                | --                            |
| URL link (center)                       | Opens external URL in browser                                                     | URL is valid                  |
| Repository link (center)                | Opens Repository detail window                                                    | --                            |
| Citation linked entity (aside)          | Navigates to appropriate module (Individuals / Families / Events), selects entity | Entity type determines module |
| Citation chevron (aside)                | Opens citation detail or edit                                                     | --                            |
| "Add" in Citations section (aside)      | Opens New Citation form window                                                    | --                            |
| "Show all" in Citations section (aside) | Expands full citation list                                                        | More citations than shown     |
| Repository chevron (aside)              | Opens Repository management form window                                           | --                            |
| Context menu > Edit                     | Opens Edit Source form window                                                     | --                            |
| Context menu > Delete                   | Opens delete confirmation (in-window dialog)                                      | --                            |
