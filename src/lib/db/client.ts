import Database from '@tauri-apps/plugin-sql';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle> | null = null;
let currentDbPath: string | null = null;

export async function getDb(treeName: string) {
  const dbPath = `trees/${treeName}.db`;
  
  // Return existing connection if same tree
  if (dbInstance && currentDbPath === dbPath) {
    return dbInstance;
  }

  // Connect to SQLite database via Tauri
  const database = await Database.load(`sqlite:${dbPath}`);
  
  // Create Drizzle instance with SQLite proxy
  dbInstance = drizzle(
    {
      async execute(sql) {
        const result = await database.execute(sql.sql, sql.params);
        return { rows: result.rows || [] };
      },
    },
    { schema }
  );

  currentDbPath = dbPath;
  return dbInstance;
}

export function closeDb() {
  dbInstance = null;
  currentDbPath = null;
}