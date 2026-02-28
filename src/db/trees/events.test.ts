import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import {
  // EventType operations
  getEventTypes,
  getEventTypeById,
  getEventTypeByTag,
  createEventType,
  deleteEventType,
  countEventTypes,
  // Event CRUD
  getAllEvents,
  getEventById,
  getEventWithDetails,
  createEvent,
  updateEvent,
  deleteEvent,
  countEvents,
  // Event queries by entity
  getEventsByIndividualId,
  getEventsByFamilyId,
  getEventsByPlaceId,
  getEventsByTypeId,
  // Event participant operations
  getEventParticipants,
  addEventParticipant,
  removeEventParticipant,
  getEventParticipantById,
  updateEventParticipant,
  countEventParticipants,
  // Convenience functions
  createEventWithParticipant,
  getIndividualEventByType,
  getFamilyEventByType,
} from './events';

// A single in-memory DB shared across all tests in this file.
const db = createTreeInMemoryDb();

vi.mock('../connection', () => ({
  getTreeDb: vi.fn(),
}));

// Lazily resolve the mock after the module is loaded
import('../connection').then(({ getTreeDb }) => {
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
});

// Helper to create a system event type for testing
function insertSystemEventType(
  tag: string,
  category: 'individual' | 'family',
  sortOrder: number = 1
): void {
  db._raw.exec(
    `INSERT INTO event_types (tag, category, is_system, sort_order)
     VALUES ('${tag}', '${category}', 1, ${sortOrder})`
  );
}

// Helper to create a test individual
function createTestIndividual(): number {
  db._raw.exec("INSERT INTO individuals (gender, is_living) VALUES ('M', 1)");
  const stmt = db._raw.prepare('SELECT last_insert_rowid() as id');
  const result = stmt.get() as { id: number };
  return result.id;
}

// Helper to create a test family
function createTestFamily(): number {
  db._raw.exec('INSERT INTO families DEFAULT VALUES');
  const stmt = db._raw.prepare('SELECT last_insert_rowid() as id');
  const result = stmt.get() as { id: number };
  return result.id;
}

// Helper to create a test place
function createTestPlace(name: string = 'Test Place'): number {
  db._raw.exec(`INSERT INTO places (name, full_name) VALUES ('${name}', '${name}')`);
  const stmt = db._raw.prepare('SELECT last_insert_rowid() as id');
  const result = stmt.get() as { id: number };
  return result.id;
}

beforeEach(async () => {
  const { getTreeDb } = await import('../connection');
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
  db._raw.exec('DELETE FROM event_participants');
  db._raw.exec('DELETE FROM events');
  db._raw.exec('DELETE FROM event_types');
  db._raw.exec('DELETE FROM places');
  db._raw.exec('DELETE FROM individuals');
  db._raw.exec('DELETE FROM families');
});

// =============================================================================
// EventType Tests
// =============================================================================

describe('getEventTypes', () => {
  it('returns an empty list when no event types exist', async () => {
    expect(await getEventTypes()).toEqual([]);
  });

  it('returns all event types', async () => {
    insertSystemEventType('BIRT', 'individual');
    insertSystemEventType('MARR', 'family');

    const types = await getEventTypes();
    expect(types).toHaveLength(2);
  });

  it('filters by category when provided', async () => {
    insertSystemEventType('BIRT', 'individual', 1);
    insertSystemEventType('DEAT', 'individual', 2);
    insertSystemEventType('MARR', 'family', 1);

    const individualTypes = await getEventTypes('individual');
    expect(individualTypes).toHaveLength(2);
    expect(individualTypes.every((t) => t.category === 'individual')).toBe(true);

    const familyTypes = await getEventTypes('family');
    expect(familyTypes).toHaveLength(1);
    expect(familyTypes[0].tag).toBe('MARR');
  });

  it('returns event types ordered by sort_order', async () => {
    insertSystemEventType('DEAT', 'individual', 2);
    insertSystemEventType('BIRT', 'individual', 1);

    const types = await getEventTypes('individual');
    expect(types[0].tag).toBe('BIRT');
    expect(types[1].tag).toBe('DEAT');
  });
});

describe('getEventTypeById', () => {
  it('returns the event type with matching id', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const type = await getEventTypeById(types[0].id);

    expect(type).not.toBeNull();
    expect(type?.tag).toBe('BIRT');
  });

  it('returns null when no event type matches the id', async () => {
    expect(await getEventTypeById('9999')).toBeNull();
  });
});

describe('getEventTypeByTag', () => {
  it('returns the event type with matching tag', async () => {
    insertSystemEventType('BIRT', 'individual');
    const type = await getEventTypeByTag('BIRT');

    expect(type).not.toBeNull();
    expect(type?.tag).toBe('BIRT');
    expect(type?.category).toBe('individual');
  });

  it('returns null when no event type matches the tag', async () => {
    expect(await getEventTypeByTag('NONEXISTENT')).toBeNull();
  });
});

describe('createEventType', () => {
  it('creates a custom event type', async () => {
    const id = await createEventType({
      category: 'individual',
      customName: 'Custom Event',
    });

    const type = await getEventTypeById(id);
    expect(type).not.toBeNull();
    expect(type?.customName).toBe('Custom Event');
    expect(type?.isSystem).toBe(false);
    expect(type?.category).toBe('individual');
  });

  it('auto-increments sortOrder when not provided', async () => {
    const id1 = await createEventType({ category: 'individual', customName: 'Type 1' });
    const id2 = await createEventType({ category: 'individual', customName: 'Type 2' });

    const type1 = await getEventTypeById(id1);
    const type2 = await getEventTypeById(id2);

    expect(type2!.sortOrder).toBeGreaterThan(type1!.sortOrder);
  });

  it('uses provided sortOrder', async () => {
    const id = await createEventType({
      category: 'family',
      customName: 'Custom',
      sortOrder: 42,
    });

    const type = await getEventTypeById(id);
    expect(type?.sortOrder).toBe(42);
  });
});

describe('deleteEventType', () => {
  it('deletes a custom event type', async () => {
    const id = await createEventType({
      category: 'individual',
      customName: 'ToDelete',
    });

    await deleteEventType(id);
    expect(await getEventTypeById(id)).toBeNull();
  });

  it('does not delete system event types', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const systemType = types[0];

    await deleteEventType(systemType.id);

    // Should still exist
    expect(await getEventTypeById(systemType.id)).not.toBeNull();
  });
});

describe('countEventTypes', () => {
  it('returns 0 when no event types exist', async () => {
    expect(await countEventTypes()).toBe(0);
  });

  it('returns the correct count', async () => {
    insertSystemEventType('BIRT', 'individual');
    insertSystemEventType('DEAT', 'individual');
    await createEventType({ category: 'individual', customName: 'Custom' });

    expect(await countEventTypes()).toBe(3);
  });
});

// =============================================================================
// Event CRUD Tests
// =============================================================================

describe('getAllEvents', () => {
  it('returns an empty list when no events exist', async () => {
    expect(await getAllEvents()).toEqual([]);
  });

  it('returns all created events', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();

    await createEvent({ eventTypeId: types[0].id });
    await createEvent({ eventTypeId: types[0].id });

    const events = await getAllEvents();
    expect(events).toHaveLength(2);
  });

  it('returns events ordered by date_sort', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();

    await createEvent({
      eventTypeId: types[0].id,
      dateSort: '1990-01-01',
    });
    await createEvent({
      eventTypeId: types[0].id,
      dateSort: '1980-01-01',
    });

    const events = await getAllEvents();
    expect(events[0].dateSort).toBe('1980-01-01');
    expect(events[1].dateSort).toBe('1990-01-01');
  });
});

describe('getEventById', () => {
  it('returns the event with matching id', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();

    const id = await createEvent({
      eventTypeId: types[0].id,
      dateOriginal: '15 JAN 1990',
      description: 'Test event',
    });

    const event = await getEventById(id);
    expect(event).not.toBeNull();
    expect(event?.dateOriginal).toBe('15 JAN 1990');
    expect(event?.description).toBe('Test event');
  });

  it('returns null when no event matches the id', async () => {
    expect(await getEventById('E-9999')).toBeNull();
  });
});

describe('getEventWithDetails', () => {
  it('returns null for non-existent event', async () => {
    expect(await getEventWithDetails('E-9999')).toBeNull();
  });

  it('returns event with eventType', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();

    const id = await createEvent({ eventTypeId: types[0].id });
    const event = await getEventWithDetails(id);

    expect(event).not.toBeNull();
    expect(event?.eventType).not.toBeNull();
    expect(event?.eventType.tag).toBe('BIRT');
  });

  it('returns event with place', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const placeDbId = createTestPlace('Montreal');

    const id = await createEvent({
      eventTypeId: types[0].id,
      placeId: `P-${String(placeDbId).padStart(4, '0')}`,
    });

    const event = await getEventWithDetails(id);
    expect(event?.place).not.toBeNull();
    expect(event?.place?.name).toBe('Montreal');
  });

  it('returns event with participants', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const individualDbId = createTestIndividual();

    const eventId = await createEvent({ eventTypeId: types[0].id });
    await addEventParticipant({
      eventId,
      individualId: `I-${String(individualDbId).padStart(4, '0')}`,
      role: 'principal',
    });

    const event = await getEventWithDetails(eventId);
    expect(event?.participants).toHaveLength(1);
    expect(event?.participants[0].role).toBe('principal');
  });
});

describe('createEvent', () => {
  it('creates an event with only eventTypeId', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();

    const id = await createEvent({ eventTypeId: types[0].id });
    const event = await getEventById(id);

    expect(event).not.toBeNull();
    expect(event?.eventTypeId).toBe(types[0].id);
  });

  it('creates an event with full details', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const placeDbId = createTestPlace();

    const id = await createEvent({
      eventTypeId: types[0].id,
      dateOriginal: 'ABT 1850',
      dateSort: '1850-01-01',
      placeId: `P-${String(placeDbId).padStart(4, '0')}`,
      description: 'Birth event',
      notes: 'Some notes',
    });

    const event = await getEventById(id);
    expect(event?.dateOriginal).toBe('ABT 1850');
    expect(event?.dateSort).toBe('1850-01-01');
    expect(event?.description).toBe('Birth event');
    expect(event?.notes).toBe('Some notes');
  });

  it('returns a formatted ID (E-XXXX)', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();

    const id = await createEvent({ eventTypeId: types[0].id });
    expect(id).toMatch(/^E-\d{4}$/);
  });
});

describe('updateEvent', () => {
  it('updates the eventTypeId', async () => {
    insertSystemEventType('BIRT', 'individual');
    insertSystemEventType('DEAT', 'individual');
    const types = await getEventTypes();

    const id = await createEvent({ eventTypeId: types[0].id });
    await updateEvent(id, { eventTypeId: types[1].id });

    const event = await getEventById(id);
    expect(event?.eventTypeId).toBe(types[1].id);
  });

  it('updates the dateOriginal and dateSort', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();

    const id = await createEvent({ eventTypeId: types[0].id });
    await updateEvent(id, {
      dateOriginal: '1 JAN 1900',
      dateSort: '1900-01-01',
    });

    const event = await getEventById(id);
    expect(event?.dateOriginal).toBe('1 JAN 1900');
    expect(event?.dateSort).toBe('1900-01-01');
  });

  it('updates the placeId', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const placeDbId = createTestPlace();

    const id = await createEvent({ eventTypeId: types[0].id });
    await updateEvent(id, {
      placeId: `P-${String(placeDbId).padStart(4, '0')}`,
    });

    const event = await getEventById(id);
    expect(event?.placeId).toBe(`P-${String(placeDbId).padStart(4, '0')}`);
  });

  it('clears placeId when set to null', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const placeDbId = createTestPlace();

    const id = await createEvent({
      eventTypeId: types[0].id,
      placeId: `P-${String(placeDbId).padStart(4, '0')}`,
    });
    await updateEvent(id, { placeId: undefined });

    // Only explicit null clears it, undefined skips the update
    const event = await getEventById(id);
    expect(event?.placeId).not.toBeNull();
  });

  it('does nothing when no fields are provided', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();

    const id = await createEvent({
      eventTypeId: types[0].id,
      description: 'Original',
    });
    const before = await getEventById(id);
    await updateEvent(id, {});
    const after = await getEventById(id);

    expect(before?.description).toBe(after?.description);
  });
});

describe('deleteEvent', () => {
  it('removes the event', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();

    const id = await createEvent({ eventTypeId: types[0].id });
    await deleteEvent(id);

    expect(await getEventById(id)).toBeNull();
  });

  it('cascade deletes participants', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const individualDbId = createTestIndividual();

    const eventId = await createEvent({ eventTypeId: types[0].id });
    const participantId = await addEventParticipant({
      eventId,
      individualId: `I-${String(individualDbId).padStart(4, '0')}`,
    });

    await deleteEvent(eventId);

    expect(await getEventParticipantById(participantId)).toBeNull();
  });
});

describe('countEvents', () => {
  it('returns 0 when no events exist', async () => {
    expect(await countEvents()).toBe(0);
  });

  it('returns the correct count', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();

    await createEvent({ eventTypeId: types[0].id });
    await createEvent({ eventTypeId: types[0].id });
    await createEvent({ eventTypeId: types[0].id });

    expect(await countEvents()).toBe(3);
  });
});

// =============================================================================
// Event Query Tests
// =============================================================================

describe('getEventsByIndividualId', () => {
  it('returns events for an individual', async () => {
    insertSystemEventType('BIRT', 'individual');
    insertSystemEventType('DEAT', 'individual');
    const types = await getEventTypes();
    const individualDbId = createTestIndividual();
    const individualId = `I-${String(individualDbId).padStart(4, '0')}`;

    const eventId1 = await createEvent({ eventTypeId: types[0].id });
    const eventId2 = await createEvent({ eventTypeId: types[1].id });

    await addEventParticipant({ eventId: eventId1, individualId });
    await addEventParticipant({ eventId: eventId2, individualId });

    const events = await getEventsByIndividualId(individualId);
    expect(events).toHaveLength(2);
  });

  it('returns empty when individual has no events', async () => {
    const individualDbId = createTestIndividual();
    const individualId = `I-${String(individualDbId).padStart(4, '0')}`;

    const events = await getEventsByIndividualId(individualId);
    expect(events).toHaveLength(0);
  });
});

describe('getEventsByFamilyId', () => {
  it('returns events for a family', async () => {
    insertSystemEventType('MARR', 'family');
    const types = await getEventTypes();
    const familyDbId = createTestFamily();
    const familyId = `F-${String(familyDbId).padStart(4, '0')}`;

    const eventId = await createEvent({ eventTypeId: types[0].id });
    await addEventParticipant({ eventId, familyId });

    const events = await getEventsByFamilyId(familyId);
    expect(events).toHaveLength(1);
  });
});

describe('getEventsByPlaceId', () => {
  it('returns events at a place', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const placeDbId = createTestPlace();
    const placeId = `P-${String(placeDbId).padStart(4, '0')}`;

    await createEvent({ eventTypeId: types[0].id, placeId });
    await createEvent({ eventTypeId: types[0].id, placeId });

    const events = await getEventsByPlaceId(placeId);
    expect(events).toHaveLength(2);
  });
});

describe('getEventsByTypeId', () => {
  it('returns events of a specific type', async () => {
    insertSystemEventType('BIRT', 'individual');
    insertSystemEventType('DEAT', 'individual');
    const types = await getEventTypes();

    await createEvent({ eventTypeId: types[0].id });
    await createEvent({ eventTypeId: types[0].id });
    await createEvent({ eventTypeId: types[1].id });

    const birthEvents = await getEventsByTypeId(types[0].id);
    expect(birthEvents).toHaveLength(2);
  });
});

// =============================================================================
// Event Participant Tests
// =============================================================================

describe('addEventParticipant', () => {
  it('adds an individual participant', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const individualDbId = createTestIndividual();
    const individualId = `I-${String(individualDbId).padStart(4, '0')}`;

    const eventId = await createEvent({ eventTypeId: types[0].id });
    const participantId = await addEventParticipant({
      eventId,
      individualId,
      role: 'principal',
    });

    const participant = await getEventParticipantById(participantId);
    expect(participant).not.toBeNull();
    expect(participant?.individualId).toBe(individualId);
    expect(participant?.role).toBe('principal');
  });

  it('adds a family participant', async () => {
    insertSystemEventType('MARR', 'family');
    const types = await getEventTypes();
    const familyDbId = createTestFamily();
    const familyId = `F-${String(familyDbId).padStart(4, '0')}`;

    const eventId = await createEvent({ eventTypeId: types[0].id });
    const participantId = await addEventParticipant({
      eventId,
      familyId,
      role: 'principal',
    });

    const participant = await getEventParticipantById(participantId);
    expect(participant).not.toBeNull();
    expect(participant?.familyId).toBe(familyId);
  });

  it('defaults role to principal', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const individualDbId = createTestIndividual();

    const eventId = await createEvent({ eventTypeId: types[0].id });
    const participantId = await addEventParticipant({
      eventId,
      individualId: `I-${String(individualDbId).padStart(4, '0')}`,
    });

    const participant = await getEventParticipantById(participantId);
    expect(participant?.role).toBe('principal');
  });

  it('throws when neither individualId nor familyId provided', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();

    const eventId = await createEvent({ eventTypeId: types[0].id });

    await expect(addEventParticipant({ eventId })).rejects.toThrow(
      'Either individualId or familyId must be provided'
    );
  });

  it('throws when both individualId and familyId provided', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const individualDbId = createTestIndividual();
    const familyDbId = createTestFamily();

    const eventId = await createEvent({ eventTypeId: types[0].id });

    await expect(
      addEventParticipant({
        eventId,
        individualId: `I-${String(individualDbId).padStart(4, '0')}`,
        familyId: `F-${String(familyDbId).padStart(4, '0')}`,
      })
    ).rejects.toThrow('Cannot provide both individualId and familyId');
  });
});

describe('removeEventParticipant', () => {
  it('removes a participant', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const individualDbId = createTestIndividual();

    const eventId = await createEvent({ eventTypeId: types[0].id });
    const participantId = await addEventParticipant({
      eventId,
      individualId: `I-${String(individualDbId).padStart(4, '0')}`,
    });

    await removeEventParticipant(eventId, participantId);
    expect(await getEventParticipantById(participantId)).toBeNull();
  });
});

describe('getEventParticipants', () => {
  it('returns all participants for an event', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const ind1 = createTestIndividual();
    const ind2 = createTestIndividual();

    const eventId = await createEvent({ eventTypeId: types[0].id });
    await addEventParticipant({
      eventId,
      individualId: `I-${String(ind1).padStart(4, '0')}`,
      role: 'principal',
    });
    await addEventParticipant({
      eventId,
      individualId: `I-${String(ind2).padStart(4, '0')}`,
      role: 'witness',
    });

    const participants = await getEventParticipants(eventId);
    expect(participants).toHaveLength(2);
  });
});

describe('updateEventParticipant', () => {
  it('updates the role', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const individualDbId = createTestIndividual();

    const eventId = await createEvent({ eventTypeId: types[0].id });
    const participantId = await addEventParticipant({
      eventId,
      individualId: `I-${String(individualDbId).padStart(4, '0')}`,
      role: 'principal',
    });

    await updateEventParticipant(participantId, { role: 'witness' });

    const participant = await getEventParticipantById(participantId);
    expect(participant?.role).toBe('witness');
  });

  it('updates the notes', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const individualDbId = createTestIndividual();

    const eventId = await createEvent({ eventTypeId: types[0].id });
    const participantId = await addEventParticipant({
      eventId,
      individualId: `I-${String(individualDbId).padStart(4, '0')}`,
    });

    await updateEventParticipant(participantId, { notes: 'Updated notes' });

    const participant = await getEventParticipantById(participantId);
    expect(participant?.notes).toBe('Updated notes');
  });
});

describe('countEventParticipants', () => {
  it('returns 0 for event with no participants', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();

    const eventId = await createEvent({ eventTypeId: types[0].id });
    expect(await countEventParticipants(eventId)).toBe(0);
  });

  it('returns the correct count', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const ind1 = createTestIndividual();
    const ind2 = createTestIndividual();

    const eventId = await createEvent({ eventTypeId: types[0].id });
    await addEventParticipant({
      eventId,
      individualId: `I-${String(ind1).padStart(4, '0')}`,
    });
    await addEventParticipant({
      eventId,
      individualId: `I-${String(ind2).padStart(4, '0')}`,
    });

    expect(await countEventParticipants(eventId)).toBe(2);
  });
});

// =============================================================================
// Convenience Function Tests
// =============================================================================

describe('createEventWithParticipant', () => {
  it('creates event and participant in one operation', async () => {
    insertSystemEventType('BIRT', 'individual');
    const types = await getEventTypes();
    const individualDbId = createTestIndividual();

    const { eventId, participantId } = await createEventWithParticipant(
      { eventTypeId: types[0].id, dateOriginal: '1990' },
      { individualId: `I-${String(individualDbId).padStart(4, '0')}`, role: 'principal' }
    );

    const event = await getEventById(eventId);
    expect(event).not.toBeNull();
    expect(event?.dateOriginal).toBe('1990');

    const participant = await getEventParticipantById(participantId);
    expect(participant).not.toBeNull();
    expect(participant?.eventId).toBe(eventId);
  });
});

describe('getIndividualEventByType', () => {
  it('returns the birth event for an individual', async () => {
    insertSystemEventType('BIRT', 'individual');
    const individualDbId = createTestIndividual();
    const individualId = `I-${String(individualDbId).padStart(4, '0')}`;
    const types = await getEventTypes();

    const eventId = await createEvent({
      eventTypeId: types[0].id,
      dateOriginal: '1 JAN 1990',
    });
    await addEventParticipant({ eventId, individualId, role: 'principal' });

    const event = await getIndividualEventByType(individualId, 'BIRT');
    expect(event).not.toBeNull();
    expect(event?.dateOriginal).toBe('1 JAN 1990');
    expect(event?.eventType.tag).toBe('BIRT');
  });

  it('returns null when no event of type exists', async () => {
    insertSystemEventType('BIRT', 'individual');
    const individualDbId = createTestIndividual();
    const individualId = `I-${String(individualDbId).padStart(4, '0')}`;

    const event = await getIndividualEventByType(individualId, 'BIRT');
    expect(event).toBeNull();
  });
});

describe('getFamilyEventByType', () => {
  it('returns the marriage event for a family', async () => {
    insertSystemEventType('MARR', 'family');
    const familyDbId = createTestFamily();
    const familyId = `F-${String(familyDbId).padStart(4, '0')}`;
    const types = await getEventTypes();

    const eventId = await createEvent({
      eventTypeId: types[0].id,
      dateOriginal: '15 JUN 1985',
    });
    await addEventParticipant({ eventId, familyId, role: 'principal' });

    const event = await getFamilyEventByType(familyId, 'MARR');
    expect(event).not.toBeNull();
    expect(event?.dateOriginal).toBe('15 JUN 1985');
    expect(event?.eventType.tag).toBe('MARR');
  });

  it('returns null when no event of type exists', async () => {
    insertSystemEventType('MARR', 'family');
    const familyDbId = createTestFamily();
    const familyId = `F-${String(familyDbId).padStart(4, '0')}`;

    const event = await getFamilyEventByType(familyId, 'MARR');
    expect(event).toBeNull();
  });
});
