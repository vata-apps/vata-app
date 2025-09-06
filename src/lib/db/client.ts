import Database from "@tauri-apps/plugin-sql";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import type { AsyncRemoteCallback } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

type DrizzleDatabase = ReturnType<typeof drizzle<typeof schema>>;

let dbInstance: DrizzleDatabase | null = null;
let currentDbPath: string | null = null;

export async function getDb(treeName: string): Promise<DrizzleDatabase> {
  const dbPath = `sqlite:trees/${treeName}.db`;

  if (dbInstance && currentDbPath === dbPath) {
    return dbInstance;
  }

  const database = await Database.load(dbPath);

  const asyncCallback: AsyncRemoteCallback = async (sql, params, method) => {
    if (method === "all" || method === "values") {
      const result = (await database.select(sql, params)) as Record<string, any>[];
      
      // For sqlite-proxy, we keep column names as-is - Drizzle handles the mapping
      return { rows: result };
    } else {
      await database.execute(sql, params);
      return { rows: [] };
    }
  };

  dbInstance = drizzle(asyncCallback, { schema });
  currentDbPath = dbPath;
  return dbInstance;
}

export function closeDb() {
  dbInstance = null;
  currentDbPath = null;
}
