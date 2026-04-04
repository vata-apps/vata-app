import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import {
  getAllSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource,
  searchSources,
  getSourcesByRepositoryId,
  countSources,
} from './sources';
import { createRepository } from './repositories';

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
  db._raw.exec('DELETE FROM sources');
  db._raw.exec('DELETE FROM repositories');
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getAllSources', () => {
  it('returns an empty list when no sources exist', async () => {
    expect(await getAllSources()).toEqual([]);
  });

  it('returns all created sources', async () => {
    await createSource({ title: 'Birth Records' });
    await createSource({ title: 'Census 1901' });
    const sources = await getAllSources();
    expect(sources).toHaveLength(2);
  });

  it('returns sources ordered by title', async () => {
    await createSource({ title: 'Zebra Records' });
    await createSource({ title: 'Alpha Census' });
    const sources = await getAllSources();
    expect(sources[0].title).toBe('Alpha Census');
    expect(sources[1].title).toBe('Zebra Records');
  });
});

describe('getSourceById', () => {
  it('returns the source with matching id', async () => {
    const id = await createSource({ title: 'Birth Records' });
    const source = await getSourceById(id);
    expect(source).not.toBeNull();
    expect(source?.title).toBe('Birth Records');
  });

  it('returns null when no source matches the id', async () => {
    expect(await getSourceById('S-9999')).toBeNull();
  });
});

describe('createSource', () => {
  it('makes the new source retrievable', async () => {
    const id = await createSource({ title: 'Parish Register' });
    const source = await getSourceById(id);
    expect(source).not.toBeNull();
    expect(source?.title).toBe('Parish Register');
  });

  it('stores all fields', async () => {
    const id = await createSource({
      title: 'Birth Records',
      author: 'John Smith',
      publisher: 'Government Press',
      publicationDate: '1920',
      callNumber: 'BR-001',
      url: 'https://example.com/records',
      notes: 'Primary source',
    });
    const source = await getSourceById(id);
    expect(source?.title).toBe('Birth Records');
    expect(source?.author).toBe('John Smith');
    expect(source?.publisher).toBe('Government Press');
    expect(source?.publicationDate).toBe('1920');
    expect(source?.callNumber).toBe('BR-001');
    expect(source?.url).toBe('https://example.com/records');
    expect(source?.notes).toBe('Primary source');
  });

  it('links to a repository', async () => {
    const repoId = await createRepository({ name: 'National Archives' });
    const sourceId = await createSource({ title: 'Census 1901', repositoryId: repoId });
    const source = await getSourceById(sourceId);
    expect(source?.repositoryId).toBe(repoId);
  });

  it('sets defaults for optional fields', async () => {
    const id = await createSource({ title: 'Minimal Source' });
    const source = await getSourceById(id);
    expect(source?.repositoryId).toBeNull();
    expect(source?.author).toBeNull();
    expect(source?.publisher).toBeNull();
    expect(source?.publicationDate).toBeNull();
    expect(source?.callNumber).toBeNull();
    expect(source?.url).toBeNull();
    expect(source?.notes).toBeNull();
  });

  it('returns a formatted ID (S-XXXX)', async () => {
    const id = await createSource({ title: 'Test Source' });
    expect(id).toMatch(/^S-\d{4}$/);
  });
});

describe('updateSource', () => {
  it('changes the title', async () => {
    const id = await createSource({ title: 'Old Title' });
    await updateSource(id, { title: 'New Title' });
    const source = await getSourceById(id);
    expect(source?.title).toBe('New Title');
  });

  it('changes the repository', async () => {
    const repo1 = await createRepository({ name: 'Repo A' });
    const repo2 = await createRepository({ name: 'Repo B' });
    const id = await createSource({ title: 'Source', repositoryId: repo1 });
    await updateSource(id, { repositoryId: repo2 });
    const source = await getSourceById(id);
    expect(source?.repositoryId).toBe(repo2);
  });

  it('updates multiple fields at once', async () => {
    const id = await createSource({ title: 'Old', author: 'Old Author' });
    await updateSource(id, { title: 'New', author: 'New Author', publisher: 'New Press' });
    const source = await getSourceById(id);
    expect(source?.title).toBe('New');
    expect(source?.author).toBe('New Author');
    expect(source?.publisher).toBe('New Press');
  });
});

describe('deleteSource', () => {
  it('removes the source from the list', async () => {
    const id = await createSource({ title: 'To Delete' });
    await deleteSource(id);
    expect(await getSourceById(id)).toBeNull();
  });

  it('does not delete other sources', async () => {
    const id1 = await createSource({ title: 'Keep' });
    const id2 = await createSource({ title: 'Delete' });
    await deleteSource(id2);
    expect(await getSourceById(id1)).not.toBeNull();
  });
});

describe('searchSources', () => {
  it('finds sources by title', async () => {
    await createSource({ title: 'Birth Records' });
    await createSource({ title: 'Census Data' });
    const results = await searchSources('Birth');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Birth Records');
  });

  it('finds sources by author', async () => {
    await createSource({ title: 'Source A', author: 'Jane Doe' });
    await createSource({ title: 'Source B', author: 'John Smith' });
    const results = await searchSources('Jane');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Source A');
  });

  it('returns empty for no match', async () => {
    await createSource({ title: 'Birth Records' });
    const results = await searchSources('NonExistent');
    expect(results).toHaveLength(0);
  });
});

describe('getSourcesByRepositoryId', () => {
  it('returns sources for a given repository', async () => {
    const repoId = await createRepository({ name: 'National Archives' });
    await createSource({ title: 'Source A', repositoryId: repoId });
    await createSource({ title: 'Source B', repositoryId: repoId });
    await createSource({ title: 'Source C' }); // no repo
    const results = await getSourcesByRepositoryId(repoId);
    expect(results).toHaveLength(2);
  });

  it('returns empty for a repository with no sources', async () => {
    const repoId = await createRepository({ name: 'Empty Repo' });
    const results = await getSourcesByRepositoryId(repoId);
    expect(results).toHaveLength(0);
  });
});

describe('countSources', () => {
  it('returns 0 when no sources exist', async () => {
    expect(await countSources()).toBe(0);
  });

  it('returns the correct count', async () => {
    await createSource({ title: 'Source 1' });
    await createSource({ title: 'Source 2' });
    await createSource({ title: 'Source 3' });
    expect(await countSources()).toBe(3);
  });
});
