import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import { mapToPlace, type RawPlace } from './places';
import type {
  Event,
  EventType,
  EventCategory,
  EventParticipant,
  EventWithDetails,
  CreateEventInput,
  UpdateEventInput,
  CreateEventParticipantInput,
  CreateEventTypeInput,
  Place,
  ParticipantRole,
} from '$/types/database';

// =============================================================================
// Raw database row types (snake_case as in SQLite)
// =============================================================================

interface RawEventType {
  id: number;
  tag: string | null;
  category: string;
  is_system: number;
  custom_name: string | null;
  sort_order: number;
}

interface RawEvent {
  id: number;
  event_type_id: number;
  date_original: string | null;
  date_sort: string | null;
  place_id: number | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface RawEventParticipant {
  id: number;
  event_id: number;
  individual_id: number | null;
  family_id: number | null;
  role: string;
  notes: string | null;
  created_at: string;
}

// =============================================================================
// Mapping functions
// =============================================================================

function mapToEventType(raw: RawEventType): EventType {
  return {
    id: String(raw.id),
    tag: raw.tag,
    category: raw.category as EventCategory,
    isSystem: raw.is_system === 1,
    customName: raw.custom_name,
    sortOrder: raw.sort_order,
  };
}

function mapToEvent(raw: RawEvent): Event {
  return {
    id: formatEntityId('E', raw.id),
    eventTypeId: String(raw.event_type_id),
    dateOriginal: raw.date_original,
    dateSort: raw.date_sort,
    placeId: raw.place_id !== null ? formatEntityId('P', raw.place_id) : null,
    description: raw.description,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapToEventParticipant(raw: RawEventParticipant): EventParticipant {
  return {
    id: String(raw.id),
    eventId: formatEntityId('E', raw.event_id),
    individualId: raw.individual_id !== null ? formatEntityId('I', raw.individual_id) : null,
    familyId: raw.family_id !== null ? formatEntityId('F', raw.family_id) : null,
    role: raw.role as ParticipantRole,
    notes: raw.notes,
    createdAt: raw.created_at,
  };
}

// =============================================================================
// EventType Operations
// =============================================================================

/**
 * Get all event types, optionally filtered by category
 */
export async function getEventTypes(category?: EventCategory): Promise<EventType[]> {
  const db = await getTreeDb();

  if (category) {
    const rows = await db.select<RawEventType[]>(
      `SELECT id, tag, category, is_system, custom_name, sort_order
       FROM event_types
       WHERE category = $1
       ORDER BY sort_order, id`,
      [category]
    );
    return rows.map(mapToEventType);
  }

  const rows = await db.select<RawEventType[]>(
    `SELECT id, tag, category, is_system, custom_name, sort_order
     FROM event_types
     ORDER BY sort_order, id`
  );
  return rows.map(mapToEventType);
}

/**
 * Get an event type by ID
 */
export async function getEventTypeById(id: string): Promise<EventType | null> {
  const db = await getTreeDb();
  const rows = await db.select<RawEventType[]>(
    `SELECT id, tag, category, is_system, custom_name, sort_order
     FROM event_types
     WHERE id = $1`,
    [parseInt(id, 10)]
  );
  return rows[0] ? mapToEventType(rows[0]) : null;
}

/**
 * Get an event type by tag (for system types)
 */
export async function getEventTypeByTag(tag: string): Promise<EventType | null> {
  const db = await getTreeDb();
  const rows = await db.select<RawEventType[]>(
    `SELECT id, tag, category, is_system, custom_name, sort_order
     FROM event_types
     WHERE tag = $1`,
    [tag]
  );
  return rows[0] ? mapToEventType(rows[0]) : null;
}

/**
 * Create a custom event type
 * @returns The ID of the created event type
 */
export async function createEventType(input: CreateEventTypeInput): Promise<string> {
  const db = await getTreeDb();

  // Get the max sort_order if not provided
  let sortOrder = input.sortOrder;
  if (sortOrder === undefined) {
    const maxRows = await db.select<{ max_order: number | null }[]>(
      'SELECT MAX(sort_order) as max_order FROM event_types'
    );
    sortOrder = (maxRows[0]?.max_order ?? 0) + 1;
  }

  const result = await db.execute(
    `INSERT INTO event_types (category, is_system, custom_name, sort_order)
     VALUES ($1, 0, $2, $3)`,
    [input.category, input.customName, sortOrder]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create event type: no lastInsertId returned');
  }

  return String(result.lastInsertId);
}

/**
 * Delete a custom event type (system types cannot be deleted)
 */
export async function deleteEventType(id: string): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseInt(id, 10);

  // Only delete non-system types
  await db.execute('DELETE FROM event_types WHERE id = $1 AND is_system = 0', [dbId]);
}

/**
 * Count event types
 */
export async function countEventTypes(): Promise<number> {
  const db = await getTreeDb();
  const rows = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM event_types');
  return rows[0]?.count ?? 0;
}

// =============================================================================
// Event CRUD Operations
// =============================================================================

/**
 * Get all events ordered by date_sort
 */
export async function getAllEvents(): Promise<Event[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawEvent[]>(
    `SELECT id, event_type_id, date_original, date_sort, place_id, description, notes, created_at, updated_at
     FROM events
     ORDER BY date_sort, id`
  );
  return rows.map(mapToEvent);
}

/**
 * Get an event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  const rows = await db.select<RawEvent[]>(
    `SELECT id, event_type_id, date_original, date_sort, place_id, description, notes, created_at, updated_at
     FROM events
     WHERE id = $1`,
    [dbId]
  );
  return rows[0] ? mapToEvent(rows[0]) : null;
}

/**
 * Get an event with all its details (eventType, place, participants)
 */
export async function getEventWithDetails(id: string): Promise<EventWithDetails | null> {
  const event = await getEventById(id);
  if (!event) return null;

  // Get event type
  const eventType = await getEventTypeById(event.eventTypeId);
  if (!eventType) {
    throw new Error(`Event type not found for event ${id}`);
  }

  // Get place if exists
  let place: Place | null = null;
  if (event.placeId) {
    const db = await getTreeDb();
    const placeRows = await db.select<RawPlace[]>(
      `SELECT id, name, full_name, place_type_id, parent_id, latitude, longitude, notes, created_at, updated_at
       FROM places
       WHERE id = $1`,
      [parseEntityId(event.placeId)]
    );
    if (placeRows[0]) {
      place = mapToPlace(placeRows[0]);
    }
  }

  // Get participants
  const participants = await getEventParticipants(id);

  return {
    ...event,
    eventType,
    place,
    participants,
  };
}

/**
 * Create a new event
 * @returns The formatted ID of the created event (e.g., "E-0001")
 */
export async function createEvent(input: CreateEventInput): Promise<string> {
  const db = await getTreeDb();

  // Parse placeId if provided
  const placeDbId = input.placeId ? parseEntityId(input.placeId) : null;

  const result = await db.execute(
    `INSERT INTO events (event_type_id, date_original, date_sort, place_id, description, notes)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      parseInt(input.eventTypeId, 10),
      input.dateOriginal ?? null,
      input.dateSort ?? null,
      placeDbId,
      input.description ?? null,
      input.notes ?? null,
    ]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create event: no lastInsertId returned');
  }

  return formatEntityId('E', result.lastInsertId);
}

/**
 * Update an event
 */
export async function updateEvent(id: string, input: UpdateEventInput): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);

  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  let paramIndex = 1;

  if (input.eventTypeId !== undefined) {
    sets.push(`event_type_id = $${paramIndex++}`);
    params.push(parseInt(input.eventTypeId, 10));
  }
  if (input.dateOriginal !== undefined) {
    sets.push(`date_original = $${paramIndex++}`);
    params.push(input.dateOriginal);
  }
  if (input.dateSort !== undefined) {
    sets.push(`date_sort = $${paramIndex++}`);
    params.push(input.dateSort);
  }
  if (input.placeId !== undefined) {
    sets.push(`place_id = $${paramIndex++}`);
    params.push(input.placeId ? parseEntityId(input.placeId) : null);
  }
  if (input.description !== undefined) {
    sets.push(`description = $${paramIndex++}`);
    params.push(input.description);
  }
  if (input.notes !== undefined) {
    sets.push(`notes = $${paramIndex++}`);
    params.push(input.notes);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = datetime('now')`);
  params.push(dbId);

  await db.execute(`UPDATE events SET ${sets.join(', ')} WHERE id = $${paramIndex}`, params);
}

/**
 * Delete an event
 * Note: Event participants will be cascade deleted (ON DELETE CASCADE)
 */
export async function deleteEvent(id: string): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  await db.execute('DELETE FROM events WHERE id = $1', [dbId]);
}

/**
 * Count total events
 */
export async function countEvents(): Promise<number> {
  const db = await getTreeDb();
  const rows = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM events');
  return rows[0]?.count ?? 0;
}

// =============================================================================
// Event Queries by Entity
// =============================================================================

/**
 * Get all events for an individual (where the individual is a participant)
 */
export async function getEventsByIndividualId(individualId: string): Promise<Event[]> {
  const db = await getTreeDb();
  const dbId = parseEntityId(individualId);
  const rows = await db.select<RawEvent[]>(
    `SELECT DISTINCT e.id, e.event_type_id, e.date_original, e.date_sort, e.place_id, e.description, e.notes, e.created_at, e.updated_at
     FROM events e
     INNER JOIN event_participants ep ON ep.event_id = e.id
     WHERE ep.individual_id = $1
     ORDER BY e.date_sort, e.id`,
    [dbId]
  );
  return rows.map(mapToEvent);
}

/**
 * Get all events for an individual with full details
 */
export async function getEventsByIndividualIdWithDetails(
  individualId: string
): Promise<EventWithDetails[]> {
  const events = await getEventsByIndividualId(individualId);
  const results: EventWithDetails[] = [];

  for (const event of events) {
    const details = await getEventWithDetails(event.id);
    if (details) {
      results.push(details);
    }
  }

  return results;
}

/**
 * Get all events for a family (where the family is a participant)
 */
export async function getEventsByFamilyId(familyId: string): Promise<Event[]> {
  const db = await getTreeDb();
  const dbId = parseEntityId(familyId);
  const rows = await db.select<RawEvent[]>(
    `SELECT DISTINCT e.id, e.event_type_id, e.date_original, e.date_sort, e.place_id, e.description, e.notes, e.created_at, e.updated_at
     FROM events e
     INNER JOIN event_participants ep ON ep.event_id = e.id
     WHERE ep.family_id = $1
     ORDER BY e.date_sort, e.id`,
    [dbId]
  );
  return rows.map(mapToEvent);
}

/**
 * Get all events for a family with full details
 */
export async function getEventsByFamilyIdWithDetails(
  familyId: string
): Promise<EventWithDetails[]> {
  const events = await getEventsByFamilyId(familyId);
  const results: EventWithDetails[] = [];

  for (const event of events) {
    const details = await getEventWithDetails(event.id);
    if (details) {
      results.push(details);
    }
  }

  return results;
}

/**
 * Get events by place
 */
export async function getEventsByPlaceId(placeId: string): Promise<Event[]> {
  const db = await getTreeDb();
  const dbId = parseEntityId(placeId);
  const rows = await db.select<RawEvent[]>(
    `SELECT id, event_type_id, date_original, date_sort, place_id, description, notes, created_at, updated_at
     FROM events
     WHERE place_id = $1
     ORDER BY date_sort, id`,
    [dbId]
  );
  return rows.map(mapToEvent);
}

/**
 * Get events by event type
 */
export async function getEventsByTypeId(eventTypeId: string): Promise<Event[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawEvent[]>(
    `SELECT id, event_type_id, date_original, date_sort, place_id, description, notes, created_at, updated_at
     FROM events
     WHERE event_type_id = $1
     ORDER BY date_sort, id`,
    [parseInt(eventTypeId, 10)]
  );
  return rows.map(mapToEvent);
}

// =============================================================================
// Event Participant Operations
// =============================================================================

/**
 * Get all participants for an event
 */
export async function getEventParticipants(eventId: string): Promise<EventParticipant[]> {
  const db = await getTreeDb();
  const dbId = parseEntityId(eventId);
  const rows = await db.select<RawEventParticipant[]>(
    `SELECT id, event_id, individual_id, family_id, role, notes, created_at
     FROM event_participants
     WHERE event_id = $1
     ORDER BY role, id`,
    [dbId]
  );
  return rows.map(mapToEventParticipant);
}

/**
 * Add a participant to an event
 * @returns The ID of the created participant
 */
export async function addEventParticipant(input: CreateEventParticipantInput): Promise<string> {
  const db = await getTreeDb();

  // Validate that either individualId or familyId is provided, but not both
  if (!input.individualId && !input.familyId) {
    throw new Error('Either individualId or familyId must be provided');
  }
  if (input.individualId && input.familyId) {
    throw new Error('Cannot provide both individualId and familyId');
  }

  const eventDbId = parseEntityId(input.eventId);
  const individualDbId = input.individualId ? parseEntityId(input.individualId) : null;
  const familyDbId = input.familyId ? parseEntityId(input.familyId) : null;
  const role = input.role ?? 'principal';

  const result = await db.execute(
    `INSERT INTO event_participants (event_id, individual_id, family_id, role, notes)
     VALUES ($1, $2, $3, $4, $5)`,
    [eventDbId, individualDbId, familyDbId, role, input.notes ?? null]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to add event participant: no lastInsertId returned');
  }

  return String(result.lastInsertId);
}

/**
 * Remove a participant from an event
 */
export async function removeEventParticipant(
  eventId: string,
  participantId: string
): Promise<void> {
  const db = await getTreeDb();
  const eventDbId = parseEntityId(eventId);
  const participantDbId = parseInt(participantId, 10);

  await db.execute('DELETE FROM event_participants WHERE event_id = $1 AND id = $2', [
    eventDbId,
    participantDbId,
  ]);
}

/**
 * Get a specific participant by ID
 */
export async function getEventParticipantById(
  participantId: string
): Promise<EventParticipant | null> {
  const db = await getTreeDb();
  const rows = await db.select<RawEventParticipant[]>(
    `SELECT id, event_id, individual_id, family_id, role, notes, created_at
     FROM event_participants
     WHERE id = $1`,
    [parseInt(participantId, 10)]
  );
  return rows[0] ? mapToEventParticipant(rows[0]) : null;
}

/**
 * Update a participant's role or notes
 */
export async function updateEventParticipant(
  participantId: string,
  input: { role?: ParticipantRole; notes?: string }
): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseInt(participantId, 10);

  const sets: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (input.role !== undefined) {
    sets.push(`role = $${paramIndex++}`);
    params.push(input.role);
  }
  if (input.notes !== undefined) {
    sets.push(`notes = $${paramIndex++}`);
    params.push(input.notes);
  }

  if (sets.length === 0) return;

  params.push(dbId);

  await db.execute(
    `UPDATE event_participants SET ${sets.join(', ')} WHERE id = $${paramIndex}`,
    params
  );
}

/**
 * Count participants for an event
 */
export async function countEventParticipants(eventId: string): Promise<number> {
  const db = await getTreeDb();
  const dbId = parseEntityId(eventId);
  const rows = await db.select<{ count: number }[]>(
    'SELECT COUNT(*) as count FROM event_participants WHERE event_id = $1',
    [dbId]
  );
  return rows[0]?.count ?? 0;
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Create an event and add a participant in one operation
 * Useful for creating individual or family events
 */
export async function createEventWithParticipant(
  eventInput: CreateEventInput,
  participantInput: Omit<CreateEventParticipantInput, 'eventId'>
): Promise<{ eventId: string; participantId: string }> {
  const db = await getTreeDb();

  await db.execute('BEGIN TRANSACTION');
  try {
    const eventId = await createEvent(eventInput);
    const participantId = await addEventParticipant({
      ...participantInput,
      eventId,
    });

    await db.execute('COMMIT');
    return { eventId, participantId };
  } catch (error) {
    await db.execute('ROLLBACK');
    throw error;
  }
}

/**
 * Get the primary event of a specific type for an individual
 * (e.g., get birth event, death event)
 */
export async function getIndividualEventByType(
  individualId: string,
  eventTypeTag: string
): Promise<EventWithDetails | null> {
  const db = await getTreeDb();
  const dbId = parseEntityId(individualId);

  const rows = await db.select<RawEvent[]>(
    `SELECT e.id, e.event_type_id, e.date_original, e.date_sort, e.place_id, e.description, e.notes, e.created_at, e.updated_at
     FROM events e
     INNER JOIN event_participants ep ON ep.event_id = e.id
     INNER JOIN event_types et ON et.id = e.event_type_id
     WHERE ep.individual_id = $1 AND et.tag = $2 AND ep.role = 'principal'
     ORDER BY e.created_at
     LIMIT 1`,
    [dbId, eventTypeTag]
  );

  if (!rows[0]) return null;

  const event = mapToEvent(rows[0]);
  return getEventWithDetails(event.id);
}

// =============================================================================
// Bulk Fetch Helpers (for list-view managers)
// =============================================================================

interface RawEventWithType extends RawEvent {
  et_id: number;
  et_tag: string | null;
  et_category: string;
  et_is_system: number;
  et_custom_name: string | null;
  et_sort_order: number;
}

/**
 * SQLite defaults to a maximum of 999 host parameters per query (the
 * SQLITE_MAX_VARIABLE_NUMBER compile-time limit). We stay below that so bulk
 * `IN (...)` fetches never fail on trees that exceed the default.
 */
const SQLITE_IN_CLAUSE_LIMIT = 900;

function chunkArray<T>(items: T[], size: number): T[][] {
  if (items.length <= size) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function mapToEventWithType(row: RawEventWithType): { event: Event; eventType: EventType } {
  const event = mapToEvent(row);
  const eventType = mapToEventType({
    id: row.et_id,
    tag: row.et_tag,
    category: row.et_category,
    is_system: row.et_is_system,
    custom_name: row.et_custom_name,
    sort_order: row.et_sort_order,
  });
  return { event, eventType };
}

/**
 * Assemble EventWithDetails[] from a set of event rows.
 * Loads participants and places for the given events in a constant number
 * of queries (independent of event count).
 */
async function assembleEventsWithDetails(
  eventRows: RawEventWithType[]
): Promise<EventWithDetails[]> {
  if (eventRows.length === 0) return [];

  const db = await getTreeDb();
  const eventDbIds = eventRows.map((r) => r.id);

  // Fetch all participants for these events, chunking to stay under the
  // SQLite host-parameter limit when the tree has many events.
  const participantsByEvent = new Map<number, EventParticipant[]>();
  for (const idsChunk of chunkArray(eventDbIds, SQLITE_IN_CLAUSE_LIMIT)) {
    const placeholders = idsChunk.map((_, i) => `$${i + 1}`).join(', ');
    const participantRows = await db.select<RawEventParticipant[]>(
      `SELECT id, event_id, individual_id, family_id, role, notes, created_at
       FROM event_participants
       WHERE event_id IN (${placeholders})
       ORDER BY role, id`,
      idsChunk
    );
    for (const row of participantRows) {
      const list = participantsByEvent.get(row.event_id) ?? [];
      list.push(mapToEventParticipant(row));
      participantsByEvent.set(row.event_id, list);
    }
  }

  // Fetch all places referenced by these events, chunked for the same reason.
  const uniquePlaceIds = Array.from(
    new Set(eventRows.map((r) => r.place_id).filter((id): id is number => id !== null))
  );

  const placeMap = new Map<number, Place>();
  if (uniquePlaceIds.length > 0) {
    for (const idsChunk of chunkArray(uniquePlaceIds, SQLITE_IN_CLAUSE_LIMIT)) {
      const placeholders = idsChunk.map((_, i) => `$${i + 1}`).join(', ');
      const placeRows = await db.select<RawPlace[]>(
        `SELECT id, name, full_name, place_type_id, parent_id, latitude, longitude, notes, created_at, updated_at
         FROM places
         WHERE id IN (${placeholders})`,
        idsChunk
      );
      for (const row of placeRows) {
        placeMap.set(row.id, mapToPlace(row));
      }
    }
  }

  return eventRows.map((row) => {
    const { event, eventType } = mapToEventWithType(row);
    return {
      ...event,
      eventType,
      place: row.place_id !== null ? (placeMap.get(row.place_id) ?? null) : null,
      participants: participantsByEvent.get(row.id) ?? [],
    };
  });
}

/**
 * Get every BIRT and DEAT event in the tree with full details.
 * Uses a constant number of SQL queries regardless of event count.
 * Intended for list-view batch loading (e.g. IndividualManager.getAll).
 */
export async function getAllBirthDeathEvents(): Promise<EventWithDetails[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawEventWithType[]>(
    `SELECT e.id, e.event_type_id, e.date_original, e.date_sort, e.place_id, e.description, e.notes, e.created_at, e.updated_at,
            et.id AS et_id, et.tag AS et_tag, et.category AS et_category, et.is_system AS et_is_system, et.custom_name AS et_custom_name, et.sort_order AS et_sort_order
     FROM events e
     INNER JOIN event_types et ON et.id = e.event_type_id
     WHERE et.tag IN ('BIRT', 'DEAT')
     ORDER BY e.id`
  );
  return assembleEventsWithDetails(rows);
}

/**
 * Get every MARR event in the tree with full details.
 * Uses a constant number of SQL queries regardless of event count.
 * Intended for list-view batch loading (e.g. FamilyManager.getAll).
 */
export async function getAllMarriageEvents(): Promise<EventWithDetails[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawEventWithType[]>(
    `SELECT e.id, e.event_type_id, e.date_original, e.date_sort, e.place_id, e.description, e.notes, e.created_at, e.updated_at,
            et.id AS et_id, et.tag AS et_tag, et.category AS et_category, et.is_system AS et_is_system, et.custom_name AS et_custom_name, et.sort_order AS et_sort_order
     FROM events e
     INNER JOIN event_types et ON et.id = e.event_type_id
     WHERE et.tag = 'MARR'
     ORDER BY e.id`
  );
  return assembleEventsWithDetails(rows);
}

/**
 * Get the primary event of a specific type for a family
 * (e.g., get marriage event)
 */
export async function getFamilyEventByType(
  familyId: string,
  eventTypeTag: string
): Promise<EventWithDetails | null> {
  const db = await getTreeDb();
  const dbId = parseEntityId(familyId);

  const rows = await db.select<RawEvent[]>(
    `SELECT e.id, e.event_type_id, e.date_original, e.date_sort, e.place_id, e.description, e.notes, e.created_at, e.updated_at
     FROM events e
     INNER JOIN event_participants ep ON ep.event_id = e.id
     INNER JOIN event_types et ON et.id = e.event_type_id
     WHERE ep.family_id = $1 AND et.tag = $2 AND ep.role = 'principal'
     ORDER BY e.created_at
     LIMIT 1`,
    [dbId, eventTypeTag]
  );

  if (!rows[0]) return null;

  const event = mapToEvent(rows[0]);
  return getEventWithDetails(event.id);
}
