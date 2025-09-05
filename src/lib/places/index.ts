import Database from '@tauri-apps/plugin-sql';
import { PlaceType, Place, NewPlace, NewPlaceType } from '../db/schema';
import { initializeDatabase } from '../db/migrations';

export const places = {
  // Initialize database with schema and default place types
  async initDatabase(treeName: string): Promise<void> {
    await initializeDatabase(treeName);
  },

  // Place Types CRUD
  async getPlaceTypes(treeName: string): Promise<PlaceType[]> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    return await db.select('SELECT * FROM place_types ORDER BY name');
  },

  async createPlaceType(treeName: string, placeType: Omit<NewPlaceType, 'id' | 'createdAt'>): Promise<PlaceType> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await db.execute(
      'INSERT INTO place_types (name, key, is_system) VALUES ($1, $2, $3)',
      [placeType.name, placeType.key, placeType.isSystem]
    );
    return await this.getPlaceType(treeName, result.lastInsertId as number);
  },

  async getPlaceType(treeName: string, id: number): Promise<PlaceType> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await db.select('SELECT * FROM place_types WHERE id = $1', [id]);
    return (result as PlaceType[])[0];
  },

  // Places CRUD
  async getAll(treeName: string): Promise<Place[]> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    return await db.select(`
      SELECT 
        id,
        created_at as createdAt,
        name,
        type_id as typeId,
        parent_id as parentId,
        latitude,
        longitude,
        gedcom_id as gedcomId
      FROM places 
      ORDER BY name
    `) as Place[];
  },

  async getById(treeName: string, id: number): Promise<Place | null> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await db.select(`
      SELECT 
        id,
        created_at as createdAt,
        name,
        type_id as typeId,
        parent_id as parentId,
        latitude,
        longitude,
        gedcom_id as gedcomId
      FROM places 
      WHERE id = $1
    `, [id]) as Place[];
    return result.length > 0 ? result[0] : null;
  },

  async create(treeName: string, place: Omit<NewPlace, 'id' | 'createdAt'>): Promise<Place> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    const result = await db.execute(
      'INSERT INTO places (name, type_id, parent_id, latitude, longitude, gedcom_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [place.name, place.typeId, place.parentId, place.latitude, place.longitude, place.gedcomId]
    );
    
    const createdPlace = await this.getById(treeName, result.lastInsertId as number);
    if (!createdPlace) {
      throw new Error(`Failed to create place: ${place.name}`);
    }
    return createdPlace;
  },

  async update(treeName: string, id: number, place: Partial<Omit<Place, 'id' | 'createdAt'>>): Promise<Place> {
    console.log('places.update called with:', { treeName, id, place });
    
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    const updates = Object.entries(place).filter(([_, value]) => value !== undefined);
    if (updates.length === 0) return await this.getById(treeName, id) as Place;
    
    console.log('Updates to apply:', updates);
    
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
    console.log('SQL Query:', query);
    console.log('SQL Values:', values);
    
    await db.execute(query, values);
    
    const result = await this.getById(treeName, id) as Place;
    console.log('Updated place from DB:', result);
    
    return result;
  },

  async delete(treeName: string, id: number): Promise<void> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    await db.execute('DELETE FROM places WHERE id = $1', [id]);
  },

  // Get places with hierarchy info
  async getAllWithTypes(treeName: string): Promise<(Place & { type: PlaceType })[]> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    return await db.select(`
      SELECT p.*, pt.name as type_name, pt.key as type_key, pt.is_system as type_is_system 
      FROM places p 
      JOIN place_types pt ON p.type_id = pt.id 
      ORDER BY p.name
    `);
  },

  async getChildren(treeName: string, parentId: number): Promise<Place[]> {
    const db = await Database.load(`sqlite:trees/${treeName}.db`);
    return await db.select(`
      SELECT 
        id,
        created_at as createdAt,
        name,
        type_id as typeId,
        parent_id as parentId,
        latitude,
        longitude,
        gedcom_id as gedcomId
      FROM places 
      WHERE parent_id = $1 
      ORDER BY name
    `, [parentId]) as Place[];
  },
};