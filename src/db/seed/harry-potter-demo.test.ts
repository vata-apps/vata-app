import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInMemoryDb, createTreeInMemoryDb } from '$/test/sqlite-memory';

const systemDb = createInMemoryDb();
const treeDb = createTreeInMemoryDb();

vi.mock('../connection', () => ({
  getSystemDb: vi.fn(),
  openTreeDb: vi.fn(),
  getTreeDb: vi.fn(),
  closeTreeDb: vi.fn(),
}));

vi.mock('@tauri-apps/api/path', () => ({
  // appDataDir returns no trailing slash on macOS
  appDataDir: vi.fn().mockResolvedValue('/mock/app-data'),
}));

// Lazily resolve the mock after the module is loaded
import('../connection').then((mod) => {
  (mod.getSystemDb as ReturnType<typeof vi.fn>).mockResolvedValue(systemDb);
  (mod.openTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(treeDb);
  (mod.getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(treeDb);
  (mod.closeTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
});

beforeEach(async () => {
  const mod = await import('../connection');
  (mod.getSystemDb as ReturnType<typeof vi.fn>).mockResolvedValue(systemDb);
  (mod.openTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(treeDb);
  (mod.getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(treeDb);
  (mod.closeTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

  // Clear all data
  systemDb._raw.exec('DELETE FROM app_settings');
  systemDb._raw.exec('DELETE FROM trees');
  treeDb._raw.exec('DELETE FROM event_participants');
  treeDb._raw.exec('DELETE FROM events');
  treeDb._raw.exec('DELETE FROM family_members');
  treeDb._raw.exec('DELETE FROM families');
  treeDb._raw.exec('DELETE FROM names');
  treeDb._raw.exec('DELETE FROM individuals');
  treeDb._raw.exec('DELETE FROM places');
});

describe('seedHarryPotterDemo', () => {
  it('creates 35 individuals, 10 families, 4 places, and events', async () => {
    const { seedHarryPotterDemo } = await import('./harry-potter-demo');
    await seedHarryPotterDemo(systemDb);

    const individuals = treeDb._raw.prepare('SELECT COUNT(*) as count FROM individuals').get() as {
      count: number;
    };
    expect(individuals.count).toBe(35);

    const families = treeDb._raw.prepare('SELECT COUNT(*) as count FROM families').get() as {
      count: number;
    };
    expect(families.count).toBe(10);

    const places = treeDb._raw.prepare('SELECT COUNT(*) as count FROM places').get() as {
      count: number;
    };
    expect(places.count).toBe(4);

    const events = treeDb._raw.prepare('SELECT COUNT(*) as count FROM events').get() as {
      count: number;
    };
    // 23 births + 5 deaths + 10 marriages = 38
    expect(events.count).toBe(38);

    const names = treeDb._raw.prepare('SELECT COUNT(*) as count FROM names').get() as {
      count: number;
    };
    // 35 birth names + married names for: Lily, Ginny, Petunia, Molly, Fleur, Angelina, Hermione = 42
    expect(names.count).toBe(42);
  });

  it('creates a tree entry in system DB', async () => {
    const { seedHarryPotterDemo } = await import('./harry-potter-demo');
    await seedHarryPotterDemo(systemDb);

    const tree = systemDb._raw
      .prepare('SELECT name, path, description FROM trees LIMIT 1')
      .get() as { name: string; path: string; description: string };
    expect(tree.name).toBe('Harry Potter Family');
    expect(tree.path).toContain('harry-potter-family');
  });

  it('sets demo_tree_seeded flag in app_settings', async () => {
    const { seedHarryPotterDemo } = await import('./harry-potter-demo');
    await seedHarryPotterDemo(systemDb);

    const setting = systemDb._raw
      .prepare("SELECT value FROM app_settings WHERE key = 'demo_tree_seeded'")
      .get() as { value: string };
    expect(setting.value).toBe('true');
  });

  it('is idempotent — does not re-seed when flag is already set', async () => {
    const { seedHarryPotterDemo } = await import('./harry-potter-demo');

    // First seed
    await seedHarryPotterDemo(systemDb);

    // Clear tree data but keep the flag
    treeDb._raw.exec('DELETE FROM event_participants');
    treeDb._raw.exec('DELETE FROM events');
    treeDb._raw.exec('DELETE FROM family_members');
    treeDb._raw.exec('DELETE FROM families');
    treeDb._raw.exec('DELETE FROM names');
    treeDb._raw.exec('DELETE FROM individuals');
    treeDb._raw.exec('DELETE FROM places');

    // Second call should be a no-op
    await seedHarryPotterDemo(systemDb);

    const individuals = treeDb._raw.prepare('SELECT COUNT(*) as count FROM individuals').get() as {
      count: number;
    };
    expect(individuals.count).toBe(0);
  });

  it('updates tree stats with correct counts', async () => {
    const { seedHarryPotterDemo } = await import('./harry-potter-demo');
    await seedHarryPotterDemo(systemDb);

    const tree = systemDb._raw
      .prepare('SELECT individual_count, family_count FROM trees LIMIT 1')
      .get() as { individual_count: number; family_count: number };
    expect(tree.individual_count).toBe(35);
    expect(tree.family_count).toBe(10);
  });

  it('creates primary birth names for all individuals', async () => {
    const { seedHarryPotterDemo } = await import('./harry-potter-demo');
    await seedHarryPotterDemo(systemDb);

    const primaryNames = treeDb._raw
      .prepare("SELECT COUNT(*) as count FROM names WHERE is_primary = 1 AND type = 'birth'")
      .get() as { count: number };
    expect(primaryNames.count).toBe(35);
  });

  it('assigns birth events to individuals with known dates', async () => {
    const { seedHarryPotterDemo } = await import('./harry-potter-demo');
    await seedHarryPotterDemo(systemDb);

    // Harry should have a birth event at Godric's Hollow
    const harryBirth = treeDb._raw
      .prepare(
        `SELECT e.date_original, p.name as place_name
         FROM events e
         INNER JOIN event_participants ep ON ep.event_id = e.id
         INNER JOIN event_types et ON et.id = e.event_type_id
         LEFT JOIN places p ON p.id = e.place_id
         INNER JOIN individuals i ON i.id = ep.individual_id
         INNER JOIN names n ON n.individual_id = i.id AND n.is_primary = 1
         WHERE et.tag = 'BIRT' AND n.given_names = 'Harry James'`
      )
      .get() as { date_original: string; place_name: string };
    expect(harryBirth.date_original).toBe('31 JUL 1980');
    expect(harryBirth.place_name).toBe("Godric's Hollow");
  });
});
