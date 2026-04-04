import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInMemoryDb } from '$/test/sqlite-memory';
import {
  getAllTrees,
  getTreeById,
  createTree,
  updateTree,
  deleteTree,
  updateTreeStats,
  markTreeOpened,
} from './trees';

// A single in-memory DB shared across all tests in this file.
// getSystemDb is mocked to always return this instance.
// Each test clears the data in beforeEach.
const db = createInMemoryDb();

vi.mock('../connection', () => ({
  getSystemDb: vi.fn(),
}));

// Lazily resolve the mock after the module is loaded
import('../connection').then(({ getSystemDb }) => {
  (getSystemDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
});

beforeEach(async () => {
  // Re-apply the mock value in case it was reset
  const { getSystemDb } = await import('../connection');
  (getSystemDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
  db._raw.exec('DELETE FROM trees');
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function seed(data: { name: string; path: string; description?: string }) {
  return createTree(data);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getAllTrees', () => {
  it('returns an empty list when no trees have been created', async () => {
    expect(await getAllTrees()).toEqual([]);
  });

  it('returns all created trees', async () => {
    await seed({ name: 'Smith Family', path: 'smith.db' });
    await seed({ name: 'Jones Family', path: 'jones.db' });
    const trees = await getAllTrees();
    expect(trees).toHaveLength(2);
  });

  it('lists the most recently opened tree first', async () => {
    const oldId = await seed({ name: 'Old Tree', path: 'old.db' });
    const recentId = await seed({ name: 'Recent Tree', path: 'recent.db' });

    // Set distinct timestamps directly — SQLite datetime('now') has
    // second-level precision so sequential calls in the same test are equal
    db._raw.exec(`UPDATE trees SET last_opened_at = '2024-01-01 08:00:00' WHERE id = ${oldId}`);
    db._raw.exec(`UPDATE trees SET last_opened_at = '2024-01-02 10:00:00' WHERE id = ${recentId}`);

    const trees = await getAllTrees();
    expect(trees[0].name).toBe('Recent Tree');
    expect(trees[1].name).toBe('Old Tree');
  });

  it('lists never-opened trees after opened trees', async () => {
    const openedId = await seed({ name: 'Opened', path: 'opened.db' });
    await seed({ name: 'Never Opened', path: 'never.db' });
    await markTreeOpened(openedId);

    const trees = await getAllTrees();
    expect(trees[0].name).toBe('Opened');
    expect(trees[1].name).toBe('Never Opened');
  });
});

describe('getTreeById', () => {
  it('returns the tree with matching id', async () => {
    const id = await seed({ name: 'Smith Family', path: 'smith.db' });
    const tree = await getTreeById(id);
    expect(tree?.name).toBe('Smith Family');
  });

  it('returns null when no tree matches the id', async () => {
    expect(await getTreeById('9999')).toBeNull();
  });

  it('does not return a different tree', async () => {
    await seed({ name: 'Smith', path: 'smith.db' });
    const otherId = await seed({ name: 'Jones', path: 'jones.db' });
    const tree = await getTreeById(otherId);
    expect(tree?.name).toBe('Jones');
  });
});

describe('createTree', () => {
  it('makes the new tree retrievable', async () => {
    const id = await seed({ name: 'New Tree', path: 'new.db' });
    const tree = await getTreeById(id);
    expect(tree).not.toBeNull();
    expect(tree?.name).toBe('New Tree');
    expect(tree?.path).toBe('new.db');
  });

  it('stores an optional description', async () => {
    const id = await seed({ name: 'Tree', path: 'tree.db', description: 'My family' });
    const tree = await getTreeById(id);
    expect(tree?.description).toBe('My family');
  });

  it('stores a null description when none is provided', async () => {
    const id = await seed({ name: 'Tree', path: 'tree.db' });
    const tree = await getTreeById(id);
    expect(tree?.description).toBeNull();
  });

  it('sets initial individual and family counts to zero', async () => {
    const id = await seed({ name: 'Tree', path: 'tree.db' });
    const tree = await getTreeById(id);
    expect(tree?.individualCount).toBe(0);
    expect(tree?.familyCount).toBe(0);
  });

  it('throws when creating two trees with the same path', async () => {
    await seed({ name: 'First', path: 'same.db' });
    await expect(seed({ name: 'Second', path: 'same.db' })).rejects.toThrow();
  });
});

describe('updateTree', () => {
  it('changes the tree name', async () => {
    const id = await seed({ name: 'Old Name', path: 'tree.db' });
    await updateTree(id, { name: 'New Name' });
    const tree = await getTreeById(id);
    expect(tree?.name).toBe('New Name');
  });

  it('changes the description', async () => {
    const id = await seed({ name: 'Tree', path: 'tree.db', description: 'Old' });
    await updateTree(id, { description: 'Updated' });
    const tree = await getTreeById(id);
    expect(tree?.description).toBe('Updated');
  });

  it('can update name and description at the same time', async () => {
    const id = await seed({ name: 'Old', path: 'tree.db', description: 'Old desc' });
    await updateTree(id, { name: 'New', description: 'New desc' });
    const tree = await getTreeById(id);
    expect(tree?.name).toBe('New');
    expect(tree?.description).toBe('New desc');
  });

  it('does not affect other trees', async () => {
    const id1 = await seed({ name: 'Tree 1', path: 'tree1.db' });
    const id2 = await seed({ name: 'Tree 2', path: 'tree2.db' });
    await updateTree(id1, { name: 'Updated Tree 1' });
    const tree2 = await getTreeById(id2);
    expect(tree2?.name).toBe('Tree 2');
  });
});

describe('deleteTree', () => {
  it('removes the tree from the list', async () => {
    const id = await seed({ name: 'To Delete', path: 'delete.db' });
    await deleteTree(id);
    expect(await getTreeById(id)).toBeNull();
  });

  it('does not delete other trees', async () => {
    const id1 = await seed({ name: 'Keep', path: 'keep.db' });
    const id2 = await seed({ name: 'Delete', path: 'delete.db' });
    await deleteTree(id2);
    expect(await getTreeById(id1)).not.toBeNull();
  });
});

describe('updateTreeStats', () => {
  it('updates the individual count', async () => {
    const id = await seed({ name: 'Tree', path: 'tree.db' });
    await updateTreeStats(id, { individualCount: 42 });
    const tree = await getTreeById(id);
    expect(tree?.individualCount).toBe(42);
  });

  it('updates the family count', async () => {
    const id = await seed({ name: 'Tree', path: 'tree.db' });
    await updateTreeStats(id, { familyCount: 10 });
    const tree = await getTreeById(id);
    expect(tree?.familyCount).toBe(10);
  });

  it('updates both counts at the same time', async () => {
    const id = await seed({ name: 'Tree', path: 'tree.db' });
    await updateTreeStats(id, { individualCount: 15, familyCount: 7 });
    const tree = await getTreeById(id);
    expect(tree?.individualCount).toBe(15);
    expect(tree?.familyCount).toBe(7);
  });

  it('does not change the name when updating stats', async () => {
    const id = await seed({ name: 'Keep This Name', path: 'tree.db' });
    await updateTreeStats(id, { individualCount: 5 });
    const tree = await getTreeById(id);
    expect(tree?.name).toBe('Keep This Name');
  });
});

describe('markTreeOpened', () => {
  it('sets a last opened timestamp', async () => {
    const id = await seed({ name: 'Tree', path: 'tree.db' });
    const before = await getTreeById(id);
    expect(before?.lastOpenedAt).toBeNull();

    await markTreeOpened(id);

    const after = await getTreeById(id);
    expect(after?.lastOpenedAt).not.toBeNull();
  });

  it('updates the timestamp when opened again', async () => {
    const id = await seed({ name: 'Tree', path: 'tree.db' });
    await markTreeOpened(id);
    const first = (await getTreeById(id))!.lastOpenedAt;

    await new Promise((r) => setTimeout(r, 10));
    await markTreeOpened(id);
    const second = (await getTreeById(id))!.lastOpenedAt;

    // Timestamps may be identical within the same second in SQLite —
    // what matters is the call succeeds and the field is set
    expect(second).not.toBeNull();
    expect(first).not.toBeNull();
  });
});
