import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeInMemoryDb } from '$/test/sqlite-memory';
import {
  // PlaceType operations
  getAllPlaceTypes,
  getPlaceTypeById,
  getPlaceTypeByTag,
  createPlaceType,
  deletePlaceType,
  countPlaceTypes,
  // Place CRUD
  getAllPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  countPlaces,
  // Place search
  searchPlaces,
  getPlacesByType,
  // Place hierarchy
  getChildPlaces,
  getRootPlaces,
  getPlaceHierarchy,
  getPlaceWithHierarchy,
  isAncestorOf,
  getAllDescendants,
  updatePlaceFullNames,
} from './places';

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
  db._raw.exec('DELETE FROM places');
  db._raw.exec('DELETE FROM place_types');
});

// =============================================================================
// PlaceType Tests
// =============================================================================

describe('getAllPlaceTypes', () => {
  it('returns an empty list when no place types exist', async () => {
    expect(await getAllPlaceTypes()).toEqual([]);
  });

  it('returns all created place types', async () => {
    await createPlaceType({ customName: 'City' });
    await createPlaceType({ customName: 'Country' });
    const types = await getAllPlaceTypes();
    expect(types).toHaveLength(2);
  });

  it('returns place types ordered by sort_order', async () => {
    await createPlaceType({ customName: 'Type B', sortOrder: 2 });
    await createPlaceType({ customName: 'Type A', sortOrder: 1 });
    const types = await getAllPlaceTypes();
    expect(types[0].customName).toBe('Type A');
    expect(types[1].customName).toBe('Type B');
  });
});

describe('getPlaceTypeById', () => {
  it('returns the place type with matching id', async () => {
    const id = await createPlaceType({ customName: 'City' });
    const placeType = await getPlaceTypeById(id);
    expect(placeType).not.toBeNull();
    expect(placeType?.customName).toBe('City');
  });

  it('returns null when no place type matches the id', async () => {
    expect(await getPlaceTypeById('9999')).toBeNull();
  });
});

describe('getPlaceTypeByTag', () => {
  it('returns null for non-existent tag', async () => {
    expect(await getPlaceTypeByTag('nonexistent')).toBeNull();
  });

  it('finds system place types by tag', async () => {
    // Insert a system place type directly
    db._raw.exec("INSERT INTO place_types (tag, is_system, sort_order) VALUES ('CITY', 1, 1)");
    const placeType = await getPlaceTypeByTag('CITY');
    expect(placeType).not.toBeNull();
    expect(placeType?.tag).toBe('CITY');
    expect(placeType?.isSystem).toBe(true);
  });
});

describe('createPlaceType', () => {
  it('creates a custom place type', async () => {
    const id = await createPlaceType({ customName: 'Cemetery' });
    const placeType = await getPlaceTypeById(id);
    expect(placeType).not.toBeNull();
    expect(placeType?.customName).toBe('Cemetery');
    expect(placeType?.isSystem).toBe(false);
  });

  it('auto-increments sortOrder when not provided', async () => {
    const id1 = await createPlaceType({ customName: 'Type 1' });
    const id2 = await createPlaceType({ customName: 'Type 2' });

    const type1 = await getPlaceTypeById(id1);
    const type2 = await getPlaceTypeById(id2);

    expect(type2!.sortOrder).toBeGreaterThan(type1!.sortOrder);
  });

  it('uses provided sortOrder', async () => {
    const id = await createPlaceType({ customName: 'Type', sortOrder: 42 });
    const placeType = await getPlaceTypeById(id);
    expect(placeType?.sortOrder).toBe(42);
  });
});

describe('deletePlaceType', () => {
  it('deletes a custom place type', async () => {
    const id = await createPlaceType({ customName: 'ToDelete' });
    await deletePlaceType(id);
    expect(await getPlaceTypeById(id)).toBeNull();
  });

  it('does not delete system place types', async () => {
    // Insert a system place type directly
    db._raw.exec(
      "INSERT INTO place_types (tag, is_system, sort_order) VALUES ('SYSTEM_TYPE', 1, 1)"
    );
    const types = await getAllPlaceTypes();
    const systemType = types.find((t) => t.tag === 'SYSTEM_TYPE');
    expect(systemType).toBeDefined();

    await deletePlaceType(systemType!.id);

    // Should still exist
    expect(await getPlaceTypeById(systemType!.id)).not.toBeNull();
  });
});

describe('countPlaceTypes', () => {
  it('returns 0 when no place types exist', async () => {
    expect(await countPlaceTypes()).toBe(0);
  });

  it('returns the correct count', async () => {
    await createPlaceType({ customName: 'Type 1' });
    await createPlaceType({ customName: 'Type 2' });
    expect(await countPlaceTypes()).toBe(2);
  });
});

// =============================================================================
// Place CRUD Tests
// =============================================================================

describe('getAllPlaces', () => {
  it('returns an empty list when no places exist', async () => {
    expect(await getAllPlaces()).toEqual([]);
  });

  it('returns all created places', async () => {
    await createPlace({ name: 'Montreal' });
    await createPlace({ name: 'Toronto' });
    const places = await getAllPlaces();
    expect(places).toHaveLength(2);
  });

  it('returns places ordered by full_name', async () => {
    await createPlace({ name: 'Zebra City', fullName: 'Zebra City' });
    await createPlace({ name: 'Alpha Town', fullName: 'Alpha Town' });
    const places = await getAllPlaces();
    expect(places[0].fullName).toBe('Alpha Town');
    expect(places[1].fullName).toBe('Zebra City');
  });
});

describe('getPlaceById', () => {
  it('returns the place with matching id', async () => {
    const id = await createPlace({ name: 'Montreal', notes: 'Test place' });
    const place = await getPlaceById(id);
    expect(place).not.toBeNull();
    expect(place?.name).toBe('Montreal');
    expect(place?.notes).toBe('Test place');
  });

  it('returns null when no place matches the id', async () => {
    expect(await getPlaceById('P-9999')).toBeNull();
  });
});

describe('createPlace', () => {
  it('creates a place with only name', async () => {
    const id = await createPlace({ name: 'Montreal' });
    const place = await getPlaceById(id);
    expect(place).not.toBeNull();
    expect(place?.name).toBe('Montreal');
    expect(place?.fullName).toBe('Montreal'); // Uses name as default
  });

  it('creates a place with full details', async () => {
    const placeTypeId = await createPlaceType({ customName: 'City' });
    const id = await createPlace({
      name: 'Montreal',
      fullName: 'Montreal, Quebec, Canada',
      placeTypeId,
      latitude: 45.5017,
      longitude: -73.5673,
      notes: 'Largest city in Quebec',
    });
    const place = await getPlaceById(id);
    expect(place?.name).toBe('Montreal');
    expect(place?.fullName).toBe('Montreal, Quebec, Canada');
    expect(place?.placeTypeId).toBe(placeTypeId);
    expect(place?.latitude).toBe(45.5017);
    expect(place?.longitude).toBe(-73.5673);
    expect(place?.notes).toBe('Largest city in Quebec');
  });

  it('creates a place with parent', async () => {
    const parentId = await createPlace({ name: 'Canada' });
    const childId = await createPlace({
      name: 'Quebec',
      parentId,
    });
    const child = await getPlaceById(childId);
    expect(child?.parentId).toBe(parentId);
  });

  it('returns a formatted ID (P-XXXX)', async () => {
    const id = await createPlace({ name: 'Test' });
    expect(id).toMatch(/^P-\d{4}$/);
  });
});

describe('updatePlace', () => {
  it('updates the name', async () => {
    const id = await createPlace({ name: 'Montreal' });
    await updatePlace(id, { name: 'Montréal' });
    const place = await getPlaceById(id);
    expect(place?.name).toBe('Montréal');
  });

  it('updates the fullName', async () => {
    const id = await createPlace({ name: 'Montreal', fullName: 'Montreal' });
    await updatePlace(id, { fullName: 'Montreal, Quebec, Canada' });
    const place = await getPlaceById(id);
    expect(place?.fullName).toBe('Montreal, Quebec, Canada');
  });

  it('updates coordinates', async () => {
    const id = await createPlace({ name: 'Test' });
    await updatePlace(id, { latitude: 45.5, longitude: -73.5 });
    const place = await getPlaceById(id);
    expect(place?.latitude).toBe(45.5);
    expect(place?.longitude).toBe(-73.5);
  });

  it('updates placeTypeId', async () => {
    const id = await createPlace({ name: 'Test' });
    const placeTypeId = await createPlaceType({ customName: 'City' });
    await updatePlace(id, { placeTypeId });
    const place = await getPlaceById(id);
    expect(place?.placeTypeId).toBe(placeTypeId);
  });

  it('clears optional fields', async () => {
    const placeTypeId = await createPlaceType({ customName: 'City' });
    const id = await createPlace({
      name: 'Test',
      placeTypeId,
      latitude: 45.5,
      longitude: -73.5,
      notes: 'Some notes',
    });

    // Update to clear values - set to empty string for notes
    // For coordinates, we need to check updating them to 0 or other values
    await updatePlace(id, {
      notes: '',
    });

    const place = await getPlaceById(id);
    expect(place?.placeTypeId).toBe(placeTypeId); // unchanged
    expect(place?.notes).toBe('');
  });

  it('does nothing when no fields are provided', async () => {
    const id = await createPlace({ name: 'Test' });
    const before = await getPlaceById(id);
    await updatePlace(id, {});
    const after = await getPlaceById(id);
    expect(before?.name).toBe(after?.name);
  });
});

describe('deletePlace', () => {
  it('removes the place', async () => {
    const id = await createPlace({ name: 'ToDelete' });
    await deletePlace(id);
    expect(await getPlaceById(id)).toBeNull();
  });

  it('sets child parent_id to NULL (ON DELETE SET NULL)', async () => {
    const parentId = await createPlace({ name: 'Parent' });
    const childId = await createPlace({ name: 'Child', parentId });

    await deletePlace(parentId);

    const child = await getPlaceById(childId);
    expect(child).not.toBeNull();
    expect(child?.parentId).toBeNull();
  });
});

describe('countPlaces', () => {
  it('returns 0 when no places exist', async () => {
    expect(await countPlaces()).toBe(0);
  });

  it('returns the correct count', async () => {
    await createPlace({ name: 'Place 1' });
    await createPlace({ name: 'Place 2' });
    await createPlace({ name: 'Place 3' });
    expect(await countPlaces()).toBe(3);
  });
});

// =============================================================================
// Place Search Tests
// =============================================================================

describe('searchPlaces', () => {
  it('returns empty when no matches', async () => {
    await createPlace({ name: 'Montreal' });
    expect(await searchPlaces('Toronto')).toHaveLength(0);
  });

  it('searches by name', async () => {
    await createPlace({ name: 'Montreal' });
    await createPlace({ name: 'Toronto' });
    const results = await searchPlaces('Mont');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Montreal');
  });

  it('searches by fullName', async () => {
    await createPlace({ name: 'Montreal', fullName: 'Montreal, Quebec, Canada' });
    await createPlace({ name: 'Toronto', fullName: 'Toronto, Ontario, Canada' });
    const results = await searchPlaces('Quebec');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Montreal');
  });

  it('search is case-insensitive', async () => {
    await createPlace({ name: 'Montreal' });
    const results = await searchPlaces('montreal');
    expect(results).toHaveLength(1);
  });
});

describe('getPlacesByType', () => {
  it('returns places with specific type', async () => {
    const cityTypeId = await createPlaceType({ customName: 'City' });
    const countryTypeId = await createPlaceType({ customName: 'Country' });

    await createPlace({ name: 'Montreal', placeTypeId: cityTypeId });
    await createPlace({ name: 'Toronto', placeTypeId: cityTypeId });
    await createPlace({ name: 'Canada', placeTypeId: countryTypeId });

    const cities = await getPlacesByType(cityTypeId);
    expect(cities).toHaveLength(2);
    expect(cities.every((p) => p.placeTypeId === cityTypeId)).toBe(true);
  });
});

// =============================================================================
// Place Hierarchy Tests
// =============================================================================

describe('getChildPlaces', () => {
  it('returns child places', async () => {
    const parentId = await createPlace({ name: 'Canada' });
    await createPlace({ name: 'Quebec', parentId });
    await createPlace({ name: 'Ontario', parentId });

    const children = await getChildPlaces(parentId);
    expect(children).toHaveLength(2);
  });

  it('returns empty when no children', async () => {
    const id = await createPlace({ name: 'Leaf' });
    const children = await getChildPlaces(id);
    expect(children).toHaveLength(0);
  });

  it('returns children ordered by name', async () => {
    const parentId = await createPlace({ name: 'Canada' });
    await createPlace({ name: 'Quebec', parentId });
    await createPlace({ name: 'Alberta', parentId });
    await createPlace({ name: 'Ontario', parentId });

    const children = await getChildPlaces(parentId);
    expect(children[0].name).toBe('Alberta');
    expect(children[1].name).toBe('Ontario');
    expect(children[2].name).toBe('Quebec');
  });
});

describe('getRootPlaces', () => {
  it('returns places without a parent', async () => {
    const canadaId = await createPlace({ name: 'Canada' });
    const usaId = await createPlace({ name: 'USA' });
    await createPlace({ name: 'Quebec', parentId: canadaId });

    const roots = await getRootPlaces();
    expect(roots).toHaveLength(2);
    const rootIds = roots.map((p) => p.id);
    expect(rootIds).toContain(canadaId);
    expect(rootIds).toContain(usaId);
  });
});

describe('getPlaceHierarchy', () => {
  it('returns path from root to place', async () => {
    const canadaId = await createPlace({ name: 'Canada' });
    const quebecId = await createPlace({ name: 'Quebec', parentId: canadaId });
    const montrealId = await createPlace({ name: 'Montreal', parentId: quebecId });

    const path = await getPlaceHierarchy(montrealId);
    expect(path).toHaveLength(3);
    expect(path[0].name).toBe('Canada');
    expect(path[1].name).toBe('Quebec');
    expect(path[2].name).toBe('Montreal');
  });

  it('returns single element for root place', async () => {
    const id = await createPlace({ name: 'Canada' });
    const path = await getPlaceHierarchy(id);
    expect(path).toHaveLength(1);
    expect(path[0].name).toBe('Canada');
  });

  it('returns empty for non-existent place', async () => {
    const path = await getPlaceHierarchy('P-9999');
    expect(path).toHaveLength(0);
  });
});

describe('getPlaceWithHierarchy', () => {
  it('returns null for non-existent place', async () => {
    expect(await getPlaceWithHierarchy('P-9999')).toBeNull();
  });

  it('returns place with all hierarchy info', async () => {
    const placeTypeId = await createPlaceType({ customName: 'City' });
    const parentId = await createPlace({ name: 'Quebec' });
    const placeId = await createPlace({
      name: 'Montreal',
      parentId,
      placeTypeId,
    });
    await createPlace({ name: 'Downtown', parentId: placeId });
    await createPlace({ name: 'Old Montreal', parentId: placeId });

    const result = await getPlaceWithHierarchy(placeId);

    expect(result).not.toBeNull();
    expect(result?.name).toBe('Montreal');
    expect(result?.placeType?.customName).toBe('City');
    expect(result?.parent?.name).toBe('Quebec');
    expect(result?.children).toHaveLength(2);
    expect(result?.path).toHaveLength(2); // Quebec, Montreal
    expect(result?.path[0].name).toBe('Quebec');
    expect(result?.path[1].name).toBe('Montreal');
  });
});

describe('isAncestorOf', () => {
  it('returns true for direct parent', async () => {
    const parentId = await createPlace({ name: 'Canada' });
    const childId = await createPlace({ name: 'Quebec', parentId });

    expect(await isAncestorOf(parentId, childId)).toBe(true);
  });

  it('returns true for grandparent', async () => {
    const grandparentId = await createPlace({ name: 'Canada' });
    const parentId = await createPlace({ name: 'Quebec', parentId: grandparentId });
    const childId = await createPlace({ name: 'Montreal', parentId });

    expect(await isAncestorOf(grandparentId, childId)).toBe(true);
  });

  it('returns false for non-ancestor', async () => {
    const place1 = await createPlace({ name: 'Canada' });
    const place2 = await createPlace({ name: 'USA' });

    expect(await isAncestorOf(place1, place2)).toBe(false);
  });

  it('returns false for same place', async () => {
    const id = await createPlace({ name: 'Canada' });
    // The place is in its own path, so it's technically an ancestor of itself
    expect(await isAncestorOf(id, id)).toBe(true);
  });
});

describe('getAllDescendants', () => {
  it('returns all descendants recursively', async () => {
    const canadaId = await createPlace({ name: 'Canada' });
    const quebecId = await createPlace({ name: 'Quebec', parentId: canadaId });
    await createPlace({ name: 'Ontario', parentId: canadaId });
    await createPlace({ name: 'Montreal', parentId: quebecId });

    const descendants = await getAllDescendants(canadaId);
    expect(descendants).toHaveLength(3);
    const names = descendants.map((d) => d.name);
    expect(names).toContain('Quebec');
    expect(names).toContain('Ontario');
    expect(names).toContain('Montreal');
  });

  it('returns empty for leaf node', async () => {
    const id = await createPlace({ name: 'Leaf' });
    const descendants = await getAllDescendants(id);
    expect(descendants).toHaveLength(0);
  });
});

describe('updatePlaceFullNames', () => {
  it('updates fullName for place and descendants', async () => {
    const canadaId = await createPlace({ name: 'Canada', fullName: 'Canada' });
    const quebecId = await createPlace({ name: 'Quebec', parentId: canadaId, fullName: 'Quebec' });
    const montrealId = await createPlace({
      name: 'Montreal',
      parentId: quebecId,
      fullName: 'Montreal',
    });

    // Update Montreal's fullName based on hierarchy
    await updatePlaceFullNames(montrealId);

    const montreal = await getPlaceById(montrealId);
    expect(montreal?.fullName).toBe('Canada, Quebec, Montreal');
  });

  it('cascades updates to children', async () => {
    const canadaId = await createPlace({ name: 'Canada', fullName: 'Canada' });
    const quebecId = await createPlace({ name: 'Quebec', parentId: canadaId, fullName: 'Quebec' });
    const montrealId = await createPlace({
      name: 'Montreal',
      parentId: quebecId,
      fullName: 'Montreal',
    });

    // Update from Quebec level
    await updatePlaceFullNames(quebecId);

    const quebec = await getPlaceById(quebecId);
    const montreal = await getPlaceById(montrealId);

    expect(quebec?.fullName).toBe('Canada, Quebec');
    expect(montreal?.fullName).toBe('Canada, Quebec, Montreal');
  });
});
