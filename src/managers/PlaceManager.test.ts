import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import { createPlace } from '$db-tree/places';
import { PlaceManager } from './PlaceManager';

const db = createTreeInMemoryDb();

vi.mock('$/db/connection', () => ({
  getTreeDb: vi.fn(),
}));

beforeEach(async () => {
  const { getTreeDb } = await import('$/db/connection');
  (getTreeDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
  db._raw.exec('DELETE FROM places');
});

describe('PlaceManager.getAll', () => {
  it('returns an empty array when the tree has no places', async () => {
    expect(await PlaceManager.getAll()).toEqual([]);
  });

  it('returns mapped Place entities ordered by full_name', async () => {
    await createPlace({ name: 'Paris', fullName: 'France, Île-de-France, Paris' });
    await createPlace({ name: 'Lyon', fullName: 'France, Auvergne-Rhône-Alpes, Lyon' });
    await createPlace({ name: 'Bordeaux', fullName: 'France, Nouvelle-Aquitaine, Bordeaux' });

    const results = await PlaceManager.getAll();

    expect(results).toHaveLength(3);
    expect(results[0].fullName).toBe('France, Auvergne-Rhône-Alpes, Lyon');
    expect(results[1].fullName).toBe('France, Nouvelle-Aquitaine, Bordeaux');
    expect(results[2].fullName).toBe('France, Île-de-France, Paris');
  });

  it('returns a formatted entity ID with the P prefix', async () => {
    await createPlace({ name: 'Montréal', fullName: 'Canada, Québec, Montréal' });

    const results = await PlaceManager.getAll();

    expect(results).toHaveLength(1);
    expect(results[0].id).toMatch(/^P-\d{4}$/);
  });

  it('maps parentId to the formatted entity ID when set', async () => {
    const parentId = await createPlace({ name: 'Québec', fullName: 'Canada, Québec' });
    await createPlace({ name: 'Montréal', fullName: 'Canada, Québec, Montréal', parentId });

    const results = await PlaceManager.getAll();

    const child = results.find((p) => p.name === 'Montréal');
    expect(child?.parentId).toBe(parentId);
  });

  it('maps parentId to null for root places', async () => {
    await createPlace({ name: 'Canada', fullName: 'Canada' });

    const results = await PlaceManager.getAll();

    expect(results[0].parentId).toBeNull();
  });
});

describe('PlaceManager.getById', () => {
  it('returns null for a missing ID', async () => {
    expect(await PlaceManager.getById('P-9999')).toBeNull();
  });

  it('returns the mapped Place for a present ID', async () => {
    const id = await createPlace({ name: 'Lyon', fullName: 'France, Auvergne-Rhône-Alpes, Lyon' });

    const result = await PlaceManager.getById(id);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(id);
    expect(result?.name).toBe('Lyon');
    expect(result?.fullName).toBe('France, Auvergne-Rhône-Alpes, Lyon');
  });

  it('round-trips the formatted entity ID', async () => {
    const id = await createPlace({ name: 'Paris', fullName: 'France, Île-de-France, Paris' });

    const result = await PlaceManager.getById(id);

    expect(result?.id).toBe(id);
    expect(result?.id).toMatch(/^P-\d{4}$/);
  });
});
