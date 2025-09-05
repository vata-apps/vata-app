import Database from '@tauri-apps/plugin-sql';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import type { AsyncRemoteCallback } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle> | null = null;
let currentDbPath: string | null = null;

export async function getDb(treeName: string) {
  const dbPath = `sqlite:trees/${treeName}.db`;
  
  // Return existing connection if same tree
  if (dbInstance && currentDbPath === dbPath) {
    return dbInstance;
  }

  // Connect to SQLite database via Tauri
  const database = await Database.load(dbPath);
  
  // Create async callback for Drizzle
  const asyncCallback: AsyncRemoteCallback = async (sql, params, method) => {
    try {
      if (method === 'all' || method === 'values') {
        // Note: Tauri database.select() returns unknown[] - type validation should be done by callers
        const result = await database.select(sql, params) as unknown[];
        return { rows: result };
      } else {
        await database.execute(sql, params);
        return { rows: [] };
      }
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  };

  // Create Drizzle instance with SQLite proxy
  dbInstance = drizzle(asyncCallback, { schema });

  currentDbPath = dbPath;
  return dbInstance;
}

export function closeDb() {
  dbInstance = null;
  currentDbPath = null;
}