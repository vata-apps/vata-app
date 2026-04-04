import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import {
  getAllRepositories,
  getRepositoryById,
  createRepository,
  updateRepository,
  deleteRepository,
  searchRepositories,
  countRepositories,
} from './repositories';

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
  db._raw.exec('DELETE FROM repositories');
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getAllRepositories', () => {
  it('returns an empty list when no repositories exist', async () => {
    expect(await getAllRepositories()).toEqual([]);
  });

  it('returns all created repositories', async () => {
    await createRepository({ name: 'National Archives' });
    await createRepository({ name: 'State Library' });
    const repos = await getAllRepositories();
    expect(repos).toHaveLength(2);
  });

  it('returns repositories ordered by name', async () => {
    await createRepository({ name: 'Zebra Archives' });
    await createRepository({ name: 'Alpha Library' });
    const repos = await getAllRepositories();
    expect(repos[0].name).toBe('Alpha Library');
    expect(repos[1].name).toBe('Zebra Archives');
  });
});

describe('getRepositoryById', () => {
  it('returns the repository with matching id', async () => {
    const id = await createRepository({ name: 'National Archives' });
    const repo = await getRepositoryById(id);
    expect(repo).not.toBeNull();
    expect(repo?.name).toBe('National Archives');
  });

  it('returns null when no repository matches the id', async () => {
    expect(await getRepositoryById('R-9999')).toBeNull();
  });
});

describe('createRepository', () => {
  it('makes the new repository retrievable', async () => {
    const id = await createRepository({ name: 'City Hall' });
    const repo = await getRepositoryById(id);
    expect(repo).not.toBeNull();
    expect(repo?.name).toBe('City Hall');
  });

  it('stores all fields', async () => {
    const id = await createRepository({
      name: 'National Archives',
      address: '700 Pennsylvania Ave',
      city: 'Washington',
      country: 'USA',
      phone: '202-357-5000',
      email: 'inquire@nara.gov',
      website: 'https://nara.gov',
      notes: 'Main facility',
    });
    const repo = await getRepositoryById(id);
    expect(repo?.name).toBe('National Archives');
    expect(repo?.address).toBe('700 Pennsylvania Ave');
    expect(repo?.city).toBe('Washington');
    expect(repo?.country).toBe('USA');
    expect(repo?.phone).toBe('202-357-5000');
    expect(repo?.email).toBe('inquire@nara.gov');
    expect(repo?.website).toBe('https://nara.gov');
    expect(repo?.notes).toBe('Main facility');
  });

  it('sets defaults for optional fields', async () => {
    const id = await createRepository({ name: 'Minimal Repo' });
    const repo = await getRepositoryById(id);
    expect(repo?.address).toBeNull();
    expect(repo?.city).toBeNull();
    expect(repo?.country).toBeNull();
    expect(repo?.phone).toBeNull();
    expect(repo?.email).toBeNull();
    expect(repo?.website).toBeNull();
    expect(repo?.notes).toBeNull();
  });

  it('returns a formatted ID (R-XXXX)', async () => {
    const id = await createRepository({ name: 'Test Repo' });
    expect(id).toMatch(/^R-\d{4}$/);
  });
});

describe('updateRepository', () => {
  it('changes the name', async () => {
    const id = await createRepository({ name: 'Old Name' });
    await updateRepository(id, { name: 'New Name' });
    const repo = await getRepositoryById(id);
    expect(repo?.name).toBe('New Name');
  });

  it('changes the address', async () => {
    const id = await createRepository({ name: 'Repo', address: '123 Main St' });
    await updateRepository(id, { address: '456 Oak Ave' });
    const repo = await getRepositoryById(id);
    expect(repo?.address).toBe('456 Oak Ave');
  });

  it('updates multiple fields at once', async () => {
    const id = await createRepository({ name: 'Old', city: 'Old City' });
    await updateRepository(id, { name: 'New', city: 'New City', country: 'Canada' });
    const repo = await getRepositoryById(id);
    expect(repo?.name).toBe('New');
    expect(repo?.city).toBe('New City');
    expect(repo?.country).toBe('Canada');
  });
});

describe('deleteRepository', () => {
  it('removes the repository from the list', async () => {
    const id = await createRepository({ name: 'To Delete' });
    await deleteRepository(id);
    expect(await getRepositoryById(id)).toBeNull();
  });

  it('does not delete other repositories', async () => {
    const id1 = await createRepository({ name: 'Keep' });
    const id2 = await createRepository({ name: 'Delete' });
    await deleteRepository(id2);
    expect(await getRepositoryById(id1)).not.toBeNull();
  });
});

describe('searchRepositories', () => {
  it('finds repositories by name', async () => {
    await createRepository({ name: 'National Archives' });
    await createRepository({ name: 'State Library' });
    const results = await searchRepositories('National');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('National Archives');
  });

  it('returns empty for no match', async () => {
    await createRepository({ name: 'National Archives' });
    const results = await searchRepositories('NonExistent');
    expect(results).toHaveLength(0);
  });

  it('escapes special characters in search', async () => {
    await createRepository({ name: '100% Complete' });
    const results = await searchRepositories('100%');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('100% Complete');
  });
});

describe('countRepositories', () => {
  it('returns 0 when no repositories exist', async () => {
    expect(await countRepositories()).toBe(0);
  });

  it('returns the correct count', async () => {
    await createRepository({ name: 'Repo 1' });
    await createRepository({ name: 'Repo 2' });
    await createRepository({ name: 'Repo 3' });
    expect(await countRepositories()).toBe(3);
  });
});
