import { BaseDirectory, exists, mkdir, remove } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";
import { initializeDatabase } from "./db/migrations";

export interface TreeInfo {
  name: string;
  path: string;
  created_at: string;
  description?: string;
  fileExists: boolean;
}

async function initializeTreesMetadataDatabase(): Promise<void> {
  const database = await Database.load("sqlite:trees-metadata.db");

  await database.execute(`
    CREATE TABLE IF NOT EXISTS trees_metadata (
      name TEXT PRIMARY KEY NOT NULL,
      file_path TEXT NOT NULL,
      created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
      description TEXT,
      file_exists INTEGER DEFAULT 1 NOT NULL
    );
  `);
}

export const trees = {
  async initialize(): Promise<void> {
    await initializeTreesMetadataDatabase();
  },

  async create(name: string, description?: string): Promise<TreeInfo> {
    const treesDir = "trees";
    const dbFileName = `${name}.db`;
    const dbPath = `${treesDir}/${dbFileName}`;

    // Create trees directory if it doesn't exist
    if (!(await exists(treesDir, { baseDir: BaseDirectory.AppData }))) {
      await mkdir(treesDir, {
        baseDir: BaseDirectory.AppData,
        recursive: true,
      });
    }

    await this.initialize();

    const database = await Database.load("sqlite:trees-metadata.db");

    // Check if tree already exists
    const existing = await database.select(
      "SELECT name FROM trees_metadata WHERE name = ?",
      [name],
    );

    if ((existing as Array<Record<string, unknown>>).length > 0) {
      throw new Error(`Tree '${name}' already exists`);
    }

    // Initialize database (this will create the file)
    await initializeDatabase(name);

    // Insert new tree metadata
    const result = (await database.select(
      `INSERT INTO trees_metadata (name, file_path, description, file_exists) 
       VALUES (?, ?, ?, ?) RETURNING *`,
      [name, dbPath, description || null, 1],
    )) as Array<Record<string, unknown>>;

    const created = result[0];

    return {
      name: created.name as string,
      path: created.file_path as string,
      created_at: new Date().toISOString(),
      description: (created.description as string) || undefined,
      fileExists: !!created.file_exists,
    };
  },

  async list(): Promise<TreeInfo[]> {
    try {
      await this.initialize();

      const database = await Database.load("sqlite:trees-metadata.db");

      const records = (await database.select(
        "SELECT name, file_path, created_at, description, file_exists FROM trees_metadata ORDER BY name",
      )) as Array<{
        name: string;
        file_path: string;
        created_at: string;
        description: string | null;
        file_exists: number;
      }>;

      const results: TreeInfo[] = [];

      for (const record of records) {
        if (!record.name || !record.file_path) {
          continue;
        }

        const fileExists = await exists(record.file_path, {
          baseDir: BaseDirectory.AppData,
        });

        results.push({
          name: record.name,
          path: record.file_path,
          created_at: new Date(record.created_at).toISOString(),
          description: record.description || undefined,
          fileExists,
        });
      }

      return results;
    } catch (error) {
      console.error("Error in trees.list():", error);
      throw new Error(
        `Failed to list trees: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async delete(name: string): Promise<void> {
    await this.initialize();

    const database = await Database.load("sqlite:trees-metadata.db");

    const records = (await database.select(
      "SELECT file_path FROM trees_metadata WHERE name = ?",
      [name],
    )) as Array<{ file_path: string }>;

    if (records.length === 0) {
      throw new Error(`Tree '${name}' does not exist`);
    }

    const filePath = records[0].file_path;

    // Remove the actual database file if it exists
    if (await exists(filePath, { baseDir: BaseDirectory.AppData })) {
      await remove(filePath, { baseDir: BaseDirectory.AppData });
    }

    // Remove from metadata
    await database.execute("DELETE FROM trees_metadata WHERE name = ?", [name]);
  },

  async updateLastOpened(name: string): Promise<void> {
    await this.initialize();

    const database = await Database.load("sqlite:trees-metadata.db");

    await database.execute(
      "UPDATE trees_metadata SET last_opened = CURRENT_TIMESTAMP WHERE name = ?",
      [name],
    );
  },
};
