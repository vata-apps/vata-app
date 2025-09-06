import Database from "@tauri-apps/plugin-sql";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import type { AsyncRemoteCallback } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

type DrizzleDatabase = ReturnType<typeof drizzle<typeof schema>>;

let dbInstance: DrizzleDatabase | null = null;

export async function getTreesMetadataDb(): Promise<DrizzleDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = "sqlite:trees-metadata.db";

  // Connect to SQLite database via Tauri
  const database = await Database.load(dbPath);

  // Create async callback for Drizzle
  const asyncCallback: AsyncRemoteCallback = async (sql, params, method) => {
    try {
      if (method === "all" || method === "values") {
        const result = (await database.select(sql, params)) as unknown[];
        return { rows: result };
      } else {
        await database.execute(sql, params);
        return { rows: [] };
      }
    } catch (error) {
      console.error("Trees metadata database operation failed:", error);
      throw error;
    }
  };

  // Create Drizzle instance with SQLite proxy
  dbInstance = drizzle(asyncCallback, { schema });

  return dbInstance;
}

export function closeTreesMetadataDb() {
  dbInstance = null;
}
