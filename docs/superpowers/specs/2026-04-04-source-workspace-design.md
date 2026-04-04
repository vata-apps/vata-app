# MVP4 Phase 3: Source Workspace — Design Spec

## Overview

The source workspace is a side-by-side editing environment where users view a source document (scanned image or citation list) on the left and extract genealogical data into structured records on the right. Event-type templates guide data entry with predefined slots, and all created entities are automatically cited back to the source.

This is the app's core differentiator: sources drive data entry, citations are automatic.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Entry point | "Edit" button on source detail page | Workspace is a separate route; detail page stays read-only |
| Left panel (no files) | Citations summary (full height) | A source isn't necessarily a file |
| Left panel (with files) | Citations summary (top) + image viewer (below) | Both always visible, scrollable |
| Inline creation depth | Name + gender only | "More..." modal with event creation + dedup deferred post-Phase 3 |
| File attachment | From within workspace only | Detail page attachment deferred |
| Architecture | Thin manager + templates as data | Templates are pure data objects; manager reads and executes them |
| Slot search/create | Autocomplete with "Create new" at bottom | Fast path for data entry; deliberate action to create |
| Templates shipped | Marriage, Baptism, Birth, Death, Burial, Census, Generic | Covers most civil/church records + free-form fallback |

## Deferred

- **Inline "More..." modal**: expanded fields (birth date, place, occupation) on inline creation, with automatic event creation and duplicate event detection. Designed as a post-Phase 3 enhancement. The `PersonSlot` component should accept an optional `onExpandDetail` callback for future plug-in.
- **File attachment from detail page**: currently only from workspace.
- **Directory picker for tree creation**: trees still use app data dir.

## Routing

**New route:** `/tree/$treeId/source/$sourceId/edit`

- Existing `SourceViewPage` at `/tree/$treeId/source/$sourceId` remains the read-only detail page.
- "Edit" button navigates to `/edit`, rendering `SourceWorkspacePage`.
- Route file: `src/routes/tree/$treeId/source/$sourceId/edit.tsx`

## Component Structure

```
SourceWorkspacePage
├── WorkspaceHeader           source title, back button, metadata summary
├── WorkspaceLayout           split panel container
│   ├── LeftPanel
│   │   ├── CitationsSummary  list of existing citations for this source
│   │   └── ImageViewer       zoom, pan, multi-file navigation
│   │       └── FileUploadPrompt  "Attach files" when no files exist
│   └── RightPanel
│       ├── EventTypeSelector dropdown: Marriage, Baptism, Death, etc.
│       ├── TemplateSlots     dynamic slots from selected template
│       │   └── PersonSlot    autocomplete search + "Create new"
│       ├── EventDetails      date + place fields
│       ├── CreateEventButton dynamic label + creation summary
│       └── FreeFormAdd       "+ Add person" (role picker + PersonSlot)
```

## Template Data Model

Templates are plain TypeScript objects — no classes, no inheritance.

```typescript
interface TemplateSlot {
  key: string;              // unique within template, e.g. "husband"
  label: string;            // displayed to user, e.g. "Husband"
  participantRole?: ParticipantRole; // if set, added as event participant; if undefined, family-only
  gender?: 'M' | 'F';      // pre-filled when creating new individual
  required: boolean;        // visual hint only (not enforced)
  multiple: boolean;        // true for witnesses, census members
}

interface FamilyRule {
  type: 'couple' | 'parent-child';
  members: { slot: string; role: 'husband' | 'wife' | 'child' }[];
}

interface TemplateDefinition {
  id: string;               // "marriage", "baptism", etc.
  label: string;            // "Marriage"
  eventTypeTag: string;     // GEDCOM tag: "MARR", "BAPM", etc.
  slots: TemplateSlot[];
  families: FamilyRule[];   // which slots form families
  hasDate: boolean;
  hasPlace: boolean;
}
```

### Template Definitions

**Marriage** (`MARR`):
- Slots: Husband (principal, M, required), Wife (principal, F, required), Husband's Father (family-only, M), Husband's Mother (family-only, F), Wife's Father (family-only, M), Wife's Mother (family-only, F), Witnesses (witness, multiple)
- Families: couple (husband + wife), parent-child (husband's parents + husband), parent-child (wife's parents + wife)

**Baptism** (`BAPM`):
- Slots: Child (principal, required), Father (family-only, M), Mother (family-only, F), Godfather (godparent, M), Godmother (godparent, F)
- Families: parent-child (father + mother + child)

**Birth** (`BIRT`):
- Slots: Child (principal, required), Father (family-only, M), Mother (family-only, F)
- Families: parent-child (father + mother + child)

**Death** (`DEAT`):
- Slots: Deceased (principal, required), Informant (informant)
- Families: none

**Burial** (`BURI`):
- Slots: Deceased (principal, required)
- Families: none

**Census** (`CENS`):
- Slots: Head of Household (principal, required), Members (other, multiple)
- Families: none (census relationships are complex; family linking deferred)

Slots marked "family-only" have no `participantRole` — they are not added as event participants, only used in family creation (step 6).

**Generic** (no tag):
- Slots: none (free-form only)
- Families: none
- `eventTypeTag`: empty string — user picks event type from a secondary dropdown, or skips event creation entirely
- When no event type is selected, the manager skips event creation (steps 3-5) and creates citations linked only to the individuals/families

## SourceWorkspaceManager

Static class at `src/managers/SourceWorkspaceManager.ts`. Single public method.

### Input

```typescript
interface SlotValue {
  slotKey: string;
  existingId?: string;        // existing individual ID (e.g. "I-0001")
  newName?: string;           // name for new individual
  newGender?: 'M' | 'F' | 'U';
}

interface CreateFromTemplateInput {
  sourceId: string;
  templateId: string;
  slots: SlotValue[];
  eventTypeTag?: string;      // override for Generic template (user-chosen event type)
  date?: string;
  place?: string;             // new place name
  existingPlaceId?: string;   // existing place ID
  citationPage?: string;      // optional page/detail
}
```

### Output

```typescript
interface CreateFromTemplateResult {
  eventId?: string;           // undefined when Generic with no event type
  createdIndividuals: { slotKey: string; id: string }[];
  createdFamilies: string[];
  citationId: string;
  citationLinkIds: string[];
}
```

### Execution Order

1. **Resolve individuals** — for each slot: use `existingId` or call `createIndividual()` + `createName()`
2. **Resolve place** — use `existingPlaceId` or call `createPlace()`
3. **Determine event type** — use `input.eventTypeTag` override (for Generic), else template's `eventTypeTag`. If empty/null, skip steps 4-5.
4. **Create event** — `createEvent()` with date + place (skipped if no event type)
5. **Add event participants** — `addEventParticipant()` for each filled slot that has a `participantRole` (skipped if no event; family-only slots are excluded)
6. **Create families** — iterate `template.families`, skip if required members missing, create family + add members
7. **Create citation** — `createCitation({ sourceId, page })`
8. **Create citation links** — one for the event (if created), one for each individual, one for each family
9. **Return result**

No transaction wrapper for MVP — SQLite via Tauri plugin doesn't expose transactions easily. Partial failure produces orphaned records (e.g., individuals with no event link); this is accepted for MVP and the user can clean up manually. Proper rollback is a future concern.

## Left Panel

### Citations Summary

- Lists what this source has already cited
- Each entry: event type + date, linked individuals
- Entries are clickable (navigate to event/individual detail)
- Data: new hook `useCitationsWithDetailsBySource(sourceId)` — fetches citations + citation links + entity names via a joined query
- Empty state: "No citations yet — use the panel on the right to start extracting data from this source."

### Image Viewer

- **Toolbar**: zoom in/out buttons, fit-to-width, zoom percentage display, file counter with prev/next arrows, "Attach files" button
- **Display**: CSS `transform: scale() translate()` for zoom + pan via mouse drag and scroll wheel
- **No third-party library** — CSS transforms + pointer events are sufficient for MVP
- **File resolution**: `useFilesBySource` hook provides `relativePath`; combine with tree folder path for absolute path
- **Tauri asset protocol**: use `convertFileSrc()` from `@tauri-apps/api/core` to convert absolute paths to asset URLs for `<img>` tags

### File Attachment

- "Attach files" button in toolbar (or prominent in empty state)
- Triggers `open({ multiple: true, filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'tiff', 'tif', 'pdf'] }] })`
- For each selected file: `copyFileToTree()` → `createFile()` → `addFileToSource()`
- Invalidate `queryKeys.files(sourceId)` → image viewer updates

## Right Panel

### EventTypeSelector

- Dropdown defaulting to "Select document type..."
- Options: Marriage, Baptism, Birth, Death, Burial, Census, Generic
- Changing template clears filled slots (confirmation prompt if any slots are filled)

### PersonSlot

- Autocomplete input with 300ms debounce
- Searches via `searchIndividuals(query)` (existing DB function)
- Results display: name, gender, ID
- Last dropdown item: **"Create [typed text]"** — switches slot to "create new" mode
- "Create new" mode: shows typed name + gender selector (pre-filled from slot definition)
- Filled state: individual name + status ("existing" / "will be created") + X button to clear
- For `multiple: true` slots: filled entries stack, new empty input appears below

### EventDetails

- **Date**: free-form text input (genealogical dates are complex: "ABT 1892", "BET 1890 AND 1895")
- **Place**: autocomplete searching existing places via `searchPlaces()`, with "Create [typed name]" option

### CreateEventButton

- Disabled until at least one required slot is filled
- Dynamic label: "Create Marriage Event", "Create Baptism Event", etc.
- Below button: summary text ("Will create: 1 event, 2 individuals, 1 family, 6 citation links")
- On click: calls `SourceWorkspaceManager.createFromTemplate()`
- On success: clears template, invalidates queries (left panel refreshes), brief success message
- On error: shows error, slots stay filled for retry

### FreeFormAdd

- "+" Add person" link, always available regardless of template
- Opens a `PersonSlot` with a role dropdown (principal, witness, informant, etc.)
- Added people are included in the `CreateFromTemplate` call

## New Files

| File | Purpose |
|------|---------|
| `src/routes/tree/$treeId/source/$sourceId/edit.tsx` | Route file for workspace |
| `src/pages/SourceWorkspacePage.tsx` | Main workspace page component |
| `src/components/workspace/WorkspaceHeader.tsx` | Header bar |
| `src/components/workspace/WorkspaceLayout.tsx` | Split panel container |
| `src/components/workspace/LeftPanel.tsx` | Citations summary + image viewer |
| `src/components/workspace/CitationsSummary.tsx` | Citations list |
| `src/components/workspace/ImageViewer.tsx` | Zoom/pan image display |
| `src/components/workspace/RightPanel.tsx` | Template interaction panel |
| `src/components/workspace/EventTypeSelector.tsx` | Template dropdown |
| `src/components/workspace/TemplateSlots.tsx` | Dynamic slot renderer |
| `src/components/workspace/PersonSlot.tsx` | Autocomplete search/create |
| `src/components/workspace/EventDetails.tsx` | Date + place inputs |
| `src/components/workspace/CreateEventButton.tsx` | Action button + summary |
| `src/components/workspace/FreeFormAdd.tsx` | Free-form person addition |
| `src/lib/templates.ts` | Template definitions (data) |
| `src/managers/SourceWorkspaceManager.ts` | Template execution logic |
| `src/hooks/useCitationsWithDetails.ts` | Hook for citations summary |

## Testing Strategy

- **SourceWorkspaceManager**: unit tests with in-memory SQLite — test each template produces the correct set of DB records
- **Template definitions**: snapshot tests — each template's slot/family structure
- **PersonSlot**: unit test autocomplete behavior (search, create new, clear)
- **ImageViewer**: minimal testing — visual component, hard to unit test zoom/pan
- **Integration**: test the full flow from filled template → DB records → citations summary update
