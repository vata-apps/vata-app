import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { parseEntityId } from '$/lib/entityId';
import {
  getAllIndividuals,
  getIndividualById,
  createIndividual,
  updateIndividual,
  deleteIndividual,
  countIndividuals,
  searchIndividuals,
} from './individuals';

// A single in-memory DB shared across all tests in this file.
// getTreeDb is mocked to always return this instance.
// Each test clears the data in beforeEach.
const db = createTreeInMemoryDb();

vi.mock('../connection', () => ({
  getTreeDb: vi.fn(),
}));

// Lazily resolve the mock after the module is loaded
import('../connection').then(({ getTreeDb }) => {
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
});

beforeEach(async () => {
  // Re-apply the mock value in case it was reset
  const { getTreeDb } = await import('../connection');
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
  db._raw.exec('DELETE FROM names');
  db._raw.exec('DELETE FROM individuals');
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getAllIndividuals', () => {
  it('returns an empty list when no individuals exist', async () => {
    expect(await getAllIndividuals()).toEqual([]);
  });

  it('returns all created individuals', async () => {
    await createIndividual({ gender: 'M' });
    await createIndividual({ gender: 'F' });
    const individuals = await getAllIndividuals();
    expect(individuals).toHaveLength(2);
  });

  it('returns individuals ordered by ID', async () => {
    const id1 = await createIndividual({ gender: 'M' });
    const id2 = await createIndividual({ gender: 'F' });
    const individuals = await getAllIndividuals();
    expect(individuals[0].id).toBe(id1);
    expect(individuals[1].id).toBe(id2);
  });
});

describe('getIndividualById', () => {
  it('returns the individual with matching id', async () => {
    const id = await createIndividual({ gender: 'M', isLiving: true });
    const individual = await getIndividualById(id);
    expect(individual).not.toBeNull();
    expect(individual?.gender).toBe('M');
    expect(individual?.isLiving).toBe(true);
  });

  it('returns null when no individual matches the id', async () => {
    expect(await getIndividualById('I-9999')).toBeNull();
  });

  it('does not return a different individual', async () => {
    await createIndividual({ gender: 'M' });
    const id2 = await createIndividual({ gender: 'F' });
    const individual = await getIndividualById(id2);
    expect(individual?.gender).toBe('F');
  });
});

describe('createIndividual', () => {
  it('creates an individual with default values', async () => {
    const id = await createIndividual({});
    const individual = await getIndividualById(id);
    expect(individual).not.toBeNull();
    expect(individual?.gender).toBe('U');
    expect(individual?.isLiving).toBe(true);
    expect(individual?.notes).toBeNull();
  });

  it('creates an individual with specified gender', async () => {
    const id = await createIndividual({ gender: 'F' });
    const individual = await getIndividualById(id);
    expect(individual?.gender).toBe('F');
  });

  it('creates a deceased individual', async () => {
    const id = await createIndividual({ isLiving: false });
    const individual = await getIndividualById(id);
    expect(individual?.isLiving).toBe(false);
  });

  it('creates an individual with notes', async () => {
    const id = await createIndividual({ notes: 'Test notes' });
    const individual = await getIndividualById(id);
    expect(individual?.notes).toBe('Test notes');
  });

  it('returns a formatted ID (I-XXXX)', async () => {
    const id = await createIndividual({});
    expect(id).toMatch(/^I-\d{4}$/);
  });
});

describe('updateIndividual', () => {
  it('updates the gender', async () => {
    const id = await createIndividual({ gender: 'U' });
    await updateIndividual(id, { gender: 'M' });
    const individual = await getIndividualById(id);
    expect(individual?.gender).toBe('M');
  });

  it('updates the living status', async () => {
    const id = await createIndividual({ isLiving: true });
    await updateIndividual(id, { isLiving: false });
    const individual = await getIndividualById(id);
    expect(individual?.isLiving).toBe(false);
  });

  it('updates the notes', async () => {
    const id = await createIndividual({});
    await updateIndividual(id, { notes: 'Updated notes' });
    const individual = await getIndividualById(id);
    expect(individual?.notes).toBe('Updated notes');
  });

  it('can update multiple fields at once', async () => {
    const id = await createIndividual({ gender: 'U', isLiving: true });
    await updateIndividual(id, { gender: 'F', isLiving: false, notes: 'New notes' });
    const individual = await getIndividualById(id);
    expect(individual?.gender).toBe('F');
    expect(individual?.isLiving).toBe(false);
    expect(individual?.notes).toBe('New notes');
  });

  it('does not affect other individuals', async () => {
    const id1 = await createIndividual({ gender: 'M' });
    const id2 = await createIndividual({ gender: 'F' });
    await updateIndividual(id1, { gender: 'U' });
    const individual2 = await getIndividualById(id2);
    expect(individual2?.gender).toBe('F');
  });
});

describe('deleteIndividual', () => {
  it('removes the individual', async () => {
    const id = await createIndividual({});
    await deleteIndividual(id);
    expect(await getIndividualById(id)).toBeNull();
  });

  it('does not delete other individuals', async () => {
    const id1 = await createIndividual({});
    const id2 = await createIndividual({});
    await deleteIndividual(id2);
    expect(await getIndividualById(id1)).not.toBeNull();
  });
});

describe('countIndividuals', () => {
  it('returns 0 when no individuals exist', async () => {
    expect(await countIndividuals()).toBe(0);
  });

  it('returns the correct count', async () => {
    await createIndividual({});
    await createIndividual({});
    await createIndividual({});
    expect(await countIndividuals()).toBe(3);
  });
});

describe('searchIndividuals', () => {
  it('finds individuals by given name', async () => {
    const id = await createIndividual({ gender: 'M' });
    const dbId = parseEntityId(id);
    // Insert a name directly for this test
    db._raw.exec(
      `INSERT INTO names (individual_id, given_names, surname, is_primary) VALUES (${dbId}, 'John', 'Doe', 1)`
    );

    const results = await searchIndividuals('John');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(id);
  });

  it('finds individuals by surname', async () => {
    const id = await createIndividual({ gender: 'F' });
    const dbId = parseEntityId(id);
    db._raw.exec(
      `INSERT INTO names (individual_id, given_names, surname, is_primary) VALUES (${dbId}, 'Jane', 'Smith', 1)`
    );

    const results = await searchIndividuals('Smith');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(id);
  });

  it('returns empty when no match', async () => {
    const id = await createIndividual({});
    const dbId = parseEntityId(id);
    db._raw.exec(
      `INSERT INTO names (individual_id, given_names, surname, is_primary) VALUES (${dbId}, 'John', 'Doe', 1)`
    );

    const results = await searchIndividuals('NonExistent');
    expect(results).toHaveLength(0);
  });

  it('performs partial matching', async () => {
    const id = await createIndividual({});
    const dbId = parseEntityId(id);
    db._raw.exec(
      `INSERT INTO names (individual_id, given_names, surname, is_primary) VALUES (${dbId}, 'Jonathan', 'Doerr', 1)`
    );

    const results = await searchIndividuals('Jon');
    expect(results).toHaveLength(1);
  });
});
