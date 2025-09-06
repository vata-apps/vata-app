import Database from "@tauri-apps/plugin-sql";
import { initializeDatabase } from "./db/migrations";
import { v4 as uuidv4 } from "uuid";
import { PlaceType, Place, CreatePlaceInput, CreatePlaceTypeInput, UpdatePlaceInput } from "./db/types";

export const places = {
  // Initialize database with schema and default place types
  async initDatabase(treeName: string): Promise<void> {
    await initializeDatabase(treeName);
  },

  // Place Types CRUD
  async getPlaceTypes(treeName: string): Promise<PlaceType[]> {
    const dbPath = `sqlite:trees/${treeName}.db`;
    const database = await Database.load(dbPath);

    const result = await database.select(
      "SELECT * FROM place_types ORDER BY name"
    ) as PlaceType[];

    // If empty, initialize the database
    if (!result || result.length === 0) {
      await this.initDatabase(treeName);
      return await database.select(
        "SELECT * FROM place_types ORDER BY name"
      ) as PlaceType[];
    }

    return result.map(type => ({
      ...type,
      is_system: Boolean(type.is_system)
    }));
  },

  async createPlaceType(
    treeName: string,
    placeType: CreatePlaceTypeInput,
  ): Promise<PlaceType> {
    const dbPath = `sqlite:trees/${treeName}.db`;
    const database = await Database.load(dbPath);

    const id = uuidv4();
    await database.execute(
      "INSERT INTO place_types (id, name, key, is_system) VALUES (?, ?, ?, ?)",
      [id, placeType.name, placeType.key || null, placeType.isSystem ? 1 : 0]
    );

    const result = await database.select(
      "SELECT * FROM place_types WHERE id = ?",
      [id]
    ) as PlaceType[];

    return {
      ...result[0],
      is_system: Boolean(result[0].is_system)
    };
  },

  async getPlaceType(treeName: string, id: string): Promise<PlaceType> {
    const dbPath = `sqlite:trees/${treeName}.db`;
    const database = await Database.load(dbPath);
    
    const result = await database.select(
      "SELECT * FROM place_types WHERE id = ?",
      [id]
    ) as PlaceType[];

    if (!result[0]) {
      throw new Error(`Place type with id ${id} not found`);
    }

    return {
      ...result[0],
      is_system: Boolean(result[0].is_system)
    };
  },

  // Places CRUD
  async getAll(treeName: string): Promise<Place[]> {
    const dbPath = `sqlite:trees/${treeName}.db`;
    const database = await Database.load(dbPath);
    
    return await database.select(
      "SELECT * FROM places ORDER BY name"
    ) as Place[];
  },

  async getById(treeName: string, id: string): Promise<Place | null> {
    const dbPath = `sqlite:trees/${treeName}.db`;
    const database = await Database.load(dbPath);
    
    const result = await database.select(
      "SELECT * FROM places WHERE id = ?",
      [id]
    ) as Place[];

    return result[0] || null;
  },

  async create(treeName: string, place: CreatePlaceInput): Promise<Place> {
    const dbPath = `sqlite:trees/${treeName}.db`;
    const database = await Database.load(dbPath);

    const id = uuidv4();
    await database.execute(
      "INSERT INTO places (id, name, type_id, parent_id, latitude, longitude, gedcom_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, place.name, place.typeId, place.parentId, place.latitude, place.longitude, place.gedcomId]
    );

    const result = await database.select(
      "SELECT * FROM places WHERE id = ?",
      [id]
    ) as Place[];

    return result[0];
  },

  async update(
    treeName: string,
    id: string,
    place: UpdatePlaceInput,
  ): Promise<Place> {
    const dbPath = `sqlite:trees/${treeName}.db`;
    const database = await Database.load(dbPath);

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    
    if (place.name !== undefined) {
      updates.push("name = ?");
      values.push(place.name);
    }
    if (place.typeId !== undefined) {
      updates.push("type_id = ?");
      values.push(place.typeId);
    }
    if (place.parentId !== undefined) {
      updates.push("parent_id = ?");
      values.push(place.parentId);
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
      const existingPlace = await this.getById(treeName, id);
      if (!existingPlace) {
        throw new Error(`Place with id ${id} not found`);
      }
      return existingPlace;
    }

    values.push(id);
    await database.execute(
      `UPDATE places SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const result = await database.select(
      "SELECT * FROM places WHERE id = ?",
      [id]
    ) as Place[];

    if (!result[0]) {
      throw new Error(`Place with id ${id} not found`);
    }

    return result[0];
  },

  async delete(treeName: string, id: string): Promise<void> {
    const dbPath = `sqlite:trees/${treeName}.db`;
    const database = await Database.load(dbPath);
    
    await database.execute("DELETE FROM places WHERE id = ?", [id]);
  },

  async getChildrenCount(treeName: string, parentId: string): Promise<number> {
    const dbPath = `sqlite:trees/${treeName}.db`;
    const database = await Database.load(dbPath);
    
    const result = await database.select(
      "SELECT COUNT(*) as count FROM places WHERE parent_id = ?",
      [parentId]
    ) as Array<{ count: number }>;

    return result[0]?.count ?? 0;
  },

  // Get places with hierarchy info
  async getAllWithTypes(
    treeName: string,
  ): Promise<(Place & { type: PlaceType })[]> {
    // Get all places and place types separately for type safety
    const [places, placeTypes] = await Promise.all([
      this.getAll(treeName),
      this.getPlaceTypes(treeName),
    ]);

    // Create a map of place types by id for efficient lookup
    const placeTypeMap = new Map<string, PlaceType>();
    placeTypes.forEach((type) => placeTypeMap.set(type.id, type));

    // Join places with their types
    return places
      .map((place) => {
        const type = placeTypeMap.get(place.type_id);
        if (!type) {
          throw new Error(
            `Place type with id ${place.type_id} not found for place ${place.name}`,
          );
        }
        return { ...place, type };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getChildren(treeName: string, parentId: string): Promise<Place[]> {
    const dbPath = `sqlite:trees/${treeName}.db`;
    const database = await Database.load(dbPath);
    
    return await database.select(
      "SELECT * FROM places WHERE parent_id = ? ORDER BY name",
      [parentId]
    ) as Place[];
  },
};
