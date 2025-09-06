import { eq, asc, count } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { PlaceType, Place, places as placesTable, placeTypes, NewPlace, NewPlaceType } from "../db/schema";
import { getDb } from "../db/client";
import { initializeDatabase } from "../db/migrations";
import {
  CreatePlaceInput,
  CreatePlaceTypeInput,
  UpdatePlaceInput,
} from "../db/types";

export const places = {
  // Initialize database with schema and default place types
  async initDatabase(treeName: string): Promise<void> {
    await initializeDatabase(treeName);
  },

  // Place Types CRUD
  async getPlaceTypes(treeName: string): Promise<PlaceType[]> {
    const db = await getDb(treeName);

    const result = await db
      .select()
      .from(placeTypes)
      .orderBy(asc(placeTypes.name));

    // If empty, initialize the database
    if (!result || result.length === 0) {
      await this.initDatabase(treeName);
      return await db
        .select()
        .from(placeTypes)
        .orderBy(asc(placeTypes.name));
    }

    return result;
  },

  async createPlaceType(
    treeName: string,
    placeType: CreatePlaceTypeInput,
  ): Promise<PlaceType> {
    const db = await getDb(treeName);

    const newPlaceType: NewPlaceType = {
      name: placeType.name,
      key: placeType.key,
      isSystem: placeType.isSystem ?? false,
    };

    const result = await db
      .insert(placeTypes)
      .values(newPlaceType)
      .returning();

    return result[0];
  },

  async getPlaceType(treeName: string, id: string): Promise<PlaceType> {
    const db = await getDb(treeName);
    
    const result = await db
      .select()
      .from(placeTypes)
      .where(eq(placeTypes.id, id))
      .limit(1);

    if (!result[0]) {
      throw new Error(`Place type with id ${id} not found`);
    }

    return result[0];
  },

  // Places CRUD
  async getAll(treeName: string): Promise<Place[]> {
    const db = await getDb(treeName);
    
    return await db
      .select()
      .from(placesTable)
      .orderBy(asc(placesTable.name));
  },

  async getById(treeName: string, id: string): Promise<Place | null> {
    const db = await getDb(treeName);
    
    const result = await db
      .select()
      .from(placesTable)
      .where(eq(placesTable.id, id))
      .limit(1);

    return result[0] || null;
  },

  async create(treeName: string, place: CreatePlaceInput): Promise<Place> {
    const db = await getDb(treeName);

    const newPlace: NewPlace = {
      name: place.name,
      typeId: place.typeId,
      parentId: place.parentId,
      latitude: place.latitude,
      longitude: place.longitude,
      gedcomId: place.gedcomId,
    };

    const result = await db
      .insert(placesTable)
      .values(newPlace)
      .returning();

    return result[0];
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
    const db = await getDb(treeName);
    
    await db
      .delete(placesTable)
      .where(eq(placesTable.id, id));
  },

  async getChildrenCount(treeName: string, parentId: string): Promise<number> {
    const db = await getDb(treeName);
    
    const result = await db
      .select({ count: count() })
      .from(placesTable)
      .where(eq(placesTable.parentId, parentId));

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
      .orderBy(asc(placesTable.name));
  },
};
