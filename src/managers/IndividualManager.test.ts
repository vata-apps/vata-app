import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { createIndividual } from '$db-tree/individuals';
import { createName } from '$db-tree/names';
import { createEvent, addEventParticipant, getEventTypeByTag } from '$db-tree/events';
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
