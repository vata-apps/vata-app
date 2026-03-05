import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import type {
  Place,
  PlaceType,
  CreatePlaceInput,
  UpdatePlaceInput,
  CreatePlaceTypeInput,
  PlaceWithHierarchy,
} from '$/types/database';

// =============================================================================
// Raw database row types (snake_case as in SQLite)
// =============================================================================

export interface RawPlace {
  id: number;
  name: string;
  full_name: string;
  place_type_id: number | null;
  parent_id: number | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface RawPlaceType {
  id: number;
  tag: string | null;
  is_system: number;
  custom_name: string | null;
  sort_order: number;
}

// =============================================================================
// Mapping functions
// =============================================================================

export function mapToPlace(raw: RawPlace): Place {
  return {
    id: formatEntityId('P', raw.id),
    name: raw.name,
    fullName: raw.full_name,
    placeTypeId: raw.place_type_id !== null ? String(raw.place_type_id) : null,
    parentId: raw.parent_id !== null ? formatEntityId('P', raw.parent_id) : null,
    latitude: raw.latitude,
    longitude: raw.longitude,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapToPlaceType(raw: RawPlaceType): PlaceType {
  return {
    id: String(raw.id),
    tag: raw.tag,
    isSystem: raw.is_system === 1,
    customName: raw.custom_name,
    sortOrder: raw.sort_order,
  };
}

// =============================================================================
// PlaceType Operations
// =============================================================================

/**
 * Get all place types ordered by sort_order
 */
export async function getAllPlaceTypes(): Promise<PlaceType[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawPlaceType[]>(
    'SELECT id, tag, is_system, custom_name, sort_order FROM place_types ORDER BY sort_order, id'
  );
  return rows.map(mapToPlaceType);
}

/**
 * Get a place type by ID
 */
export async function getPlaceTypeById(id: string): Promise<PlaceType | null> {
  const db = await getTreeDb();
  const rows = await db.select<RawPlaceType[]>(
    'SELECT id, tag, is_system, custom_name, sort_order FROM place_types WHERE id = $1',
    [parseInt(id, 10)]
  );
  return rows[0] ? mapToPlaceType(rows[0]) : null;
}

/**
 * Get a place type by tag (for system types)
 */
export async function getPlaceTypeByTag(tag: string): Promise<PlaceType | null> {
  const db = await getTreeDb();
  const rows = await db.select<RawPlaceType[]>(
    'SELECT id, tag, is_system, custom_name, sort_order FROM place_types WHERE tag = $1',
    [tag]
  );
  return rows[0] ? mapToPlaceType(rows[0]) : null;
}

/**
 * Create a custom place type
 * @returns The ID of the created place type
 */
export async function createPlaceType(input: CreatePlaceTypeInput): Promise<string> {
  const db = await getTreeDb();

  // Get the max sort_order if not provided
  let sortOrder = input.sortOrder;
  if (sortOrder === undefined) {
    const maxRows = await db.select<{ max_order: number | null }[]>(
      'SELECT MAX(sort_order) as max_order FROM place_types'
    );
    sortOrder = (maxRows[0]?.max_order ?? 0) + 1;
  }

  const result = await db.execute(
    'INSERT INTO place_types (is_system, custom_name, sort_order) VALUES (0, $1, $2)',
    [input.customName, sortOrder]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create place type: no lastInsertId returned');
  }

  return String(result.lastInsertId);
}

/**
 * Delete a custom place type (system types cannot be deleted)
 */
export async function deletePlaceType(id: string): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseInt(id, 10);

  // Only delete non-system types
  await db.execute('DELETE FROM place_types WHERE id = $1 AND is_system = 0', [dbId]);
}

/**
 * Count place types
 */
export async function countPlaceTypes(): Promise<number> {
  const db = await getTreeDb();
  const rows = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM place_types');
  return rows[0]?.count ?? 0;
}

// =============================================================================
// Place CRUD Operations
// =============================================================================

/**
 * Get all places ordered by full name
 */
export async function getAllPlaces(): Promise<Place[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawPlace[]>(
    `SELECT id, name, full_name, place_type_id, parent_id, latitude, longitude, notes, created_at, updated_at
     FROM places
     ORDER BY full_name`
  );
  return rows.map(mapToPlace);
}

/**
 * Get a place by ID
 */
export async function getPlaceById(id: string): Promise<Place | null> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  const rows = await db.select<RawPlace[]>(
    `SELECT id, name, full_name, place_type_id, parent_id, latitude, longitude, notes, created_at, updated_at
     FROM places
     WHERE id = $1`,
    [dbId]
  );
  return rows[0] ? mapToPlace(rows[0]) : null;
}

/**
 * Create a new place
 * @returns The formatted ID of the created place (e.g., "P-0001")
 */
export async function createPlace(input: CreatePlaceInput): Promise<string> {
  const db = await getTreeDb();

  // If fullName not provided, use name
  const fullName = input.fullName ?? input.name;

  // Parse parentId if provided
  const parentDbId = input.parentId ? parseEntityId(input.parentId) : null;
  const placeTypeDbId = input.placeTypeId ? parseInt(input.placeTypeId, 10) : null;

  const result = await db.execute(
    `INSERT INTO places (name, full_name, place_type_id, parent_id, latitude, longitude, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.name,
      fullName,
      placeTypeDbId,
      parentDbId,
      input.latitude ?? null,
      input.longitude ?? null,
      input.notes ?? null,
    ]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create place: no lastInsertId returned');
  }

  return formatEntityId('P', result.lastInsertId);
}

/**
 * Update a place
 */
export async function updatePlace(id: string, input: UpdatePlaceInput): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);

  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    sets.push(`name = $${paramIndex++}`);
    params.push(input.name);
  }
  if (input.fullName !== undefined) {
    sets.push(`full_name = $${paramIndex++}`);
    params.push(input.fullName);
  }
  if (input.placeTypeId !== undefined) {
    sets.push(`place_type_id = $${paramIndex++}`);
    params.push(input.placeTypeId ? parseInt(input.placeTypeId, 10) : null);
  }
  if (input.parentId !== undefined) {
    sets.push(`parent_id = $${paramIndex++}`);
    params.push(input.parentId ? parseEntityId(input.parentId) : null);
  }
  if (input.latitude !== undefined) {
    sets.push(`latitude = $${paramIndex++}`);
    params.push(input.latitude);
  }
  if (input.longitude !== undefined) {
    sets.push(`longitude = $${paramIndex++}`);
    params.push(input.longitude);
  }
  if (input.notes !== undefined) {
    sets.push(`notes = $${paramIndex++}`);
    params.push(input.notes);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = datetime('now')`);
  params.push(dbId);

  await db.execute(`UPDATE places SET ${sets.join(', ')} WHERE id = $${paramIndex}`, params);
}

/**
 * Delete a place
 * Note: Child places will have their parent_id set to NULL (ON DELETE SET NULL)
 */
export async function deletePlace(id: string): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  await db.execute('DELETE FROM places WHERE id = $1', [dbId]);
}

/**
 * Count total places
 */
export async function countPlaces(): Promise<number> {
  const db = await getTreeDb();
  const rows = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM places');
  return rows[0]?.count ?? 0;
}

// =============================================================================
// Place Search
// =============================================================================

/**
 * Search places by name or full name
 */
export async function searchPlaces(query: string): Promise<Place[]> {
  const db = await getTreeDb();
  const escaped = query.replace(/[%_\\]/g, '\\$&');
  const searchTerm = `%${escaped}%`;
  const rows = await db.select<RawPlace[]>(
    `SELECT id, name, full_name, place_type_id, parent_id, latitude, longitude, notes, created_at, updated_at
     FROM places
     WHERE name LIKE $1 ESCAPE '\\' OR full_name LIKE $2 ESCAPE '\\'
     ORDER BY full_name`,
    [searchTerm, searchTerm]
  );
  return rows.map(mapToPlace);
}

/**
 * Get places by place type
 */
export async function getPlacesByType(placeTypeId: string): Promise<Place[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawPlace[]>(
    `SELECT id, name, full_name, place_type_id, parent_id, latitude, longitude, notes, created_at, updated_at
     FROM places
     WHERE place_type_id = $1
     ORDER BY full_name`,
    [parseInt(placeTypeId, 10)]
  );
  return rows.map(mapToPlace);
}

// =============================================================================
// Place Hierarchy
// =============================================================================

/**
 * Get child places of a given parent
 */
export async function getChildPlaces(parentId: string): Promise<Place[]> {
  const db = await getTreeDb();
  const dbId = parseEntityId(parentId);
  const rows = await db.select<RawPlace[]>(
    `SELECT id, name, full_name, place_type_id, parent_id, latitude, longitude, notes, created_at, updated_at
     FROM places
     WHERE parent_id = $1
     ORDER BY name`,
    [dbId]
  );
  return rows.map(mapToPlace);
}

/**
 * Get root places (places without a parent)
 */
export async function getRootPlaces(): Promise<Place[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawPlace[]>(
    `SELECT id, name, full_name, place_type_id, parent_id, latitude, longitude, notes, created_at, updated_at
     FROM places
     WHERE parent_id IS NULL
     ORDER BY name`
  );
  return rows.map(mapToPlace);
}

/**
 * Get the complete path from a place to its root ancestor
 * Returns an array starting from the root and ending with the given place
 */
export async function getPlaceHierarchy(id: string): Promise<Place[]> {
  const path: Place[] = [];
  let currentId: string | null = id;

  // Walk up the hierarchy
  while (currentId !== null) {
    const place = await getPlaceById(currentId);
    if (!place) break;
    path.unshift(place); // Add to the beginning
    currentId = place.parentId;
  }

  return path;
}

/**
 * Get a place with its full hierarchy information
 */
export async function getPlaceWithHierarchy(id: string): Promise<PlaceWithHierarchy | null> {
  const place = await getPlaceById(id);
  if (!place) return null;

  // Get place type
  let placeType: PlaceType | null = null;
  if (place.placeTypeId) {
    placeType = await getPlaceTypeById(place.placeTypeId);
  }

  // Get parent place
  let parent: Place | null = null;
  if (place.parentId) {
    parent = await getPlaceById(place.parentId);
  }

  // Get children
  const children = await getChildPlaces(id);

  // Get complete path
  const path = await getPlaceHierarchy(id);

  return {
    ...place,
    placeType,
    parent,
    children,
    path,
  };
}

/**
 * Check if a place is an ancestor of another place
 */
export async function isAncestorOf(ancestorId: string, descendantId: string): Promise<boolean> {
  const path = await getPlaceHierarchy(descendantId);
  return path.some((p) => p.id === ancestorId);
}

/**
 * Get all descendants of a place (recursive)
 */
export async function getAllDescendants(id: string): Promise<Place[]> {
  const descendants: Place[] = [];
  const children = await getChildPlaces(id);

  for (const child of children) {
    descendants.push(child);
    const childDescendants = await getAllDescendants(child.id);
    descendants.push(...childDescendants);
  }

  return descendants;
}

/**
 * Update the full_name of a place and all its descendants
 * Call this when a place's name changes or it's moved to a new parent
 */
export async function updatePlaceFullNames(id: string): Promise<void> {
  const place = await getPlaceById(id);
  if (!place) return;

  // Build the new full name
  const path = await getPlaceHierarchy(id);
  const fullName = path.map((p) => p.name).join(', ');

  const db = await getTreeDb();
  await db.execute(`UPDATE places SET full_name = $1, updated_at = datetime('now') WHERE id = $2`, [
    fullName,
    parseEntityId(id),
  ]);

  // Update all descendants recursively
  const children = await getChildPlaces(id);
  for (const child of children) {
    await updatePlaceFullNames(child.id);
  }
}
