# Database Layer API

See [Database Schema](../architecture/database-schema.md) for the MVP mapping of tables (MVP1: system, MVP3: entities, MVP4: sources, MVP5: files).

### Entity IDs

Primary entity IDs (individuals, families, events, places, sources, repositories) are exposed in the API as **prefixed strings** (e.g. `I-0001`, `F-0001`). The database stores `INTEGER` keys; conversion is done at the DB boundary using `src/lib/entityId.ts`:

- **DB → API**: use `formatEntityId(prefix, raw.id)` when mapping rows to entities.
- **API → DB**: use `parseEntityId(id)` when passing an id from the API into SQL (e.g. in `WHERE id = $1`).

See [Database Schema - Conventions / IDs](../architecture/database-schema.md#ids) for the prefix table and rationale.

## Connection Management

### getSystemDb

```typescript
/**
 * Get the system database connection
 * Creates and initializes it if it doesn't exist
 */
async function getSystemDb(): Promise<Database>;
```

### openTreeDb

```typescript
/**
 * Open a tree database by filename
 * Closes any previously open tree database
 * @param filename - The database filename (without path)
 */
async function openTreeDb(filename: string): Promise<Database>;
```

### getTreeDb

```typescript
/**
 * Get the currently open tree database
 * @throws Error if no tree database is open
 */
async function getTreeDb(): Promise<Database>;
```

### closeTreeDb

```typescript
/**
 * Close the currently open tree database
 */
async function closeTreeDb(): Promise<void>;
```

### isTreeDbOpen

```typescript
/**
 * Check if a tree database is currently open
 */
function isTreeDbOpen(): boolean;
```

---

## System Database (system.db)

### Trees

```typescript
// Get all trees
async function getAllTrees(): Promise<Tree[]>;

// Get tree by ID
async function getTreeById(id: string): Promise<Tree | null>;

// Create a new tree
async function createTree(data: {
  name: string;
  filename: string;
  description?: string;
}): Promise<string>;

// Update a tree
async function updateTree(
  id: string,
  data: {
    name?: string;
    description?: string;
  },
): Promise<void>;

// Delete a tree
async function deleteTree(id: string): Promise<void>;

// Update tree statistics
async function updateTreeStats(
  id: string,
  stats: {
    individualCount?: number;
    familyCount?: number;
  },
): Promise<void>;

// Mark tree as recently opened
async function markTreeOpened(id: string): Promise<void>;
```

---

## Tree Database (\*.db)

### Individuals

```typescript
// Get all individuals
async function getAllIndividuals(): Promise<Individual[]>;

// Get individual by ID
async function getIndividualById(id: string): Promise<Individual | null>;

// Create individual
async function createIndividual(input: CreateIndividualInput): Promise<string>;

// Update individual
async function updateIndividual(
  id: string,
  input: UpdateIndividualInput,
): Promise<void>;

// Delete individual
async function deleteIndividual(id: string): Promise<void>;

// Count individuals
async function countIndividuals(): Promise<number>;

// Search individuals by name
async function searchIndividuals(query: string): Promise<Individual[]>;

// Get individuals without parents
async function getIndividualsWithoutParents(): Promise<Individual[]>;
```

### Names

```typescript
// Get names by individual ID
async function getNamesByIndividualId(individualId: string): Promise<Name[]>;

// Get primary name
async function getPrimaryName(individualId: string): Promise<Name | null>;

// Create name
async function createName(input: CreateNameInput): Promise<string>;

// Update name
async function updateName(id: string, input: UpdateNameInput): Promise<void>;

// Delete name
async function deleteName(id: string): Promise<void>;

// Format name for display
// Returns fallback values when name is null/undefined
function formatName(name: Name | null | undefined): {
  full: string;
  short: string;
  sortable: string;
};
```

### Families

```typescript
// Get all families
async function getAllFamilies(): Promise<Family[]>;

// Get family by ID
async function getFamilyById(id: string): Promise<Family | null>;

// Create family
async function createFamily(input?: CreateFamilyInput): Promise<string>;

// Update family
async function updateFamily(
  id: string,
  input: UpdateFamilyInput,
): Promise<void>;

// Delete family
async function deleteFamily(id: string): Promise<void>;

// Get family members
async function getFamilyMembers(familyId: string): Promise<FamilyMember[]>;

// Add family member
async function addFamilyMember(
  familyId: string,
  individualId: string,
  role: FamilyRole,
  pedigree?: Pedigree,
): Promise<void>;

// Remove family member
async function removeFamilyMember(
  familyId: string,
  individualId: string,
): Promise<void>;

// Get families where individual is a spouse
async function getFamiliesAsSpouse(individualId: string): Promise<Family[]>;

// Get family where individual is a child
async function getFamilyAsChild(individualId: string): Promise<Family | null>;
```

### Places

```typescript
// Get all places
async function getAllPlaces(): Promise<Place[]>;

// Get place by ID
async function getPlaceById(id: string): Promise<Place | null>;

// Create place
async function createPlace(input: CreatePlaceInput): Promise<string>;

// Update place
async function updatePlace(id: string, input: UpdatePlaceInput): Promise<void>;

// Delete place
async function deletePlace(id: string): Promise<void>;

// Search places
async function searchPlaces(query: string): Promise<Place[]>;

// Get place hierarchy (path from root to place)
async function getPlaceHierarchy(id: string): Promise<Place[]>;

// Get child places
async function getChildPlaces(parentId: string): Promise<Place[]>;

// Get or create place by full name
async function getOrCreatePlace(fullName: string): Promise<string>;
```

### Place Types

```typescript
// Get all place types (system + custom; display names via getPlaceTypeDisplayName)
async function getPlaceTypes(): Promise<PlaceType[]>;

// Get place type by ID
async function getPlaceTypeById(id: string): Promise<PlaceType | null>;
```

### Events

```typescript
// Get all events
async function getAllEvents(): Promise<Event[]>;

// Get event by ID
async function getEventById(id: string): Promise<Event | null>;

// Create event
async function createEvent(input: CreateEventInput): Promise<string>;

// Update event
async function updateEvent(id: string, input: UpdateEventInput): Promise<void>;

// Delete event
async function deleteEvent(id: string): Promise<void>;

// Get events by individual ID
async function getEventsByIndividualId(
  individualId: string,
): Promise<EventWithDetails[]>;

// Get events by family ID
async function getEventsByFamilyId(
  familyId: string,
): Promise<EventWithDetails[]>;

// Get all event types
async function getEventTypes(category?: EventCategory): Promise<EventType[]>;
```

### Event Participants

```typescript
// Add participant to event
async function addEventParticipant(
  input: CreateEventParticipantInput,
): Promise<string>;

// Remove participant from event
async function removeEventParticipant(
  eventId: string,
  participantId: string,
): Promise<void>;

// Get participants for event
async function getEventParticipants(
  eventId: string,
): Promise<EventParticipant[]>;
```

### Sources

```typescript
// Get all sources
async function getAllSources(): Promise<Source[]>;

// Get source by ID
async function getSourceById(id: string): Promise<Source | null>;

// Get source with details
async function getSourceWithDetails(
  id: string,
): Promise<SourceWithDetails | null>;

// Create source
async function createSource(input: CreateSourceInput): Promise<string>;

// Update source
async function updateSource(
  id: string,
  input: UpdateSourceInput,
): Promise<void>;

// Delete source
async function deleteSource(id: string): Promise<void>;

// Search sources
async function searchSources(query: string): Promise<Source[]>;

// Get sources by repository ID
async function getSourcesByRepositoryId(
  repositoryId: string,
): Promise<Source[]>;
```

### Citations

```typescript
// Get citations by source ID
async function getCitationsBySourceId(
  sourceId: string,
): Promise<SourceCitation[]>;

// Get citations for entity
async function getCitationsForEntity(
  entityType: CitableEntityType,
  entityId: string,
): Promise<SourceCitationWithSource[]>;

// Create citation
async function createCitation(input: CreateCitationInput): Promise<string>;

// Update citation
async function updateCitation(
  id: string,
  input: UpdateCitationInput,
): Promise<void>;

// Delete citation
async function deleteCitation(id: string): Promise<void>;

// Create citation link
async function createCitationLink(
  input: CreateCitationLinkInput,
): Promise<string>;

// Remove citation link
async function removeCitationLink(
  citationId: string,
  entityType: string,
  entityId: string,
): Promise<void>;

// Get all citations linked to an individual (via citation_links)
async function getCitationsForIndividual(
  individualId: string,
): Promise<SourceCitationWithSource[]>;

// Get all citations linked to a family
async function getCitationsForFamily(
  familyId: string,
): Promise<SourceCitationWithSource[]>;

// Get all citations linked to a name
async function getCitationsForName(
  nameId: string,
): Promise<SourceCitationWithSource[]>;

// Get all citations linked to an event
async function getCitationsForEvent(
  eventId: string,
): Promise<SourceCitationWithSource[]>;
```

### Repositories

```typescript
// Get all repositories
async function getAllRepositories(): Promise<Repository[]>;

// Get repository by ID
async function getRepositoryById(id: string): Promise<Repository | null>;

// Get repository with details (sources list)
async function getRepositoryWithDetails(
  id: string,
): Promise<RepositoryWithDetails | null>;

// Create repository
async function createRepository(input: CreateRepositoryInput): Promise<string>;

// Update repository
async function updateRepository(
  id: string,
  input: UpdateRepositoryInput,
): Promise<void>;

// Delete repository
async function deleteRepository(id: string): Promise<void>;

// Get sources by repository ID
async function getSourcesByRepositoryId(
  repositoryId: string,
): Promise<Source[]>;

// Search repositories
async function searchRepositories(query: string): Promise<Repository[]>;
```

---

## Type Definitions

### Individual Types

```typescript
type Gender = "M" | "F" | "U";

interface Individual {
  id: string;
  gender: Gender;
  isLiving: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateIndividualInput {
  gender?: Gender;
  isLiving?: boolean;
  notes?: string;
}

interface UpdateIndividualInput {
  gender?: Gender;
  isLiving?: boolean;
  notes?: string;
}
```

### Name Types

```typescript
type NameType =
  | "birth"
  | "married"
  | "adopted"
  | "aka"
  | "immigrant"
  | "religious"
  | "other";

interface Name {
  id: string;
  individualId: string;
  type: NameType;
  prefix: string | null;
  givenNames: string | null;
  surname: string | null;
  suffix: string | null;
  nickname: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateNameInput {
  individualId: string;
  type?: NameType;
  prefix?: string;
  givenNames?: string;
  surname?: string;
  suffix?: string;
  nickname?: string;
  isPrimary?: boolean;
}

interface NameWithCitations extends Name {
  citations: SourceCitationWithSource[];
}
```

### Family Types

```typescript
type FamilyRole = "husband" | "wife" | "child";
type Pedigree = "birth" | "adopted" | "foster" | "sealing" | "step";

interface Family {
  id: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FamilyMember {
  id: string;
  familyId: string;
  individualId: string;
  role: FamilyRole;
  pedigree: Pedigree | null;
  sortOrder: number;
  createdAt: string;
}
```

### Event Types

Event types support both system types (GEDCOM tag, display name via i18n) and user-defined custom types (no tag, display name in `customName`). The DB supports custom types from the start; the UI to create them can come later.

```typescript
type EventCategory = "individual" | "family";

interface EventType {
  id: string;
  tag: string | null; // GEDCOM code (system types only); null for custom types
  customName: string | null; // Display name (custom types only); null for system types
  category: EventCategory;
  isSystem: boolean;
  sortOrder: number;
}

// Display name: system types use i18n(tag), custom types use customName
function getEventTypeDisplayName(eventType: EventType, t: TFunction): string;

interface Event {
  id: string;
  eventTypeId: string;
  dateOriginal: string | null;
  dateSort: string | null;
  placeId: string | null;
  description: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateEventInput {
  eventTypeId: string;
  dateOriginal?: string;
  dateSort?: string;
  placeId?: string;
  description?: string;
  notes?: string;
}
```

### Place Types

Place types support both system types (optional GEDCOM-style tag, display via i18n) and user-defined custom types (no tag, display name in `customName`). The DB supports custom place types from the start.

```typescript
interface PlaceType {
  id: string;
  tag: string | null; // Optional identifier for system types; null for custom types
  customName: string | null; // Display name (custom types only); null for system types
  isSystem: boolean;
  sortOrder: number;
}

function getPlaceTypeDisplayName(placeType: PlaceType, t: TFunction): string;

interface Place {
  id: string;
  name: string;
  fullName: string;
  placeTypeId: string | null;
  parentId: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreatePlaceInput {
  name: string;
  fullName?: string;
  placeTypeId?: string;
  parentId?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

interface UpdatePlaceInput {
  name?: string;
  fullName?: string;
  placeTypeId?: string | null;
  parentId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
}
```

### Source Types

```typescript
type CitationQuality = "primary" | "secondary" | "questionable" | "unreliable";
type CitableEntityType = "individual" | "name" | "event" | "family";

interface Source {
  id: string;
  repositoryId: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  publicationDate: string | null;
  callNumber: string | null;
  url: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateSourceInput {
  repositoryId?: string;
  title: string;
  author?: string;
  publisher?: string;
  publicationDate?: string;
  callNumber?: string;
  url?: string;
  notes?: string;
}

interface UpdateSourceInput {
  repositoryId?: string;
  title?: string;
  author?: string;
  publisher?: string;
  publicationDate?: string;
  callNumber?: string;
  url?: string;
  notes?: string;
}

interface SourceCitation {
  id: string;
  sourceId: string;
  page: string | null;
  quality: CitationQuality | null;
  dateAccessed: string | null;
  text: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SourceCitationWithSource extends SourceCitation {
  source: Source;
}

interface CreateCitationInput {
  sourceId: string;
  page?: string;
  quality?: CitationQuality;
  dateAccessed?: string;
  text?: string;
  notes?: string;
}

interface UpdateCitationInput {
  sourceId?: string;
  page?: string;
  quality?: CitationQuality;
  dateAccessed?: string;
  text?: string;
  notes?: string;
}

interface CitationLink {
  id: string;
  citationId: string;
  entityType: CitableEntityType;
  entityId: string;
  fieldName: string | null;
  createdAt: string;
}

interface Repository {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RepositoryWithDetails extends Repository {
  sources: Source[];
  sourceCount: number;
}

interface CreateRepositoryInput {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
}

interface UpdateRepositoryInput {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
}
```
