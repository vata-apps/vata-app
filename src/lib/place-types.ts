import { v4 as uuidv4 } from "uuid";
import { withTreeDb } from "./db/connection";
import {
  PlaceType,
  CreatePlaceTypeInput,
  UpdatePlaceTypeInput,
} from "./db/types";

export const placeTypes = {
  async getAll(treeName: string): Promise<PlaceType[]> {
    return withTreeDb(treeName, async (database) => {
      return await database.select<PlaceType[]>(
        "SELECT id, created_at, name, key FROM place_types ORDER BY name",
      );
    });
  },

  async getById(treeName: string, id: string): Promise<PlaceType | null> {
    return withTreeDb(treeName, async (database) => {
      const result = await database.select<PlaceType[]>(
        "SELECT id, created_at, name, key FROM place_types WHERE id = ?",
        [id],
      );

      return result[0] || null;
    });
  },

  async create(
    treeName: string,
    placeType: CreatePlaceTypeInput,
  ): Promise<PlaceType> {
    return withTreeDb(treeName, async (database) => {
      const id = uuidv4();
      await database.execute(
        "INSERT INTO place_types (id, name, key) VALUES (?, ?, ?)",
        [id, placeType.name, placeType.key || null],
      );

      const result = await database.select<PlaceType[]>(
        "SELECT id, created_at, name, key FROM place_types WHERE id = ?",
        [id],
      );

      return result[0];
    });
  },

  async update(
    treeName: string,
    id: string,
    updates: UpdatePlaceTypeInput,
  ): Promise<PlaceType> {
    return withTreeDb(treeName, async (database) => {
      // First check if this place type has a key (system type)
      const existingPlaceType = await this.getById(treeName, id);
      if (!existingPlaceType) {
        throw new Error(`Place type with id ${id} not found`);
      }

      if (existingPlaceType.key) {
        throw new Error(
          `Cannot modify system place type: ${existingPlaceType.name}`,
        );
      }

      const updateFields: string[] = [];
      const values: (string | null)[] = [];

      if (updates.name !== undefined) {
        updateFields.push("name = ?");
        values.push(updates.name);
      }
      if (updates.key !== undefined) {
        updateFields.push("key = ?");
        values.push(updates.key);
      }

      if (updateFields.length === 0) {
        return existingPlaceType;
      }

      values.push(id);
      await database.execute(
        `UPDATE place_types SET ${updateFields.join(", ")} WHERE id = ?`,
        values,
      );

      const result = await database.select<PlaceType[]>(
        "SELECT id, created_at, name, key FROM place_types WHERE id = ?",
        [id],
      );

      if (!result[0]) {
        throw new Error(`Place type with id ${id} not found`);
      }

      return result[0];
    });
  },

  async delete(treeName: string, id: string): Promise<void> {
    return withTreeDb(treeName, async (database) => {
      // First check if this place type has a key (system type)
      const placeType = await database.select<PlaceType[]>(
        "SELECT id, created_at, name, key FROM place_types WHERE id = ?",
        [id],
      );

      if (!placeType[0]) {
        throw new Error(`Place type with id ${id} not found`);
      }

      if (placeType[0].key) {
        throw new Error(
          `Cannot delete system place type: ${placeType[0].name}`,
        );
      }

      // Check if any places use this place type
      const placesUsingType = await database.select<Array<{ count: number }>>(
        "SELECT COUNT(*) as count FROM places WHERE type_id = ?",
        [id],
      );

      if (placesUsingType[0]?.count > 0) {
        throw new Error(
          `Cannot delete place type: ${placesUsingType[0].count} places are using this type`,
        );
      }

      await database.execute("DELETE FROM place_types WHERE id = ?", [id]);
    });
  },

  async getUsageCount(treeName: string, id: string): Promise<number> {
    return withTreeDb(treeName, async (database) => {
      const result = await database.select<Array<{ count: number }>>(
        "SELECT COUNT(*) as count FROM places WHERE type_id = ?",
        [id],
      );

      return result[0]?.count ?? 0;
    });
  },
};
