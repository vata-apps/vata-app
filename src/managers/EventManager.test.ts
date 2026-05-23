import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { createIndividual } from '$db-tree/individuals';
import { createName } from '$db-tree/names';
import { createFamily, addFamilyMember } from '$db-tree/families';
import {
  createEvent,
  addEventParticipant,
  getEventTypeByTag,
  createEventType,
} from '$db-tree/events';
import { EventManager } from './EventManager';

const db = createTreeInMemoryDb();

vi.mock('$/db/connection', () => ({
  getTreeDb: vi.fn(),
}));

beforeEach(async () => {
  const { getTreeDb } = await import('$/db/connection');
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
  db._raw.exec('DELETE FROM event_participants');
  db._raw.exec('DELETE FROM events');
  db._raw.exec('DELETE FROM family_members');
  db._raw.exec('DELETE FROM families');
  db._raw.exec('DELETE FROM names');
  db._raw.exec('DELETE FROM individuals');
});

async function seedIndividual(givenNames: string, surname?: string): Promise<string> {
  const id = await createIndividual({ gender: 'U' });
  await createName({ individualId: id, givenNames, surname, isPrimary: true });
  return id;
}

describe('EventManager.getAll', () => {
  it('returns an empty array when the tree has no events', async () => {
    expect(await EventManager.getAll()).toEqual([]);
  });

  it('resolves a BIRT event with an individual principal to kind:individual', async () => {
    const individualId = await seedIndividual('Marie', 'Curie');
    const birtType = await getEventTypeByTag('BIRT');
    if (!birtType) throw new Error('BIRT missing');

    const eventId = await createEvent({
      eventTypeId: birtType.id,
      dateOriginal: '1867-11-07',
      dateSort: '1867-11-07',
    });
    await addEventParticipant({ eventId, individualId, role: 'principal' });

    const results = await EventManager.getAll();

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(eventId);
    expect(results[0].eventType.tag).toBe('BIRT');
    expect(results[0].principals).toHaveLength(1);
    expect(results[0].principals[0].kind).toBe('individual');
    if (results[0].principals[0].kind === 'individual') {
      expect(results[0].principals[0].name?.givenNames).toBe('Marie');
      expect(results[0].principals[0].name?.surname).toBe('Curie');
    }
  });

  it('resolves a MARR event with a family principal to kind:family with both spouses', async () => {
    const husbandId = await seedIndividual('Pierre', 'Curie');
    const wifeId = await seedIndividual('Marie', 'Sklodowska');
    const familyId = await createFamily({});
    await addFamilyMember({ familyId, individualId: husbandId, role: 'husband' });
    await addFamilyMember({ familyId, individualId: wifeId, role: 'wife' });

    const marrType = await getEventTypeByTag('MARR');
    if (!marrType) throw new Error('MARR missing');

    const eventId = await createEvent({
      eventTypeId: marrType.id,
      dateOriginal: '1895-07-26',
      dateSort: '1895-07-26',
    });
    await addEventParticipant({ eventId, familyId, role: 'principal' });

    const results = await EventManager.getAll();

    expect(results).toHaveLength(1);
    expect(results[0].principals).toHaveLength(1);
    const principal = results[0].principals[0];
    expect(principal.kind).toBe('family');
    if (principal.kind === 'family') {
      expect(principal.husband?.givenNames).toBe('Pierre');
      expect(principal.wife?.givenNames).toBe('Marie');
    }
  });

  it('resolves wife:null when family has no wife member', async () => {
    const husbandId = await seedIndividual('Jean', 'Dupont');
    const familyId = await createFamily({});
    await addFamilyMember({ familyId, individualId: husbandId, role: 'husband' });

    const marrType = await getEventTypeByTag('MARR');
    if (!marrType) throw new Error('MARR missing');

    const eventId = await createEvent({ eventTypeId: marrType.id });
    await addEventParticipant({ eventId, familyId, role: 'principal' });

    const results = await EventManager.getAll();

    expect(results).toHaveLength(1);
    const principal = results[0].principals[0];
    expect(principal.kind).toBe('family');
    if (principal.kind === 'family') {
      expect(principal.husband?.givenNames).toBe('Jean');
      expect(principal.wife).toBeNull();
    }
  });

  it('resolves husband:null and wife:null when the family has no members', async () => {
    const familyId = await createFamily({});
    const marrType = await getEventTypeByTag('MARR');
    if (!marrType) throw new Error('MARR missing');

    const eventId = await createEvent({ eventTypeId: marrType.id });
    await addEventParticipant({ eventId, familyId, role: 'principal' });

    const results = await EventManager.getAll();

    expect(results).toHaveLength(1);
    const principal = results[0].principals[0];
    expect(principal.kind).toBe('family');
    if (principal.kind === 'family') {
      expect(principal.husband).toBeNull();
      expect(principal.wife).toBeNull();
    }
  });

  it('returns an empty principals array when the event has no principal participant', async () => {
    const individualId = await seedIndividual('Witness', 'Only');
    const birtType = await getEventTypeByTag('BIRT');
    if (!birtType) throw new Error('BIRT missing');

    const eventId = await createEvent({ eventTypeId: birtType.id });
    await addEventParticipant({ eventId, individualId, role: 'witness' });

    const results = await EventManager.getAll();

    expect(results).toHaveLength(1);
    expect(results[0].principals).toHaveLength(0);
  });

  it('includes custom event types with their metadata intact', async () => {
    const customTypeId = await createEventType({
      category: 'individual',
      customName: 'Voyage en Amérique',
    });
    await createEvent({ eventTypeId: customTypeId });

    const results = await EventManager.getAll();

    expect(results).toHaveLength(1);
    expect(results[0].eventType.isSystem).toBe(false);
    expect(results[0].eventType.customName).toBe('Voyage en Amérique');
    expect(results[0].eventType.tag).toBeNull();
  });

  it('orders results by dateSort ascending with null dateSort last', async () => {
    const birtType = await getEventTypeByTag('BIRT');
    if (!birtType) throw new Error('BIRT missing');

    const id1 = await createEvent({ eventTypeId: birtType.id, dateSort: '1900-01-01' });
    const id2 = await createEvent({ eventTypeId: birtType.id });
    const id3 = await createEvent({ eventTypeId: birtType.id, dateSort: '1850-06-15' });

    const results = await EventManager.getAll();

    expect(results).toHaveLength(3);
    expect(results[0].id).toBe(id3);
    expect(results[1].id).toBe(id1);
    expect(results[2].id).toBe(id2);
  });

  it('resolves principal name to null when the individual is not found in the names map', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const birtType = await getEventTypeByTag('BIRT');
    if (!birtType) throw new Error('BIRT missing');

    const eventId = await createEvent({ eventTypeId: birtType.id });
    await addEventParticipant({ eventId, individualId, role: 'principal' });

    const results = await EventManager.getAll();

    expect(results).toHaveLength(1);
    const principal = results[0].principals[0];
    expect(principal.kind).toBe('individual');
    if (principal.kind === 'individual') {
      expect(principal.name).toBeNull();
    }
  });
});
