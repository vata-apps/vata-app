# Phase 2: CRUD Database

## Objective

Implement complete CRUD operations at the database layer for all primary entities: individuals, names, families, places, and events.

## Step 2.1: CRUD Individuals

### src/db/trees/individuals.ts

```typescript
import { getTreeDb } from '../connection';
import type {
  Individual,
  Gender,
  CreateIndividualInput,
  UpdateIndividualInput,
} from '$/types/database';
import { formatEntityId, parseEntityId } from '$/lib/entityId';

interface RawIndividual {
  id: number;
  gender: Gender;
  is_living: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapToIndividual(raw: RawIndividual): Individual {
  return {
    id: formatEntityId('I', raw.id),
    gender: raw.gender,
    isLiving: raw.is_living === 1,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Get all individuals
 */
export async function getAllIndividuals(): Promise<Individual[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawIndividual[]>(
    'SELECT id, gender, is_living, notes, created_at, updated_at FROM individuals ORDER BY id'
  );
  return rows.map(mapToIndividual);
}

/**
 * Get individual by ID
 */
export async function getIndividualById(id: string): Promise<Individual | null> {
  const db = await getTreeDb();
  const rows = await db.select<RawIndividual[]>(
    'SELECT id, gender, is_living, notes, created_at, updated_at FROM individuals WHERE id = $1',
    [parseEntityId(id)]
  );
  return rows[0] ? mapToIndividual(rows[0]) : null;
}

/**
 * Create an individual
 */
export async function createIndividual(input: CreateIndividualInput): Promise<string> {
  const db = await getTreeDb();
  const result = await db.execute(
    `INSERT INTO individuals (gender, is_living, notes) 
     VALUES ($1, $2, $3)`,
    [input.gender || 'U', input.isLiving !== false ? 1 : 0, input.notes || null]
  );
  return formatEntityId('I', result.lastInsertId);
}

/**
 * Update an individual
 */
export async function updateIndividual(id: string, input: UpdateIndividualInput): Promise<void> {
  const db = await getTreeDb();
  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  let paramIndex = 1;

  if (input.gender !== undefined) {
    sets.push(`gender = $${paramIndex++}`);
    params.push(input.gender);
  }
  if (input.isLiving !== undefined) {
    sets.push(`is_living = $${paramIndex++}`);
    params.push(input.isLiving ? 1 : 0);
  }
  if (input.notes !== undefined) {
    sets.push(`notes = $${paramIndex++}`);
    params.push(input.notes);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = datetime('now')`);
  params.push(parseEntityId(id));

  await db.execute(`UPDATE individuals SET ${sets.join(', ')} WHERE id = $${paramIndex}`, params);
}

/**
 * Delete an individual
 */
export async function deleteIndividual(id: string): Promise<void> {
  const db = await getTreeDb();
  await db.execute('DELETE FROM individuals WHERE id = $1', [parseEntityId(id)]);
}

/**
 * Count individuals
 */
export async function countIndividuals(): Promise<number> {
  const db = await getTreeDb();
  const rows = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM individuals');
  return rows[0]?.count || 0;
}

/**
 * Search individuals by name
 */
export async function searchIndividuals(query: string): Promise<Individual[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawIndividual[]>(
    `SELECT DISTINCT i.id, i.gender, i.is_living, i.notes, i.created_at, i.updated_at FROM individuals i
     JOIN names n ON n.individual_id = i.id
     WHERE n.given_names LIKE $1 OR n.surname LIKE $1
     ORDER BY i.id`,
    [`%${query}%`]
  );
  return rows.map(mapToIndividual);
}
```

### Validation Criteria

- [x] CRUD works
- [x] Search works
- [x] Count works

---

## Step 2.2: CRUD Names

### src/db/trees/names.ts

See [phase-2-entities.md](../../phases/phase-2-entities.md) Step 2.3 for complete implementation. Key functions:

- `getNamesByIndividualId(individualId)`
- `getPrimaryName(individualId)`
- `createName(input)`
- `updateName(id, input)`
- `deleteName(id)`
- `formatName(name)` - Returns full, short, and sortable formats; handles `null`/`undefined` with fallback values

### Validation Criteria

- [x] Multiple names per individual
- [x] Primary name management
- [x] Correct formatting

---

## Step 2.3: CRUD Families

### src/db/trees/families.ts

Implement the following functions following the same pattern as individuals:

- `getAllFamilies()`
- `getFamilyById(id)`
- `createFamily(input)`
- `updateFamily(id, input)`
- `deleteFamily(id)`
- `addFamilyMember(familyId, individualId, role, pedigree?)`
- `removeFamilyMember(familyId, individualId)`
- `getFamilyMembers(familyId)`
- `getFamiliesOfIndividual(individualId)`

### Validation Criteria

- [x] Family CRUD works
- [x] Member management works
- [x] Relationships maintained

---

## Step 2.4: CRUD Places

### src/db/trees/places.ts

Implement:

- `getAllPlaces()`
- `getPlaceById(id)`
- `createPlace(input)`
- `updatePlace(id, input)`
- `deletePlace(id)`
- `searchPlaces(query)`
- `getPlaceHierarchy(id)` - Returns the complete path
- `getChildPlaces(parentId)`

### Validation Criteria

- [x] Place CRUD works
- [x] Hierarchy management works
- [x] Search works

---

## Step 2.5: CRUD Events

### src/db/trees/events.ts

Implement:

- `getAllEvents()`
- `getEventById(id)`
- `createEvent(input)`
- `updateEvent(id, input)`
- `deleteEvent(id)`
- `getEventsByIndividualId(individualId)`
- `getEventsByFamilyId(familyId)`
- `addEventParticipant(eventId, input)`
- `removeEventParticipant(eventId, participantId)`
- `getEventTypes(category?)`

### Validation Criteria

- [x] Event CRUD works
- [x] Participant management works
- [x] Event types retrieved correctly

---

## Phase 2 Deliverables

### Files Created

```
src/db/trees/
├── individuals.ts      (7 functions)
├── individuals.test.ts (24 tests)
├── names.ts            (12 functions)
├── names.test.ts       (28 tests)
├── families.ts         (20 functions)
├── families.test.ts    (47 tests)
├── places.ts           (19 functions)
├── places.test.ts      (55 tests)
├── events.ts           (26 functions)
└── events.test.ts      (57 tests)
```

### Final Checklist

- [x] CRUD Individuals functional
- [x] CRUD Names functional
- [x] CRUD Families functional
- [x] CRUD Places functional
- [x] CRUD Events functional
- [x] All relationships maintained
- [x] Search functions work

**Status: COMPLETE** (211 tests passing)
