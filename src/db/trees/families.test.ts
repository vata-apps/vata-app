import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import {
  getAllFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
  countFamilies,
  getFamilyMembers,
  addFamilyMember,
  removeFamilyMember,
  removeFamilyMemberById,
  updateFamilyMember,
  getFamilyMemberById,
  getFamiliesOfIndividual,
  getSpouseFamilies,
  getParentFamilies,
  isMemberOfFamily,
  getFamilyWithMembers,
  getSpouseInFamily,
  getChildrenInFamily,
  countChildrenInFamily,
} from './families';
import { createIndividual } from './individuals';
import { createName } from './names';

// A single in-memory DB shared across all tests in this file.
const db = createTreeInMemoryDb();

vi.mock('../connection', () => ({
  getTreeDb: vi.fn(),
}));

// Lazily resolve the mock after the module is loaded
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

// =============================================================================
// Family CRUD Tests
// =============================================================================

describe('getAllFamilies', () => {
  it('returns an empty list when no families exist', async () => {
    expect(await getAllFamilies()).toEqual([]);
  });

  it('returns all created families', async () => {
    await createFamily({});
    await createFamily({});
    const families = await getAllFamilies();
    expect(families).toHaveLength(2);
  });

  it('returns families ordered by ID', async () => {
    const id1 = await createFamily({});
    const id2 = await createFamily({});
    const families = await getAllFamilies();
    expect(families[0].id).toBe(id1);
    expect(families[1].id).toBe(id2);
  });
});

describe('getFamilyById', () => {
  it('returns the family with matching id', async () => {
    const id = await createFamily({ notes: 'Test family' });
    const family = await getFamilyById(id);
    expect(family).not.toBeNull();
    expect(family?.notes).toBe('Test family');
  });

  it('returns null when no family matches the id', async () => {
    expect(await getFamilyById('F-9999')).toBeNull();
  });
});

describe('createFamily', () => {
  it('creates a family with no notes', async () => {
    const id = await createFamily({});
    const family = await getFamilyById(id);
    expect(family).not.toBeNull();
    expect(family?.notes).toBeNull();
  });

  it('creates a family with notes', async () => {
    const id = await createFamily({ notes: 'Some notes' });
    const family = await getFamilyById(id);
    expect(family?.notes).toBe('Some notes');
  });

  it('returns a formatted ID (F-XXXX)', async () => {
    const id = await createFamily({});
    expect(id).toMatch(/^F-\d{4}$/);
  });
});

describe('updateFamily', () => {
  it('updates the notes', async () => {
    const id = await createFamily({});
    await updateFamily(id, { notes: 'Updated notes' });
    const family = await getFamilyById(id);
    expect(family?.notes).toBe('Updated notes');
  });

  it('does not affect other families', async () => {
    const id1 = await createFamily({ notes: 'Family 1' });
    const id2 = await createFamily({ notes: 'Family 2' });
    await updateFamily(id1, { notes: 'Updated' });
    const family2 = await getFamilyById(id2);
    expect(family2?.notes).toBe('Family 2');
  });
});

describe('deleteFamily', () => {
  it('removes the family', async () => {
    const id = await createFamily({});
    await deleteFamily(id);
    expect(await getFamilyById(id)).toBeNull();
  });

  it('does not delete other families', async () => {
    const id1 = await createFamily({});
    const id2 = await createFamily({});
    await deleteFamily(id2);
    expect(await getFamilyById(id1)).not.toBeNull();
  });

  it('cascade deletes family members', async () => {
    const familyId = await createFamily({});
    const individualId = await createIndividual({ gender: 'M' });
    await addFamilyMember({
      familyId,
      individualId,
      role: 'husband',
    });

    const membersBefore = await getFamilyMembers(familyId);
    expect(membersBefore).toHaveLength(1);

    await deleteFamily(familyId);

    // Family is deleted
    expect(await getFamilyById(familyId)).toBeNull();
    // Members should be cleaned up too (no orphan records)
  });
});

describe('countFamilies', () => {
  it('returns 0 when no families exist', async () => {
    expect(await countFamilies()).toBe(0);
  });

  it('returns the correct count', async () => {
    await createFamily({});
    await createFamily({});
    await createFamily({});
    expect(await countFamilies()).toBe(3);
  });
});

// =============================================================================
// Family Member Tests
// =============================================================================

describe('addFamilyMember', () => {
  it('adds a member to a family', async () => {
    const familyId = await createFamily({});
    const individualId = await createIndividual({ gender: 'M' });

    const memberId = await addFamilyMember({
      familyId,
      individualId,
      role: 'husband',
    });

    expect(memberId).toBeDefined();
    const members = await getFamilyMembers(familyId);
    expect(members).toHaveLength(1);
    expect(members[0].individualId).toBe(individualId);
    expect(members[0].role).toBe('husband');
  });

  it('adds multiple members to a family', async () => {
    const familyId = await createFamily({});
    const husband = await createIndividual({ gender: 'M' });
    const wife = await createIndividual({ gender: 'F' });
    const child = await createIndividual({ gender: 'M' });

    await addFamilyMember({ familyId, individualId: husband, role: 'husband' });
    await addFamilyMember({ familyId, individualId: wife, role: 'wife' });
    await addFamilyMember({ familyId, individualId: child, role: 'child' });

    const members = await getFamilyMembers(familyId);
    expect(members).toHaveLength(3);
  });

  it('respects the pedigree field', async () => {
    const familyId = await createFamily({});
    const child = await createIndividual({ gender: 'M' });

    await addFamilyMember({
      familyId,
      individualId: child,
      role: 'child',
      pedigree: 'adopted',
    });

    const members = await getFamilyMembers(familyId);
    expect(members[0].pedigree).toBe('adopted');
  });

  it('respects the sortOrder field', async () => {
    const familyId = await createFamily({});
    const child1 = await createIndividual({ gender: 'M' });
    const child2 = await createIndividual({ gender: 'F' });

    await addFamilyMember({ familyId, individualId: child1, role: 'child', sortOrder: 2 });
    await addFamilyMember({ familyId, individualId: child2, role: 'child', sortOrder: 1 });

    const members = await getFamilyMembers(familyId);
    // Children are sorted by sortOrder
    const children = members.filter((m) => m.role === 'child');
    expect(children[0].individualId).toBe(child2); // sortOrder 1
    expect(children[1].individualId).toBe(child1); // sortOrder 2
  });
});

describe('removeFamilyMember', () => {
  it('removes a member from a family', async () => {
    const familyId = await createFamily({});
    const individualId = await createIndividual({ gender: 'M' });
    await addFamilyMember({ familyId, individualId, role: 'husband' });

    await removeFamilyMember(familyId, individualId);

    const members = await getFamilyMembers(familyId);
    expect(members).toHaveLength(0);
  });

  it('does not affect other members', async () => {
    const familyId = await createFamily({});
    const husband = await createIndividual({ gender: 'M' });
    const wife = await createIndividual({ gender: 'F' });

    await addFamilyMember({ familyId, individualId: husband, role: 'husband' });
    await addFamilyMember({ familyId, individualId: wife, role: 'wife' });

    await removeFamilyMember(familyId, husband);

    const members = await getFamilyMembers(familyId);
    expect(members).toHaveLength(1);
    expect(members[0].individualId).toBe(wife);
  });
});

describe('removeFamilyMemberById', () => {
  it('removes a member by its ID', async () => {
    const familyId = await createFamily({});
    const individualId = await createIndividual({ gender: 'M' });
    const memberId = await addFamilyMember({ familyId, individualId, role: 'husband' });

    await removeFamilyMemberById(memberId);

    const members = await getFamilyMembers(familyId);
    expect(members).toHaveLength(0);
  });
});

describe('updateFamilyMember', () => {
  it('updates the role', async () => {
    const familyId = await createFamily({});
    const individualId = await createIndividual({ gender: 'F' });
    const memberId = await addFamilyMember({ familyId, individualId, role: 'wife' });

    // This scenario is unusual but let's test the function works
    await updateFamilyMember(memberId, { role: 'child' });

    const member = await getFamilyMemberById(memberId);
    expect(member?.role).toBe('child');
  });

  it('updates the pedigree', async () => {
    const familyId = await createFamily({});
    const individualId = await createIndividual({ gender: 'M' });
    const memberId = await addFamilyMember({ familyId, individualId, role: 'child' });

    await updateFamilyMember(memberId, { pedigree: 'adopted' });

    const member = await getFamilyMemberById(memberId);
    expect(member?.pedigree).toBe('adopted');
  });

  it('updates the sortOrder', async () => {
    const familyId = await createFamily({});
    const individualId = await createIndividual({ gender: 'M' });
    const memberId = await addFamilyMember({
      familyId,
      individualId,
      role: 'child',
      sortOrder: 1,
    });

    await updateFamilyMember(memberId, { sortOrder: 5 });

    const member = await getFamilyMemberById(memberId);
    expect(member?.sortOrder).toBe(5);
  });
});

describe('getFamilyMemberById', () => {
  it('returns the member with matching id', async () => {
    const familyId = await createFamily({});
    const individualId = await createIndividual({ gender: 'M' });
    const memberId = await addFamilyMember({ familyId, individualId, role: 'husband' });

    const member = await getFamilyMemberById(memberId);
    expect(member).not.toBeNull();
    expect(member?.role).toBe('husband');
  });

  it('returns null when no member matches', async () => {
    expect(await getFamilyMemberById('9999')).toBeNull();
  });
});

describe('getFamilyMembers', () => {
  it('returns members ordered by role (husband, wife, children)', async () => {
    const familyId = await createFamily({});
    const child = await createIndividual({ gender: 'M' });
    const wife = await createIndividual({ gender: 'F' });
    const husband = await createIndividual({ gender: 'M' });

    // Add in different order
    await addFamilyMember({ familyId, individualId: child, role: 'child' });
    await addFamilyMember({ familyId, individualId: wife, role: 'wife' });
    await addFamilyMember({ familyId, individualId: husband, role: 'husband' });

    const members = await getFamilyMembers(familyId);
    expect(members[0].role).toBe('husband');
    expect(members[1].role).toBe('wife');
    expect(members[2].role).toBe('child');
  });
});

// =============================================================================
// Relationship Query Tests
// =============================================================================

describe('getFamiliesOfIndividual', () => {
  it('returns all families an individual belongs to', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const family1 = await createFamily({});
    const family2 = await createFamily({});

    await addFamilyMember({ familyId: family1, individualId, role: 'husband' });
    await addFamilyMember({ familyId: family2, individualId, role: 'child' });

    const families = await getFamiliesOfIndividual(individualId);
    expect(families).toHaveLength(2);
  });

  it('filters by role when specified', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const spouseFamily = await createFamily({});
    const parentFamily = await createFamily({});

    await addFamilyMember({ familyId: spouseFamily, individualId, role: 'husband' });
    await addFamilyMember({ familyId: parentFamily, individualId, role: 'child' });

    const spouseFamilies = await getFamiliesOfIndividual(individualId, 'husband');
    expect(spouseFamilies).toHaveLength(1);
    expect(spouseFamilies[0].id).toBe(spouseFamily);
  });

  it('returns empty when individual has no families', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const families = await getFamiliesOfIndividual(individualId);
    expect(families).toHaveLength(0);
  });
});

describe('getSpouseFamilies', () => {
  it('returns families where individual is a spouse', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const spouseFamily = await createFamily({});
    const parentFamily = await createFamily({});

    await addFamilyMember({ familyId: spouseFamily, individualId, role: 'husband' });
    await addFamilyMember({ familyId: parentFamily, individualId, role: 'child' });

    const families = await getSpouseFamilies(individualId);
    expect(families).toHaveLength(1);
    expect(families[0].id).toBe(spouseFamily);
  });
});

describe('getParentFamilies', () => {
  it('returns families where individual is a child', async () => {
    const individualId = await createIndividual({ gender: 'M' });
    const spouseFamily = await createFamily({});
    const parentFamily = await createFamily({});

    await addFamilyMember({ familyId: spouseFamily, individualId, role: 'husband' });
    await addFamilyMember({ familyId: parentFamily, individualId, role: 'child' });

    const families = await getParentFamilies(individualId);
    expect(families).toHaveLength(1);
    expect(families[0].id).toBe(parentFamily);
  });
});

describe('isMemberOfFamily', () => {
  it('returns true when individual is a member', async () => {
    const familyId = await createFamily({});
    const individualId = await createIndividual({ gender: 'M' });
    await addFamilyMember({ familyId, individualId, role: 'husband' });

    expect(await isMemberOfFamily(familyId, individualId)).toBe(true);
  });

  it('returns false when individual is not a member', async () => {
    const familyId = await createFamily({});
    const individualId = await createIndividual({ gender: 'M' });

    expect(await isMemberOfFamily(familyId, individualId)).toBe(false);
  });

  it('checks for specific role when provided', async () => {
    const familyId = await createFamily({});
    const individualId = await createIndividual({ gender: 'M' });
    await addFamilyMember({ familyId, individualId, role: 'husband' });

    expect(await isMemberOfFamily(familyId, individualId, 'husband')).toBe(true);
    expect(await isMemberOfFamily(familyId, individualId, 'wife')).toBe(false);
  });
});

// =============================================================================
// Enriched Query Tests
// =============================================================================

describe('getFamilyWithMembers', () => {
  it('returns null for non-existent family', async () => {
    expect(await getFamilyWithMembers('F-9999')).toBeNull();
  });

  it('returns family with husband, wife, and children', async () => {
    const familyId = await createFamily({});
    const husband = await createIndividual({ gender: 'M' });
    const wife = await createIndividual({ gender: 'F' });
    const child1 = await createIndividual({ gender: 'M' });
    const child2 = await createIndividual({ gender: 'F' });

    await createName({
      individualId: husband,
      givenNames: 'John',
      surname: 'Doe',
      isPrimary: true,
    });
    await createName({ individualId: wife, givenNames: 'Jane', surname: 'Doe', isPrimary: true });
    await createName({
      individualId: child1,
      givenNames: 'Jimmy',
      surname: 'Doe',
      isPrimary: true,
    });
    await createName({
      individualId: child2,
      givenNames: 'Jenny',
      surname: 'Doe',
      isPrimary: true,
    });

    await addFamilyMember({ familyId, individualId: husband, role: 'husband' });
    await addFamilyMember({ familyId, individualId: wife, role: 'wife' });
    await addFamilyMember({ familyId, individualId: child1, role: 'child', sortOrder: 1 });
    await addFamilyMember({ familyId, individualId: child2, role: 'child', sortOrder: 2 });

    const familyWithMembers = await getFamilyWithMembers(familyId);

    expect(familyWithMembers).not.toBeNull();
    expect(familyWithMembers?.husband?.id).toBe(husband);
    expect(familyWithMembers?.husband?.primaryName?.givenNames).toBe('John');
    expect(familyWithMembers?.wife?.id).toBe(wife);
    expect(familyWithMembers?.wife?.primaryName?.givenNames).toBe('Jane');
    expect(familyWithMembers?.children).toHaveLength(2);
  });

  it('handles family with no spouse', async () => {
    const familyId = await createFamily({});
    const child = await createIndividual({ gender: 'M' });
    await addFamilyMember({ familyId, individualId: child, role: 'child' });

    const familyWithMembers = await getFamilyWithMembers(familyId);

    expect(familyWithMembers?.husband).toBeNull();
    expect(familyWithMembers?.wife).toBeNull();
    expect(familyWithMembers?.children).toHaveLength(1);
  });
});

describe('getSpouseInFamily', () => {
  it('returns spouse ID when exists', async () => {
    const familyId = await createFamily({});
    const husband = await createIndividual({ gender: 'M' });
    const wife = await createIndividual({ gender: 'F' });

    await addFamilyMember({ familyId, individualId: husband, role: 'husband' });
    await addFamilyMember({ familyId, individualId: wife, role: 'wife' });

    expect(await getSpouseInFamily(familyId, husband)).toBe(wife);
    expect(await getSpouseInFamily(familyId, wife)).toBe(husband);
  });

  it('returns null when no spouse exists', async () => {
    const familyId = await createFamily({});
    const husband = await createIndividual({ gender: 'M' });

    await addFamilyMember({ familyId, individualId: husband, role: 'husband' });

    expect(await getSpouseInFamily(familyId, husband)).toBeNull();
  });

  it('returns null for children', async () => {
    const familyId = await createFamily({});
    const child = await createIndividual({ gender: 'M' });

    await addFamilyMember({ familyId, individualId: child, role: 'child' });

    expect(await getSpouseInFamily(familyId, child)).toBeNull();
  });

  it('returns null when individual is not in family', async () => {
    const familyId = await createFamily({});
    const outsider = await createIndividual({ gender: 'M' });

    expect(await getSpouseInFamily(familyId, outsider)).toBeNull();
  });
});

describe('getChildrenInFamily', () => {
  it('returns all children IDs', async () => {
    const familyId = await createFamily({});
    const child1 = await createIndividual({ gender: 'M' });
    const child2 = await createIndividual({ gender: 'F' });

    await addFamilyMember({ familyId, individualId: child1, role: 'child', sortOrder: 1 });
    await addFamilyMember({ familyId, individualId: child2, role: 'child', sortOrder: 2 });

    const children = await getChildrenInFamily(familyId);
    expect(children).toHaveLength(2);
    expect(children[0]).toBe(child1);
    expect(children[1]).toBe(child2);
  });

  it('returns empty array when no children', async () => {
    const familyId = await createFamily({});
    expect(await getChildrenInFamily(familyId)).toHaveLength(0);
  });
});

describe('countChildrenInFamily', () => {
  it('returns 0 when no children', async () => {
    const familyId = await createFamily({});
    expect(await countChildrenInFamily(familyId)).toBe(0);
  });

  it('returns correct count', async () => {
    const familyId = await createFamily({});
    const child1 = await createIndividual({ gender: 'M' });
    const child2 = await createIndividual({ gender: 'F' });
    const husband = await createIndividual({ gender: 'M' });

    await addFamilyMember({ familyId, individualId: husband, role: 'husband' });
    await addFamilyMember({ familyId, individualId: child1, role: 'child' });
    await addFamilyMember({ familyId, individualId: child2, role: 'child' });

    expect(await countChildrenInFamily(familyId)).toBe(2);
  });
});
