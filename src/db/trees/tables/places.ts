import { withTreeDbById } from "../connection";
import { Place, CreatePlaceInput, UpdatePlaceInput } from "../../types";

/**
 * Create a new place in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param place - Place data to create
 * @returns Promise with the created place
 */
export async function createPlace(
  treeId: string,
  place: CreatePlaceInput,
): Promise<Place> {
  return withTreeDbById(treeId, async (database) => {
    const typeId = parseInt(place.type_id, 10);
    const parentId = place.parent_id ? parseInt(place.parent_id, 10) : null;

    if (isNaN(typeId)) {
      throw new Error(`Invalid type ID: ${place.type_id}`);
    }
    if (place.parent_id && isNaN(parentId!)) {
      throw new Error(`Invalid parent ID: ${place.parent_id}`);
    }

    const result = await database.execute(
      "INSERT INTO places (name, type_id, parent_id, latitude, longitude) VALUES (?, ?, ?, ?, ?) RETURNING id, created_at, name, type_id, parent_id, latitude, longitude",
      [
        place.name,
        typeId,
        parentId,
        place.latitude || null,
        place.longitude || null,
      ],
    );

    const insertId = result.lastInsertId as number;

    return {
      id: insertId.toString(),
      created_at: new Date(),
      name: place.name,
      type_id: typeId.toString(),
      parent_id: parentId?.toString() || null,
      latitude: place.latitude || null,
      longitude: place.longitude || null,
    };
  });
}

/**
 * Get all places from the specified tree database
 * @param treeId - Tree ID (as string)
 * @returns Promise with array of all places
 */
export async function getAllPlaces(treeId: string): Promise<Place[]> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        name: string;
        type_id: number;
        parent_id: number | null;
        latitude: number | null;
        longitude: number | null;
      }>
    >(
      "SELECT id, created_at, name, type_id, parent_id, latitude, longitude FROM places ORDER BY name",
    );

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      name: row.name,
      type_id: row.type_id.toString(),
      parent_id: row.parent_id?.toString() || null,
      latitude: row.latitude,
      longitude: row.longitude,
    }));
  });
}

/**
 * Get a specific place by ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Place ID (as string)
 * @returns Promise with the place or null if not found
 */
export async function getPlaceById(
  treeId: string,
  id: string,
): Promise<Place | null> {
  return withTreeDbById(treeId, async (database) => {
    const placeId = parseInt(id, 10);
    if (isNaN(placeId)) {
      throw new Error(`Invalid place ID: ${id}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        name: string;
        type_id: number;
        parent_id: number | null;
        latitude: number | null;
        longitude: number | null;
      }>
    >(
      "SELECT id, created_at, name, type_id, parent_id, latitude, longitude FROM places WHERE id = ?",
      [placeId],
    );

    if (!result[0]) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      name: row.name,
      type_id: row.type_id.toString(),
      parent_id: row.parent_id?.toString() || null,
      latitude: row.latitude,
      longitude: row.longitude,
    };
  });
}

/**
 * Get places by parent ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param parentId - Parent place ID (as string) or null for root places
 * @returns Promise with array of child places
 */
export async function getPlacesByParentId(
  treeId: string,
  parentId: string | null,
): Promise<Place[]> {
  return withTreeDbById(treeId, async (database) => {
    let query: string;
    let params: (number | null)[] = [];

    if (parentId === null) {
      query =
        "SELECT id, created_at, name, type_id, parent_id, latitude, longitude FROM places WHERE parent_id IS NULL ORDER BY name";
    } else {
      const parentIdNum = parseInt(parentId, 10);
      if (isNaN(parentIdNum)) {
        throw new Error(`Invalid parent ID: ${parentId}`);
      }
      query =
        "SELECT id, created_at, name, type_id, parent_id, latitude, longitude FROM places WHERE parent_id = ? ORDER BY name";
      params = [parentIdNum];
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        name: string;
        type_id: number;
        parent_id: number | null;
        latitude: number | null;
        longitude: number | null;
      }>
    >(query, params);

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      name: row.name,
      type_id: row.type_id.toString(),
      parent_id: row.parent_id?.toString() || null,
      latitude: row.latitude,
      longitude: row.longitude,
    }));
  });
}

/**
 * Get places by type ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param typeId - Place type ID (as string)
 * @returns Promise with array of places of the specified type
 */
export async function getPlacesByTypeId(
  treeId: string,
  typeId: string,
): Promise<Place[]> {
  return withTreeDbById(treeId, async (database) => {
    const typeIdNum = parseInt(typeId, 10);
    if (isNaN(typeIdNum)) {
      throw new Error(`Invalid type ID: ${typeId}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        name: string;
        type_id: number;
        parent_id: number | null;
        latitude: number | null;
        longitude: number | null;
      }>
    >(
      "SELECT id, created_at, name, type_id, parent_id, latitude, longitude FROM places WHERE type_id = ? ORDER BY name",
      [typeIdNum],
    );

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      name: row.name,
      type_id: row.type_id.toString(),
      parent_id: row.parent_id?.toString() || null,
      latitude: row.latitude,
      longitude: row.longitude,
    }));
  });
}

/**
 * Update an existing place in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Place ID (as string)
 * @param place - Updated place data
 * @returns Promise with the updated place
 */
export async function updatePlace(
  treeId: string,
  id: string,
  place: UpdatePlaceInput,
): Promise<Place> {
  return withTreeDbById(treeId, async (database) => {
    const placeId = parseInt(id, 10);
    if (isNaN(placeId)) {
      throw new Error(`Invalid place ID: ${id}`);
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (place.name !== undefined) {
      updates.push("name = ?");
      values.push(place.name);
    }
    if (place.type_id !== undefined) {
      const typeId = parseInt(place.type_id, 10);
      if (isNaN(typeId)) {
        throw new Error(`Invalid type ID: ${place.type_id}`);
      }
      updates.push("type_id = ?");
      values.push(typeId);
    }
    if (place.parent_id !== undefined) {
      const parentId = place.parent_id ? parseInt(place.parent_id, 10) : null;
      if (place.parent_id && isNaN(parentId!)) {
        throw new Error(`Invalid parent ID: ${place.parent_id}`);
      }
      updates.push("parent_id = ?");
      values.push(parentId);
    }
    if (place.latitude !== undefined) {
      updates.push("latitude = ?");
      values.push(place.latitude);
    }
    if (place.longitude !== undefined) {
      updates.push("longitude = ?");
      values.push(place.longitude);
    }

    if (updates.length === 0) {
      // No updates, return current place
      const current = await getPlaceById(treeId, id);
      if (!current) {
        throw new Error(`Place with ID ${id} not found`);
      }
      return current;
    }

    values.push(placeId);
    await database.execute(
      `UPDATE places SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const updated = await getPlaceById(treeId, id);
    if (!updated) {
      throw new Error(`Place with ID ${id} not found after update`);
    }

    return updated;
  });
}

/**
 * Delete a place from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Place ID (as string)
 * @returns Promise that resolves when deletion is complete
 */
export async function deletePlace(treeId: string, id: string): Promise<void> {
  return withTreeDbById(treeId, async (database) => {
    const placeId = parseInt(id, 10);
    if (isNaN(placeId)) {
      throw new Error(`Invalid place ID: ${id}`);
    }

    await database.execute("DELETE FROM places WHERE id = ?", [placeId]);
  });
}
