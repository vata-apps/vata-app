# Sources & Media Screen

## Objective

Source-centric data entry: the source document (with its scanned image or photo) is the starting point for creating and linking genealogical entities. Instead of creating entities first and attaching sources later, the user works from the source outward — viewing the document and creating/linking individuals, events, places, and families from one workspace.

This module has two main views: a **source list** for browsing and a **source workspace** for data entry.

---

## Source List View

Browse and manage all sources in the tree.

### Layout

- **"New Source" button** at the top.
- **Search field** to filter sources by title or author.
- **Scrollable list of sources.** Each item shows:
  - Title
  - Author (if present)
  - Citation count
  - Thumbnail of the first attached media file (if any)
- Clicking a source navigates to its **source workspace**.

| Edge case              | Expected behavior                                                                |
| ---------------------- | -------------------------------------------------------------------------------- |
| Source list is empty    | Show empty state with "Add your first source" message and prominent "New" button |
| Hundreds of sources    | Virtualized scrolling; use search to filter                                      |
| Very long source title | Truncate with ellipsis in list; full title in workspace                           |
| Search with no results | Show "No sources found" message                                                  |

---

## Source Creation Flow

### Step 1: New Source Form

- **Trigger:** Click "New Source" button from source list.
- **Fields:**
  - Title (required)
  - Author
  - Publisher
  - Publication date
  - Call number
  - URL
  - Repository (search/select existing or create new)
  - Notes
  - **File attachment:** file picker to attach one or more images/documents
- **Footer:** Cancel and Create buttons.
- **On Create:** Source is created, files are copied/moved to the tree's `media/` directory, and the **source workspace** opens.

| Edge case                | Expected behavior                                        |
| ------------------------ | -------------------------------------------------------- |
| Title left empty         | Validation error; Create button disabled or inline error |
| Duplicate title          | Allowed (sources may share a title)                      |
| No file attached         | Allowed; workspace opens with empty image viewer         |
| Multiple files selected  | All files attached; first file shown in viewer           |

---

## Source Workspace

The core UX innovation. A side-by-side layout for working from a source document.

### Layout

```
┌─────────────────────────────┬──────────────────────────────┐
│                             │  Source: "Acte de mariage"   │
│                             │  Repository: BAnQ            │
│                             │  [Edit] [Delete]             │
│     Image Viewer            │──────────────────────────────│
│     (zoomable, pannable)    │  Event type: [Marriage ▾]    │
│                             │────��─────────────────────────│
│                             │  ☑ Husband: Jean Tremblay    │
│     ┌─────────────────��    │  ☑ Wife: Marie Bouchard      │
│     │  scanned image   │    │  ☐ Father (husband): [____]  │
│     │                  │    │  ☐ Mother (husband): [____]  │
│     │                  │    │  ☐ Father (wife): [____]     │
│     └─────────────────┘    │  ��� Mother (wife): [____]     │
│                             │  + Add witness               │
│                             │  + Add person                │
│  [◀ prev] [1/3] [next ▶]  │─────��────────────────────────│
│                             │  Suggest: Create marriage    │
│                             │  event? [Date] [Place]       ��
│                             │  [Create event] [Dismiss]    │
└────���────────────────────────┴──────────────────────────────┘
```

### Left Panel: Image Viewer

- Displays the media file(s) attached to the source.
- **Zoom**: scroll wheel or pinch.
- **Pan**: click and drag.
- **Multi-file navigation**: prev/next buttons and page indicator (e.g., "2/5") when multiple files are attached.
- **Empty state**: "No media attached. [Attach file]" prompt.
- **Add more files**: button to attach additional files to this source.

| Edge case            | Expected behavior                                       |
| -------------------- | ------------------------------------------------------- |
| No media attached    | Show empty state with "Attach file" button              |
| Very large image     | Fit-to-width by default; user can zoom in               |
| Non-image file (PDF) | Show PDF viewer or generic file icon with filename      |
| Multiple files       | Show navigation controls (prev/next + page indicator)   |

### Right Panel: Linking Panel

Top-to-bottom structure:

#### 1. Source Metadata Summary

- Source title, repository name, key details.
- "Edit" button to modify source metadata.
- "Delete" button with confirmation.

#### 2. Event Type Selector

- Dropdown to select the type of event this source documents (Marriage, Baptism, Census, Birth, Death, Burial, etc.)
- Selecting an event type loads the corresponding **template** in the slots area below.
- Can be left empty for sources that don't correspond to a single event.

#### 3. Template Slots

Named slots that appear based on the selected event type. Each slot is a field where the user can:
- **Search** for an existing entity by typing a name.
- **Create inline** if the entity doesn't exist yet.
- **Clear** to remove a linked entity.

**Templates by event type:**

| Event Type      | Slots                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Marriage (MARR) | Husband, Wife, Father of husband, Mother of husband, Father of wife, Mother of wife, + Witnesses, Officiant, Place |
| Baptism (CHR)   | Child, Father, Mother, Godfather, Godmother, Officiant, Place                                      |
| Birth (BIRT)    | Child, Father, Mother, Place                                                                       |
| Death (DEAT)    | Deceased, Informant, Place                                                                         |
| Burial (BURI)   | Deceased, Informant, Place                                                                         |
| Census (CENS)   | Head of household, + Household members, Place                                                      |
| Other/None      | No template — free-form only                                                                       |

**Slot behavior:**

- Slots prefixed with `+` are repeatable (e.g., "+ Witnesses" can add multiple witnesses).
- **Filled slots** show a checkmark, the entity name, and a clear button.
- **Empty slots** show an input field with search-as-you-type.
- **Place slots** search the places table instead of individuals.

#### 4. Free-Form Entity Addition

- **"+ Add person"** button below the template to add arbitrary entities not covered by the template (e.g., a neighbor mentioned in a census, a curé who is also a family member).
- Opens a search/create field with a role selector.

#### 5. Event Suggestion

When the user selects an event type and fills at least the principal slots:
- The app suggests: **"Create a [Marriage] event?"** with optional date and place fields.
- **[Create event]** — creates the event, links it to the source via citation, and links the principal individuals as event participants.
- **[Dismiss]** — no event created; entities are still linked to the source via citations.

This is a suggestion, not forced. The user may already have the event in their tree.

| Edge case                                | Expected behavior                                              |
| ---------------------------------------- | -------------------------------------------------------------- |
| Event already exists for these people    | User dismisses suggestion and manually links existing event    |
| User hasn't filled principal slots       | Suggestion doesn't appear until principals are filled          |
| User changes event type after filling    | Clear slots and load new template; confirm if entities linked  |

### Inline Entity Creation

When a slot search returns no results, the user can create a new entity without leaving the workspace.

**Adaptive detail based on role:**

| Role type                              | Fields shown                                     |
| -------------------------------------- | ------------------------------------------------ |
| Principal (husband, wife, child, etc.) | Given names, Surname, Gender (inferred), Birth date (optional), Death date (optional) |
| Peripheral (parents, witnesses, etc.)  | Given names, Surname, Gender (inferred from slot) |
| Place                                  | Place name, Place type (optional)                |

- Gender is **inferred from the slot** (e.g., "Husband" → M, "Wife" → F, "Witness" → U) and pre-filled but editable.
- New entities are created immediately in the database when confirmed.
- A citation link is automatically created between the source and the new entity.

### Auto-Citation

When the user links an entity in the workspace (by filling a slot or adding free-form):
1. A `source_citation` is created for this source (one per source, reused for all links from this workspace session).
2. A `citation_link` is created connecting the citation to the entity.

This happens automatically — the user doesn't need to manually create citations.

---

## Source Edit

- **Trigger:** Click "Edit" in the workspace source metadata summary.
- **Behavior:** Opens the source form pre-filled with current values. Same fields as creation. On save, metadata updates; files can be added or removed.

---

## Source Delete

- **Trigger:** Click "Delete" in the workspace or from the source list.
- **Behavior:** Confirmation dialog warning that all citations linked to this source will be deleted (CASCADE). Media files in `media/` are also deleted from disk. On confirm, source is removed and user returns to the source list.

---

## Repository Management

Accessible from the source creation/edit form (repository search/select field).

- List of repositories, each showing: name, city, country, source count.
- Create / edit / delete repository.
- Repository detail fields: name, address, city, country, phone, email, website.

| Edge case                                 | Expected behavior                                         |
| ----------------------------------------- | --------------------------------------------------------- |
| Repository with no sources                | Deletable; shows "0 sources"                              |
| Delete repository with linked sources     | Confirmation warns sources will be unlinked (not deleted) |
| Repository with all fields empty but name | Only show name                                            |

---

## Entity Timeline Integration

When viewing an individual's profile, events appear in chronological order with source media:

```
Pierre Tremblay (I-0001)
════════════════════════

📅 Birth — 12 Mar 1870, Quebec
   [thumbnail: baptism-register.jpg]  "Registre paroissial Notre-Dame"

📅 Marriage — 8 Jun 1895, Montreal
   [thumbnail: mariage-cert.jpg]  "Acte de mariage #234"

📅 Census — 1901, Montreal
   [thumbnail: census-1901-p3.jpg]  "Recensement 1901, district 5"

📅 Death — 3 Nov 1942, Montreal
   (no source — Add source)
```

- **Thumbnails** are generated from the first file attached to each source.
- **Clicking a thumbnail** navigates to the source workspace.
- **Unsourced events** show a subtle "Add source" link.
- **Multiple sources per event**: show multiple thumbnails.

| Edge case                           | Expected behavior                                   |
| ----------------------------------- | --------------------------------------------------- |
| Event with no source                | Show event without thumbnail; "Add source" link     |
| Event with multiple sources         | Show thumbnail for each source                      |
| Source with no media                | Show source title without thumbnail                 |
| Individual with no events           | Show empty timeline with "No events recorded"       |

---

## Quality Badge

Visual indicator of citation quality (used where citations are displayed):

| Quality level  | Appearance       |
| -------------- | ---------------- |
| Primary        | Green / 4 stars  |
| Secondary      | Blue / 3 stars   |
| Questionable   | Orange / 2 stars |
| Unreliable     | Red / 1 star     |
| Unrated (null) | Gray / no stars  |

---

## Navigation Map

| Clickable element                   | Destination                                              |
| ----------------------------------- | -------------------------------------------------------- |
| Source in source list               | Opens source workspace                                   |
| "New Source" button                 | Opens new source form                                    |
| "Edit" in workspace                 | Opens edit source form                                   |
| "Delete" in workspace               | Opens delete confirmation                                |
| Image thumbnail (viewer)            | Zoom/pan interaction                                     |
| Prev/next in image viewer           | Navigate between attached files                          |
| "Attach file" in empty viewer       | Opens file picker                                        |
| Entity name in filled slot          | Navigates to entity detail (Individual, Place, etc.)     |
| Clear button on filled slot         | Removes entity link from slot                            |
| "+ Add witness" / "+ Add person"    | Opens new search/create slot                             |
| "[Create event]" suggestion         | Creates event and links to source                        |
| Thumbnail in entity timeline        | Navigates to source workspace                            |
| "Add source" on unsourced event     | Opens source creation or selection                       |
| Repository link                     | Opens repository management                              |
