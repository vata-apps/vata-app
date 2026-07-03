import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { getPersonEvents } from './person-events';
import { createIndividual } from './individuals';
import { createName } from './names';
import { createFamily, addFamilyMember } from './families';
import { createEvent, addEventParticipant, getEventTypeByTag } from './events';

// A single in-memory DB shared across all tests in this file.
const db = createTreeInMemoryDb();

vi.mock('../connection', () => ({
  getTreeDb: vi.fn(),
}));

import('../connection').then(({ getTreeDb }) => {
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
});

beforeEach(async () => {
  const { getTreeDb } = await import('../connection');
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
  db._raw.exec('DELETE FROM event_participants');
  db._raw.exec('DELETE FROM events');
  db._raw.exec('DELETE FROM family_members');
  db._raw.exec('DELETE FROM families');
  db._raw.exec('DELETE FROM names');
  db._raw.exec('DELETE FROM individuals');
});

describe('getPersonEvents', () => {
  it('returns an empty array for an individual with no events', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    expect(await getPersonEvents(individualId)).toEqual([]);
  });

  it("tags an individual's own principal event as `principal`", async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const birth = await getEventTypeByTag('BIRT');
    const eventId = await createEvent({
      eventTypeId: birth!.id,
      dateOriginal: '31 JUL 1980',
      dateSort: '1980-07-31',
    });
    await addEventParticipant({ eventId, individualId, role: 'principal' });

    const result = await getPersonEvents(individualId);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(eventId);
    expect(result[0].scope).toBe('principal');
    expect(result[0].role).toBe('principal');
    expect(result[0].counterpartyName).toBeNull();
  });

  it("includes a spouse-family marriage as a `union` event carrying the spouse's name", async () => {
    const harry = await createIndividual({ gender: 'M' });
    const ginny = await createIndividual({ gender: 'F' });
    await createName({
      individualId: ginny,
      givenNames: 'Ginny',
      surname: 'Weasley',
      isPrimary: true,
    });

    const familyId = await createFamily({});
    await addFamilyMember({ familyId, individualId: harry, role: 'husband' });
    await addFamilyMember({ familyId, individualId: ginny, role: 'wife' });

    const marriage = await getEventTypeByTag('MARR');
    const eventId = await createEvent({ eventTypeId: marriage!.id, dateOriginal: 'ABT 2002' });
    await addEventParticipant({ eventId, familyId, role: 'principal' });

    const result = await getPersonEvents(harry);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(eventId);
    expect(result[0].scope).toBe('union');
    expect(result[0].counterpartyName).toBe('Ginny Weasley');
    expect(result[0].role).toBeNull();
  });

  it('tags a non-principal role in another record as `secondary`, keeping the role', async () => {
    const harry = await createIndividual({ gender: 'M' });
    const subject = await createIndividual({ gender: 'F' });
    const birth = await getEventTypeByTag('BIRT');
    const eventId = await createEvent({ eventTypeId: birth!.id });
    await addEventParticipant({ eventId, individualId: subject, role: 'principal' });
    await addEventParticipant({ eventId, individualId: harry, role: 'witness' });

    const result = await getPersonEvents(harry);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(eventId);
    expect(result[0].scope).toBe('secondary');
    expect(result[0].role).toBe('witness');
    expect(result[0].counterpartyName).toBeNull();
  });

  it('merges all scopes chronologically, with undated events last', async () => {
    const harry = await createIndividual({ gender: 'M' });
    const ginny = await createIndividual({ gender: 'F' });
    await createName({
      individualId: ginny,
      givenNames: 'Ginny',
      surname: 'Weasley',
      isPrimary: true,
    });

    const birth = await getEventTypeByTag('BIRT');
    const marriage = await getEventTypeByTag('MARR');

    // Principal birth, 1980.
    const birthId = await createEvent({
      eventTypeId: birth!.id,
      dateOriginal: '31 JUL 1980',
      dateSort: '1980-07-31',
    });
    await addEventParticipant({ eventId: birthId, individualId: harry, role: 'principal' });

    // Union marriage, 2002.
    const familyId = await createFamily({});
    await addFamilyMember({ familyId, individualId: harry, role: 'husband' });
    await addFamilyMember({ familyId, individualId: ginny, role: 'wife' });
    const marriageId = await createEvent({ eventTypeId: marriage!.id, dateSort: '2002' });
    await addEventParticipant({ eventId: marriageId, familyId, role: 'principal' });

    // Undated secondary role (witness at another person's event).
    const subject = await createIndividual({ gender: 'M' });
    const undatedId = await createEvent({ eventTypeId: birth!.id });
    await addEventParticipant({ eventId: undatedId, individualId: subject, role: 'principal' });
    await addEventParticipant({ eventId: undatedId, individualId: harry, role: 'witness' });

    const result = await getPersonEvents(harry);

    expect(result.map((entry) => entry.id)).toEqual([birthId, marriageId, undatedId]);
    expect(result.map((entry) => entry.scope)).toEqual(['principal', 'union', 'secondary']);
  });
});
