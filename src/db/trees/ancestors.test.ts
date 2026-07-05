import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { getAncestors } from './ancestors';
import { createIndividual } from './individuals';
import { createName } from './names';
import { createFamily, addFamilyMember } from './families';

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
  db._raw.exec('DELETE FROM family_members');
  db._raw.exec('DELETE FROM families');
  db._raw.exec('DELETE FROM names');
  db._raw.exec('DELETE FROM individuals');
});

/** Creates a parent Family for `childId` with the given father/mother (either may be omitted). */
async function addParents(
  childId: string,
  parents: { fatherId?: string; motherId?: string }
): Promise<void> {
  const familyId = await createFamily({});
  if (parents.fatherId) {
    await addFamilyMember({ familyId, individualId: parents.fatherId, role: 'husband' });
  }
  if (parents.motherId) {
    await addFamilyMember({ familyId, individualId: parents.motherId, role: 'wife' });
  }
  await addFamilyMember({ familyId, individualId: childId, role: 'child' });
}

describe('getAncestors', () => {
  it('returns the full fixed-width skeleton, all-unknown, for an individual with no recorded parents', async () => {
    const individualId = await createIndividual({ gender: 'M' });

    const tree = await getAncestors(individualId, 3);

    expect(tree.generations).toEqual([
      [expect.objectContaining({ id: individualId })],
      [null, null],
      [null, null, null, null],
    ]);
  });

  it('defaults to 4 generations (subject + 3 ancestor levels, 15 slots)', async () => {
    const individualId = await createIndividual({ gender: 'M' });

    const tree = await getAncestors(individualId);

    expect(tree.generations.map((level) => level.length)).toEqual([1, 2, 4, 8]);
  });

  it('resolves a known father and mother at generation 1, by role', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const father = await createIndividual({ gender: 'M' });
    const mother = await createIndividual({ gender: 'F' });
    await createName({
      individualId: father,
      givenNames: 'James',
      surname: 'Potter',
      isPrimary: true,
    });
    await createName({
      individualId: mother,
      givenNames: 'Lily',
      surname: 'Evans',
      isPrimary: true,
    });
    await addParents(individualId, { fatherId: father, motherId: mother });

    const tree = await getAncestors(individualId, 2);

    expect(tree.generations[1][0]).toEqual(expect.objectContaining({ id: father, gender: 'M' }));
    expect(tree.generations[1][0]?.primaryName?.givenNames).toBe('James');
    expect(tree.generations[1][1]).toEqual(expect.objectContaining({ id: mother, gender: 'F' }));
  });

  it('never walks past an unknown slot — an ancestor with no recorded parents leaves their whole branch null', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const father = await createIndividual({ gender: 'M' });
    // Father has no recorded parents of his own; mother isn't recorded at all.
    await addParents(individualId, { fatherId: father });

    const tree = await getAncestors(individualId, 3);

    expect(tree.generations[1]).toEqual([expect.objectContaining({ id: father }), null]);
    expect(tree.generations[2]).toEqual([null, null, null, null]);
  });

  it('follows only the first parent Family when the individual belongs to more than one', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const biologicalFather = await createIndividual({ gender: 'M' });
    const adoptiveFather = await createIndividual({ gender: 'M' });
    await addParents(individualId, { fatherId: biologicalFather });
    await addParents(individualId, { fatherId: adoptiveFather });

    const tree = await getAncestors(individualId, 2);

    expect(tree.generations[1][0]?.id).toBe(biologicalFather);
  });
});
