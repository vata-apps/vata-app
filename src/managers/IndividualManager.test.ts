import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { createIndividual } from '$db-tree/individuals';
import { createName, getNamesByIndividualId } from '$db-tree/names';
import {
  createEvent,
  addEventParticipant,
  getEventTypeByTag,
  getEventsByIndividualIdWithDetails,
} from '$db-tree/events';
import { IndividualManager } from './IndividualManager';

const db = createTreeInMemoryDb();

vi.mock('$/db/connection', () => ({
  getTreeDb: vi.fn(),
}));

beforeEach(async () => {
  const { getTreeDb } = await import('$/db/connection');
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
  db._raw.exec('DELETE FROM event_participants');
  db._raw.exec('DELETE FROM events');
  db._raw.exec('DELETE FROM names');
  db._raw.exec('DELETE FROM individuals');
});

async function createBirthEventFor(individualId: string, date: string): Promise<string> {
  const birtType = await getEventTypeByTag('BIRT');
  if (!birtType) throw new Error('BIRT event type missing from test DB');
  const eventId = await createEvent({
    eventTypeId: birtType.id,
    dateOriginal: date,
  });
  await addEventParticipant({
    eventId,
    individualId,
    role: 'principal',
  });
  return eventId;
}

async function createDeathEventFor(individualId: string, date: string): Promise<string> {
  const deatType = await getEventTypeByTag('DEAT');
  if (!deatType) throw new Error('DEAT event type missing from test DB');
  const eventId = await createEvent({
    eventTypeId: deatType.id,
    dateOriginal: date,
  });
  await addEventParticipant({
    eventId,
    individualId,
    role: 'principal',
  });
  return eventId;
}

describe('IndividualManager.getAll', () => {
  it('returns an empty array for an empty tree', async () => {
    const result = await IndividualManager.getAll();
    expect(result).toEqual([]);
  });

  it('returns one entry per individual with primary names populated', async () => {
    const id1 = await createIndividual({ gender: 'M' });
    await createName({
      individualId: id1,
      givenNames: 'John',
      surname: 'Doe',
      isPrimary: true,
    });

    const id2 = await createIndividual({ gender: 'F' });
    await createName({
      individualId: id2,
      givenNames: 'Jane',
      surname: 'Smith',
      isPrimary: true,
    });

    const result = await IndividualManager.getAll();

    expect(result).toHaveLength(2);
    const john = result.find((i) => i.id === id1);
    const jane = result.find((i) => i.id === id2);
    expect(john?.primaryName?.givenNames).toBe('John');
    expect(john?.primaryName?.surname).toBe('Doe');
    expect(jane?.primaryName?.givenNames).toBe('Jane');
    expect(jane?.primaryName?.surname).toBe('Smith');
  });

  it('returns null primaryName for individuals with no primary name', async () => {
    await createIndividual({ gender: 'U' });

    const result = await IndividualManager.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].primaryName).toBeNull();
    expect(result[0].names).toEqual([]);
  });

  it('includes alternative names alongside the primary name', async () => {
    const id = await createIndividual({ gender: 'F' });
    await createName({
      individualId: id,
      givenNames: 'Primary',
      surname: 'Name',
      isPrimary: true,
    });
    await createName({
      individualId: id,
      givenNames: 'Nickname',
      type: 'aka',
    });
    await createName({
      individualId: id,
      givenNames: 'Married',
      surname: 'Spouse',
      type: 'married',
    });

    const result = await IndividualManager.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].names).toHaveLength(3);
    expect(result[0].primaryName?.givenNames).toBe('Primary');
    // Primary should come first in the names list
    expect(result[0].names[0].isPrimary).toBe(true);
  });

  it('populates birth and death events when they exist', async () => {
    const id = await createIndividual({ gender: 'M' });
    await createName({ individualId: id, givenNames: 'Alive', isPrimary: true });
    await createBirthEventFor(id, '1900-01-01');
    await createDeathEventFor(id, '1980-12-31');

    const result = await IndividualManager.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].birthEvent).not.toBeNull();
    expect(result[0].birthEvent?.dateOriginal).toBe('1900-01-01');
    expect(result[0].birthEvent?.eventType.tag).toBe('BIRT');
    expect(result[0].deathEvent).not.toBeNull();
    expect(result[0].deathEvent?.dateOriginal).toBe('1980-12-31');
    expect(result[0].deathEvent?.eventType.tag).toBe('DEAT');
  });

  it('returns null birth/death events when an individual has none', async () => {
    const id = await createIndividual({ gender: 'F' });
    await createName({ individualId: id, givenNames: 'NoEvents', isPrimary: true });

    const result = await IndividualManager.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].birthEvent).toBeNull();
    expect(result[0].deathEvent).toBeNull();
  });

  it('only attaches events to individuals listed as principal participants', async () => {
    const principalId = await createIndividual({ gender: 'M' });
    const witnessId = await createIndividual({ gender: 'F' });
    await createName({ individualId: principalId, givenNames: 'Principal', isPrimary: true });
    await createName({ individualId: witnessId, givenNames: 'Witness', isPrimary: true });

    const birtType = await getEventTypeByTag('BIRT');
    if (!birtType) throw new Error('BIRT event type missing');
    const eventId = await createEvent({
      eventTypeId: birtType.id,
      dateOriginal: '1900-01-01',
    });
    await addEventParticipant({ eventId, individualId: principalId, role: 'principal' });
    await addEventParticipant({ eventId, individualId: witnessId, role: 'witness' });

    const result = await IndividualManager.getAll();

    const principal = result.find((i) => i.id === principalId);
    const witness = result.find((i) => i.id === witnessId);
    expect(principal?.birthEvent?.dateOriginal).toBe('1900-01-01');
    expect(witness?.birthEvent).toBeNull();
  });
});

describe('IndividualManager.getById', () => {
  it('only attaches birth/death events where the individual is a principal participant', async () => {
    // Shared rule with getAll: a witness at someone else's birth must not
    // see that birth reported as their own.
    const principalId = await createIndividual({ gender: 'M' });
    const witnessId = await createIndividual({ gender: 'F' });
    await createName({ individualId: principalId, givenNames: 'Principal', isPrimary: true });
    await createName({ individualId: witnessId, givenNames: 'Witness', isPrimary: true });

    const birtType = await getEventTypeByTag('BIRT');
    if (!birtType) throw new Error('BIRT event type missing');
    const eventId = await createEvent({
      eventTypeId: birtType.id,
      dateOriginal: '1900-01-01',
    });
    await addEventParticipant({ eventId, individualId: principalId, role: 'principal' });
    await addEventParticipant({ eventId, individualId: witnessId, role: 'witness' });

    const principal = await IndividualManager.getById(principalId);
    const witness = await IndividualManager.getById(witnessId);

    expect(principal?.birthEvent?.dateOriginal).toBe('1900-01-01');
    expect(witness?.birthEvent).toBeNull();
  });
});

/** Add a principal event of the given tag to an individual; returns the event id. */
async function createPrincipalEventFor(
  individualId: string,
  tag: string,
  date: string
): Promise<string> {
  const eventType = await getEventTypeByTag(tag);
  if (!eventType) throw new Error(`${tag} event type missing from test DB`);
  const eventId = await createEvent({ eventTypeId: eventType.id, dateOriginal: date });
  await addEventParticipant({ eventId, individualId, role: 'principal' });
  return eventId;
}

describe('IndividualManager.create', () => {
  it('creates the primary name with prefix, suffix and nickname', async () => {
    const id = await IndividualManager.create({
      gender: 'F',
      name: {
        prefix: 'Dr.',
        givenNames: 'Lily',
        surname: 'Potter',
        suffix: 'Jr.',
        nickname: 'Lils',
      },
    });

    const names = await getNamesByIndividualId(id);
    expect(names).toHaveLength(1);
    expect(names[0]).toMatchObject({
      isPrimary: true,
      prefix: 'Dr.',
      givenNames: 'Lily',
      surname: 'Potter',
      suffix: 'Jr.',
      nickname: 'Lils',
    });
  });

  it('creates alternate names alongside the primary name', async () => {
    const id = await IndividualManager.create({
      gender: 'F',
      name: { givenNames: 'Lily', surname: 'Potter' },
      alternateNames: [{ type: 'birth', givenNames: 'Lily', surname: 'Evans' }],
    });

    const names = await getNamesByIndividualId(id);
    expect(names).toHaveLength(2);
    const alternate = names.find((n) => !n.isPrimary);
    expect(alternate).toMatchObject({ type: 'birth', givenNames: 'Lily', surname: 'Evans' });
  });

  it('skips alternate name rows where both given and surname are blank', async () => {
    const id = await IndividualManager.create({
      gender: 'F',
      name: { givenNames: 'Lily', surname: 'Potter' },
      alternateNames: [
        { type: 'birth', givenNames: 'Lily', surname: 'Evans' },
        { type: 'aka', givenNames: '', surname: '' },
      ],
    });

    const names = await getNamesByIndividualId(id);
    expect(names).toHaveLength(2);
    const alternate = names.find((n) => !n.isPrimary);
    expect(alternate).toMatchObject({ type: 'birth', givenNames: 'Lily', surname: 'Evans' });
  });

  it('creates life events of arbitrary types with a date', async () => {
    const id = await IndividualManager.create({
      gender: 'F',
      name: { givenNames: 'Lily' },
      events: [
        { tag: 'BIRT', dateOriginal: '30 Jan 1960' },
        { tag: 'CHR', dateOriginal: '1 Mar 1960' },
      ],
    });

    const events = await getEventsByIndividualIdWithDetails(id);
    expect(events).toHaveLength(2);
    const birth = events.find((e) => e.eventType.tag === 'BIRT');
    expect(birth?.dateOriginal).toBe('30 Jan 1960');
    expect(birth?.dateSort).toBe('1960-01-30');
    expect(events.find((e) => e.eventType.tag === 'CHR')?.dateOriginal).toBe('1 Mar 1960');
  });

  it('derives a sortable dateSort from an approximate date', async () => {
    const id = await IndividualManager.create({
      gender: 'U',
      events: [{ tag: 'BIRT', dateOriginal: 'abt 1960' }],
    });

    const [event] = await getEventsByIndividualIdWithDetails(id);
    expect(event.dateOriginal).toBe('abt 1960');
    expect(event.dateSort).toBe('1960-01-01');
  });

  it('skips event rows with no date', async () => {
    const id = await IndividualManager.create({
      gender: 'U',
      events: [{ tag: 'BIRT', dateOriginal: '' }],
    });

    const events = await getEventsByIndividualIdWithDetails(id);
    expect(events).toHaveLength(0);
  });
});

describe('IndividualManager.update', () => {
  it('updates the primary name in place', async () => {
    const id = await IndividualManager.create({
      gender: 'F',
      name: { givenNames: 'Lily', surname: 'Evans' },
    });

    await IndividualManager.update(id, {
      primaryName: { givenNames: 'Lily', surname: 'Potter' },
    });

    const names = await getNamesByIndividualId(id);
    expect(names).toHaveLength(1);
    expect(names[0]).toMatchObject({ isPrimary: true, surname: 'Potter' });
  });

  it('creates a primary name on update when none exists yet', async () => {
    const id = await createIndividual({ gender: 'U' });

    await IndividualManager.update(id, { primaryName: { givenNames: 'Newly', surname: 'Named' } });

    const names = await getNamesByIndividualId(id);
    expect(names).toHaveLength(1);
    expect(names[0]).toMatchObject({ isPrimary: true, givenNames: 'Newly', surname: 'Named' });
  });

  it('adds, updates and removes alternate names in one call', async () => {
    const id = await IndividualManager.create({
      gender: 'F',
      name: { givenNames: 'Lily', surname: 'Potter' },
      alternateNames: [
        { type: 'birth', givenNames: 'Lily', surname: 'Evans' },
        { type: 'aka', givenNames: 'Lils' },
      ],
    });
    const [toKeep, toRemove] = (await getNamesByIndividualId(id)).filter((n) => !n.isPrimary);

    await IndividualManager.update(id, {
      alternateNames: [
        { id: toKeep.id, type: 'birth', givenNames: 'Lily', surname: 'Evans-updated' },
        { type: 'married', givenNames: 'Lily', surname: 'Potter' },
      ],
    });

    const names = (await getNamesByIndividualId(id)).filter((n) => !n.isPrimary);
    expect(names).toHaveLength(2);
    expect(names.find((n) => n.id === toKeep.id)?.surname).toBe('Evans-updated');
    expect(names.some((n) => n.id === toRemove.id)).toBe(false);
    expect(names.some((n) => n.type === 'married' && n.surname === 'Potter')).toBe(true);
  });

  it('removes an alternate name whose id is kept but whose given and surname are cleared', async () => {
    const id = await IndividualManager.create({
      gender: 'F',
      name: { givenNames: 'Lily', surname: 'Potter' },
      alternateNames: [{ type: 'birth', givenNames: 'Lily', surname: 'Evans' }],
    });
    const [alternate] = (await getNamesByIndividualId(id)).filter((n) => !n.isPrimary);

    await IndividualManager.update(id, {
      alternateNames: [{ id: alternate.id, type: 'birth', givenNames: '', surname: '' }],
    });

    const names = await getNamesByIndividualId(id);
    expect(names.filter((n) => !n.isPrimary)).toHaveLength(0);
  });

  it('adds, updates and removes life events in one call, leaving secondary participations untouched', async () => {
    const id = await IndividualManager.create({
      gender: 'F',
      name: { givenNames: 'Lily' },
      events: [{ tag: 'BIRT', dateOriginal: '1960-01-30' }],
    });
    const [birthEvent] = await getEventsByIndividualIdWithDetails(id);

    // A christening this person merely witnesses (secondary role) must survive
    // an update even when it's not in the submitted event list.
    const witnessedEventId = await createPrincipalEventFor(
      await IndividualManager.create({ gender: 'U' }),
      'CHR',
      '1900-01-01'
    );
    await addEventParticipant({ eventId: witnessedEventId, individualId: id, role: 'witness' });

    await IndividualManager.update(id, {
      events: [
        { id: birthEvent.id, tag: 'BIRT', dateOriginal: '1960-01-31' },
        { tag: 'CHR', dateOriginal: '1960-03-01' },
      ],
    });

    const events = await getEventsByIndividualIdWithDetails(id);
    const principalEvents = events.filter((e) =>
      e.participants.some((p) => p.role === 'principal' && p.individualId === id)
    );
    expect(principalEvents).toHaveLength(2);
    expect(principalEvents.find((e) => e.eventType.tag === 'BIRT')?.dateOriginal).toBe(
      '1960-01-31'
    );
    expect(principalEvents.find((e) => e.eventType.tag === 'CHR')?.dateOriginal).toBe('1960-03-01');
    // The witnessed event must still exist, untouched by the diff.
    expect(events.some((e) => e.id === witnessedEventId)).toBe(true);
  });

  it('removes a life event omitted from the submitted list', async () => {
    const id = await IndividualManager.create({
      gender: 'F',
      name: { givenNames: 'Lily' },
      events: [{ tag: 'BIRT', dateOriginal: '1960-01-30' }],
    });

    await IndividualManager.update(id, { events: [] });

    const events = await getEventsByIndividualIdWithDetails(id);
    expect(events).toHaveLength(0);
  });

  it('removes a life event whose id is kept but whose date is cleared', async () => {
    // The Person editor always resubmits Birth/Death rows by id, even when
    // the user clears the date — clearing is how the user removes them.
    const id = await IndividualManager.create({
      gender: 'F',
      name: { givenNames: 'Lily' },
      events: [{ tag: 'BIRT', dateOriginal: '1960-01-30' }],
    });
    const [birthEvent] = await getEventsByIndividualIdWithDetails(id);

    await IndividualManager.update(id, {
      events: [{ id: birthEvent.id, tag: 'BIRT', dateOriginal: '' }],
    });

    const events = await getEventsByIndividualIdWithDetails(id);
    expect(events).toHaveLength(0);
  });
});

describe('IndividualManager.search', () => {
  it('returns an empty array for a blank query', async () => {
    await IndividualManager.create({ name: { givenNames: 'John', surname: 'Doe' } });
    expect(await IndividualManager.search('   ')).toEqual([]);
  });

  it('returns name-enriched matches for given names or surname', async () => {
    const johnId = await IndividualManager.create({ name: { givenNames: 'John', surname: 'Doe' } });
    await IndividualManager.create({ name: { givenNames: 'Jane', surname: 'Smith' } });

    const results = await IndividualManager.search('John');

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(johnId);
    expect(results[0].primaryName?.surname).toBe('Doe');
  });

  it('returns no matches for a name nobody has', async () => {
    await IndividualManager.create({ name: { givenNames: 'John', surname: 'Doe' } });
    expect(await IndividualManager.search('Nonexistent')).toEqual([]);
  });
});
