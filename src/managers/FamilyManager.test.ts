import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { createIndividual } from '$db-tree/individuals';
import { createName } from '$db-tree/names';
import { createFamily, addFamilyMember } from '$db-tree/families';
import { addEventParticipant, createEvent, getEventTypeByTag } from '$db-tree/events';
import { FamilyManager } from './FamilyManager';

const db = createTreeInMemoryDb();

vi.mock('$/db/connection', () => ({
  getTreeDb: vi.fn(),
}));

import('$/db/connection').then(({ getTreeDb }) => {
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
});

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

async function createNamedIndividual(
  given: string,
  surname: string,
  gender: 'M' | 'F' | 'U' = 'U'
): Promise<string> {
  const id = await createIndividual({ gender });
  await createName({
    individualId: id,
    givenNames: given,
    surname,
    isPrimary: true,
  });
  return id;
}

async function createMarriageEvent(familyId: string, date: string): Promise<string> {
  const marrType = await getEventTypeByTag('MARR');
  if (!marrType) throw new Error('MARR event type missing from test DB');
  const eventId = await createEvent({
    eventTypeId: marrType.id,
    dateOriginal: date,
  });
  await addEventParticipant({
    eventId,
    familyId,
    role: 'principal',
  });
  return eventId;
}

describe('FamilyManager.getAll', () => {
  it('returns an empty array for an empty tree', async () => {
    const result = await FamilyManager.getAll();
    expect(result).toEqual([]);
  });

  it('returns families with no spouses and no children as empty shells', async () => {
    const familyId = await createFamily({});

    const result = await FamilyManager.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(familyId);
    expect(result[0].husband).toBeNull();
    expect(result[0].wife).toBeNull();
    expect(result[0].children).toEqual([]);
    expect(result[0].marriageEvent).toBeNull();
  });

  it('attaches husband and wife to the family', async () => {
    const husbandId = await createNamedIndividual('John', 'Doe', 'M');
    const wifeId = await createNamedIndividual('Jane', 'Smith', 'F');
    const familyId = await createFamily({});
    await addFamilyMember({ familyId, individualId: husbandId, role: 'husband' });
    await addFamilyMember({ familyId, individualId: wifeId, role: 'wife' });

    const result = await FamilyManager.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].husband?.id).toBe(husbandId);
    expect(result[0].husband?.primaryName?.givenNames).toBe('John');
    expect(result[0].wife?.id).toBe(wifeId);
    expect(result[0].wife?.primaryName?.givenNames).toBe('Jane');
  });

  it('attaches children to the family', async () => {
    const husbandId = await createNamedIndividual('Dad', 'Doe', 'M');
    const wifeId = await createNamedIndividual('Mom', 'Doe', 'F');
    const child1Id = await createNamedIndividual('Kid1', 'Doe');
    const child2Id = await createNamedIndividual('Kid2', 'Doe');
    const familyId = await createFamily({});
    await addFamilyMember({ familyId, individualId: husbandId, role: 'husband' });
    await addFamilyMember({ familyId, individualId: wifeId, role: 'wife' });
    await addFamilyMember({ familyId, individualId: child1Id, role: 'child' });
    await addFamilyMember({ familyId, individualId: child2Id, role: 'child' });

    const result = await FamilyManager.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(2);
    const childIds = result[0].children.map((c) => c.id).sort();
    expect(childIds).toEqual([child1Id, child2Id].sort());
  });

  it('returns null marriageEvent when the family has no marriage event recorded', async () => {
    const husbandId = await createNamedIndividual('A', 'B', 'M');
    const familyId = await createFamily({});
    await addFamilyMember({ familyId, individualId: husbandId, role: 'husband' });

    const result = await FamilyManager.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].marriageEvent).toBeNull();
  });

  it('populates marriageEvent when the family has a MARR event', async () => {
    const husbandId = await createNamedIndividual('John', 'Doe', 'M');
    const wifeId = await createNamedIndividual('Jane', 'Smith', 'F');
    const familyId = await createFamily({});
    await addFamilyMember({ familyId, individualId: husbandId, role: 'husband' });
    await addFamilyMember({ familyId, individualId: wifeId, role: 'wife' });
    await createMarriageEvent(familyId, '1950-06-15');

    const result = await FamilyManager.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].marriageEvent).not.toBeNull();
    expect(result[0].marriageEvent?.dateOriginal).toBe('1950-06-15');
    expect(result[0].marriageEvent?.eventType.tag).toBe('MARR');
  });

  it('returns multiple families each with their own members and marriage events', async () => {
    const h1 = await createNamedIndividual('H1', 'Fam1', 'M');
    const w1 = await createNamedIndividual('W1', 'Fam1', 'F');
    const h2 = await createNamedIndividual('H2', 'Fam2', 'M');

    const family1 = await createFamily({});
    const family2 = await createFamily({});
    await addFamilyMember({ familyId: family1, individualId: h1, role: 'husband' });
    await addFamilyMember({ familyId: family1, individualId: w1, role: 'wife' });
    await addFamilyMember({ familyId: family2, individualId: h2, role: 'husband' });
    await createMarriageEvent(family1, '1900-01-01');

    const result = await FamilyManager.getAll();

    expect(result).toHaveLength(2);
    const f1 = result.find((f) => f.id === family1);
    const f2 = result.find((f) => f.id === family2);
    expect(f1?.husband?.id).toBe(h1);
    expect(f1?.wife?.id).toBe(w1);
    expect(f1?.marriageEvent?.dateOriginal).toBe('1900-01-01');
    expect(f2?.husband?.id).toBe(h2);
    expect(f2?.wife).toBeNull();
    expect(f2?.marriageEvent).toBeNull();
  });
});
