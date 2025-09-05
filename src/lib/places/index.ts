import Database from '@tauri-apps/plugin-sql';
import { PlaceType, Place } from '../db/schema';
import { initializeDatabase } from '../db/migrations';
import { 
  RawPlaceRow, 
  RawPlaceTypeRow, 
  isRawPlaceRow, 
  isRawPlaceTypeRow,
  rawPlaceToPlace,
  rawPlaceTypeToPlaceType,
  CreatePlaceInput,
  CreatePlaceTypeInput,
  UpdatePlaceInput
} from '../db/types';

export const places = {
  // Initialize database with schema and default place types
  async initDatabase(treeName: string): Promise<void> {
    await initializeDatabase(treeName);
  },

  // Place Types CRUD
  async getPlaceTypes(treeName: string): Promise<PlaceType[]> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await db.select('SELECT * FROM place_types ORDER BY name');
    
    // Tauri database.select() returns unknown[] - cast for runtime validation with type guards
    return (result as unknown[])
      .filter((row): row is RawPlaceTypeRow => isRawPlaceTypeRow(row))
      .map(rawPlaceTypeToPlaceType);
  },

  async createPlaceType(treeName: string, placeType: CreatePlaceTypeInput): Promise<PlaceType> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await db.execute(
      'INSERT INTO place_types (name, key, is_system) VALUES ($1, $2, $3)',
      [placeType.name, placeType.key, placeType.isSystem]
    );
    
    if (typeof result.lastInsertId !== 'number') {
      throw new Error('Failed to get insert ID for place type');
    }
    
    return await this.getPlaceType(treeName, result.lastInsertId);
  },

  async getPlaceType(treeName: string, id: number): Promise<PlaceType> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await db.select('SELECT * FROM place_types WHERE id = $1', [id]);
    
    // Tauri database.select() returns unknown[] - cast for runtime validation
    const firstResult = (result as unknown[])[0];
    if (!isRawPlaceTypeRow(firstResult)) {
      throw new Error(`Place type with id ${id} not found or invalid data structure`);
    }
    
    return rawPlaceTypeToPlaceType(firstResult);
  },

  // Places CRUD
  async getAll(treeName: string): Promise<Place[]> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await db.select('SELECT * FROM places ORDER BY name');
    
    // Tauri database.select() returns unknown[] - cast for runtime validation with type guards
    return (result as unknown[])
      .filter((row): row is RawPlaceRow => isRawPlaceRow(row))
      .map(rawPlaceToPlace);
  },

  async getById(treeName: string, id: number): Promise<Place | null> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await db.select('SELECT * FROM places WHERE id = $1', [id]);
    
    // Tauri database.select() returns unknown[] - cast for runtime validation
    const firstResult = (result as unknown[])[0];
    if (!firstResult || !isRawPlaceRow(firstResult)) {
      return null;
    }
    
    return rawPlaceToPlace(firstResult);
  },

  async create(treeName: string, place: CreatePlaceInput): Promise<Place> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await db.execute(
      'INSERT INTO places (name, type_id, parent_id, latitude, longitude, gedcom_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [place.name, place.typeId, place.parentId, place.latitude, place.longitude, place.gedcomId]
    );
    
    if (typeof result.lastInsertId !== 'number') {
      throw new Error('Failed to get insert ID for place');
    }
    
    const createdPlace = await this.getById(treeName, result.lastInsertId);
    if (!createdPlace) {
      throw new Error(`Failed to create place: ${place.name}`);
    }
    return createdPlace;
  },

  async update(treeName: string, id: number, place: UpdatePlaceInput): Promise<Place> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    const updates = Object.entries(place).filter(([_, value]) => value !== undefined);
    if (updates.length === 0) {
      const existingPlace = await this.getById(treeName, id);
      if (!existingPlace) {
        throw new Error(`Place with id ${id} not found`);
      }
      return existingPlace;
    }
    
    // Map TypeScript property names to database column names
    const propertyToColumnMap: Record<string, string> = {
      'name': 'name',
      'typeId': 'type_id',
      'parentId': 'parent_id', 
      'latitude': 'latitude',
      'longitude': 'longitude',
      'gedcomId': 'gedcom_id'
    };
    
    const setClause = updates.map(([key], index) => {
      const columnName = propertyToColumnMap[key] || key;
      return `${columnName} = $${index + 2}`;
    }).join(', ');
    const values = [id, ...updates.map(([_, value]) => value)];
    
    const query = `UPDATE places SET ${setClause} WHERE id = $1`;
    await db.execute(query, values);
    
    const updatedPlace = await this.getById(treeName, id);
    if (!updatedPlace) {
      throw new Error(`Failed to retrieve updated place with id ${id}`);
    }
    
    return updatedPlace;
  },

  async delete(treeName: string, id: number): Promise<void> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    await db.execute('DELETE FROM places WHERE id = $1', [id]);
  },

  // Get places with hierarchy info
  async getAllWithTypes(treeName: string): Promise<(Place & { type: PlaceType })[]> {
    // Get all places and place types separately for type safety
    const [places, placeTypes] = await Promise.all([
      this.getAll(treeName),
      this.getPlaceTypes(treeName)
    ]);
    
    // Create a map of place types by id for efficient lookup
    const placeTypeMap = new Map<number, PlaceType>();
    placeTypes.forEach(type => placeTypeMap.set(type.id, type));
    
    // Join places with their types
    return places
      .map(place => {
        const type = placeTypeMap.get(place.typeId);
        if (!type) {
          throw new Error(`Place type with id ${place.typeId} not found for place ${place.name}`);
        }
        return { ...place, type };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getChildren(treeName: string, parentId: number): Promise<Place[]> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await db.select('SELECT * FROM places WHERE parent_id = $1 ORDER BY name', [parentId]);
    
    // Tauri database.select() returns unknown[] - cast for runtime validation with type guards
    return (result as unknown[])
      .filter((row): row is RawPlaceRow => isRawPlaceRow(row))
      .map(rawPlaceToPlace);
  },
};