import { withTreeDbById } from "../connection";
import {
  PlaceType,
  CreatePlaceTypeInput,
  UpdatePlaceTypeInput,
} from "../../types";

/**
 * Create a new place type in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param placeType - Place type data to create
 * @returns Promise with the created place type
 */
export async function createPlaceType(
  treeId: string,
  placeType: CreatePlaceTypeInput,
): Promise<PlaceType> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.execute(
      "INSERT INTO place_types (name, key) VALUES (?, ?) RETURNING id, created_at, name, key",
      [placeType.name, placeType.key || null],
    );

    const insertId = result.lastInsertId as number;

    return {
      id: insertId.toString(),
      name: placeType.name,
      key: placeType.key || null,
      created_at: new Date(),
    };
  });
}

/**
 * Get all place types from the specified tree database
 * @param treeId - Tree ID (as string)
 * @returns Promise with array of all place types
 */
export async function getAllPlaceTypes(treeId: string): Promise<PlaceType[]> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        name: string;
        key: string | null;
      }>
    >("SELECT id, created_at, name, key FROM place_types ORDER BY name");

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      name: row.name,
      key: row.key,
    }));
  });
}

/**
 * Get a specific place type by ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Place type ID (as string)
 * @returns Promise with the place type or null if not found
 */
export async function getPlaceTypeById(
  treeId: string,
  id: string,
): Promise<PlaceType | null> {
  return withTreeDbById(treeId, async (database) => {
    const placeTypeId = parseInt(id, 10);
    if (isNaN(placeTypeId)) {
      throw new Error(`Invalid place type ID: ${id}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        name: string;
        key: string | null;
      }>
    >("SELECT id, created_at, name, key FROM place_types WHERE id = ?", [
      placeTypeId,
    ]);

    if (!result[0]) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      name: row.name,
      key: row.key,
    };
  });
}

/**
 * Update an existing place type in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Place type ID (as string)
 * @param placeType - Updated place type data
 * @returns Promise with the updated place type
 */
export async function updatePlaceType(
  treeId: string,
  id: string,
  placeType: UpdatePlaceTypeInput,
): Promise<PlaceType> {
  return withTreeDbById(treeId, async (database) => {
    const placeTypeId = parseInt(id, 10);
    if (isNaN(placeTypeId)) {
      throw new Error(`Invalid place type ID: ${id}`);
    }

    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (placeType.name !== undefined) {
      updates.push("name = ?");
      values.push(placeType.name);
    }
    if (placeType.key !== undefined) {
      updates.push("key = ?");
      values.push(placeType.key);
    }

    if (updates.length === 0) {
      // No updates, return current place type
      const current = await getPlaceTypeById(treeId, id);
      if (!current) {
        throw new Error(`Place type with ID ${id} not found`);
      }
      return current;
    }

    values.push(placeTypeId.toString());
    await database.execute(
      `UPDATE place_types SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const updated = await getPlaceTypeById(treeId, id);
    if (!updated) {
      throw new Error(`Place type with ID ${id} not found after update`);
    }

    return updated;
  });
}

/**
 * Delete a place type from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Place type ID (as string)
 * @returns Promise that resolves when deletion is complete
 */
export async function deletePlaceType(
  treeId: string,
  id: string,
): Promise<void> {
  return withTreeDbById(treeId, async (database) => {
    const placeTypeId = parseInt(id, 10);
    if (isNaN(placeTypeId)) {
      throw new Error(`Invalid place type ID: ${id}`);
    }

    await database.execute("DELETE FROM place_types WHERE id = ?", [
      placeTypeId,
    ]);
  });
}
