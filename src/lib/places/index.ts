import Database from "@tauri-apps/plugin-sql";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { PlaceType, Place, places as placesTable } from "../db/schema";
import { getDb } from "../db/client";
import { initializeDatabase } from "../db/migrations";
import {
  CreatePlaceInput,
  CreatePlaceTypeInput,
  UpdatePlaceInput,
  rawPlaceToPlace,
  rawPlaceTypeToPlaceType,
  isRawPlaceRow,
  isRawPlaceTypeRow,
} from "../db/types";

export const places = {
  // Initialize database with schema and default place types
  async initDatabase(treeName: string): Promise<void> {
    await initializeDatabase(treeName);
  },

  // Place Types CRUD
  async getPlaceTypes(treeName: string): Promise<PlaceType[]> {
    const database = await Database.load(`sqlite:trees/${treeName}.db`);

    const result = await database.select(
      "SELECT * FROM place_types ORDER BY name",
    );

    // If empty, initialize the database
    if (!result || (result as unknown[]).length === 0) {
      await this.initDatabase(treeName);
      const retryResult = await database.select(
        "SELECT * FROM place_types ORDER BY name",
      );
      return (retryResult as unknown[])
        .filter((row): row is any => isRawPlaceTypeRow(row))
        .map(rawPlaceTypeToPlaceType);
    }

    return (result as unknown[])
      .filter((row): row is any => isRawPlaceTypeRow(row))
      .map(rawPlaceTypeToPlaceType);
  },

  async createPlaceType(
    treeName: string,
    placeType: CreatePlaceTypeInput,
  ): Promise<PlaceType> {
    const database = await Database.load(`sqlite:trees/${treeName}.db`);
    const id = uuidv4();

    await database.execute(
      "INSERT INTO place_types (id, name, key, is_system) VALUES (?, ?, ?, ?)",
      [id, placeType.name, placeType.key, placeType.isSystem],
    );

    return await this.getPlaceType(treeName, id);
  },

  async getPlaceType(treeName: string, id: string): Promise<PlaceType> {
    const database = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await database.select(
      "SELECT * FROM place_types WHERE id = ?",
      [id],
    );

    const firstResult = (result as unknown[])[0];
    if (!isRawPlaceTypeRow(firstResult)) {
      throw new Error(`Place type with id ${id} not found`);
    }

    return rawPlaceTypeToPlaceType(firstResult);
  },

  // Places CRUD
  async getAll(treeName: string): Promise<Place[]> {
    const database = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await database.select("SELECT * FROM places ORDER BY name");

    return (result as unknown[])
      .filter((row): row is any => isRawPlaceRow(row))
      .map(rawPlaceToPlace);
  },

  async getById(treeName: string, id: string): Promise<Place | null> {
    const database = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await database.select("SELECT * FROM places WHERE id = ?", [
      id,
    ]);

    const firstResult = (result as unknown[])[0];
    if (!firstResult || !isRawPlaceRow(firstResult)) {
      return null;
    }

    return rawPlaceToPlace(firstResult);
  },

  async create(treeName: string, place: CreatePlaceInput): Promise<Place> {
    const database = await Database.load(`sqlite:trees/${treeName}.db`);
    const id = uuidv4();

    await database.execute(
      "INSERT INTO places (id, name, type_id, parent_id, latitude, longitude, gedcom_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        place.name,
        place.typeId,
        place.parentId,
        place.latitude,
        place.longitude,
        place.gedcomId,
      ],
    );

    const createdPlace = await this.getById(treeName, id);
    if (!createdPlace) {
      throw new Error("Failed to retrieve created place");
    }

    return createdPlace;
  },

  async update(
    treeName: string,
    id: string,
    place: UpdatePlaceInput,
  ): Promise<Place> {
    const db = await getDb(treeName);

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(place).filter(([_, value]) => value !== undefined),
    ) as Partial<Place>;

    if (Object.keys(filteredUpdates).length === 0) {
      const existingPlace = await this.getById(treeName, id);
      if (!existingPlace) {
        throw new Error(`Place with id ${id} not found`);
      }
      return existingPlace;
    }

    const result = await db
      .update(placesTable)
      .set(filteredUpdates)
      .where(eq(placesTable.id, id))
      .returning();

    const updatedPlace = Array.isArray(result) ? result[0] : result;
    if (!updatedPlace) {
      throw new Error(`Place with id ${id} not found`);
    }

    return updatedPlace;
  },

  async delete(treeName: string, id: string): Promise<void> {
    const database = await Database.load(`sqlite:trees/${treeName}.db`);
    await database.execute("DELETE FROM places WHERE id = ?", [id]);
  },

  async getChildrenCount(treeName: string, parentId: string): Promise<number> {
    const database = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await database.select(
      "SELECT COUNT(*) as count FROM places WHERE parent_id = ?",
      [parentId],
    );

    const firstResult = (result as unknown[])[0];
    if (
      !firstResult ||
      typeof firstResult !== "object" ||
      !("count" in firstResult)
    ) {
      return 0;
    }

    return (firstResult as any).count as number;
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
        const type = placeTypeMap.get(place.typeId);
        if (!type) {
          throw new Error(
            `Place type with id ${place.typeId} not found for place ${place.name}`,
          );
        }
        return { ...place, type };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getChildren(treeName: string, parentId: string): Promise<Place[]> {
    const db = await getDb(treeName);
    return await db
      .select()
      .from(placesTable)
      .where(eq(placesTable.parentId, parentId))
      .orderBy(placesTable.name);
  },
};
