import {
  BaseDirectory,
  exists,
  mkdir,
  remove,
  readDir,
} from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";
import { initializeDatabase } from "./db/migrations";

export interface TreeInfo {
  name: string;
  path: string;
  created_at: string;
  description?: string;
  fileExists: boolean;
  dbEntryExists: boolean;
  status: "healthy" | "file_missing" | "db_missing";
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
      dbEntryExists: true,
      status: "healthy",
    };
  },

  async list(): Promise<TreeInfo[]> {
    try {
      await this.initialize();

      // Get all entries from database
      const database = await Database.load("sqlite:trees-metadata.db");
      const dbRecords = (await database.select(
        "SELECT name, file_path, created_at, description FROM trees_metadata ORDER BY name",
      )) as Array<{
        name: string;
        file_path: string;
        created_at: string | number;
        description: string | null;
      }>;

      // Get all .db files from filesystem
      const treesDir = "trees";
      const fileNames: string[] = [];

      try {
        if (await exists(treesDir, { baseDir: BaseDirectory.AppData })) {
          const dirEntries = await readDir(treesDir, {
            baseDir: BaseDirectory.AppData,
          });
          for (const entry of dirEntries) {
            if (entry.name && entry.name.endsWith(".db")) {
              fileNames.push(entry.name.replace(".db", ""));
            }
          }
        }
      } catch (error) {
        console.warn("Error reading trees directory:", error);
      }

      // Reconcile both sources
      const treeMap = new Map<string, TreeInfo>();

      // Add all trees from database
      for (const record of dbRecords) {
        if (!record.name) continue;

        const fileExists = await exists(record.file_path, {
          baseDir: BaseDirectory.AppData,
        });

        treeMap.set(record.name, {
          name: record.name,
          path: record.file_path,
          created_at: record.created_at
            ? new Date(
                typeof record.created_at === "number"
                  ? record.created_at * 1000
                  : record.created_at,
              ).toISOString()
            : new Date().toISOString(),
          description: record.description || undefined,
          fileExists,
          dbEntryExists: true,
          status: fileExists ? "healthy" : "file_missing",
        });
      }

      // Add orphaned files (file exists but no DB entry)
      for (const fileName of fileNames) {
        if (!treeMap.has(fileName)) {
          treeMap.set(fileName, {
            name: fileName,
            path: `trees/${fileName}.db`,
            created_at: new Date().toISOString(), // Unknown creation date
            description: undefined,
            fileExists: true,
            dbEntryExists: false,
            status: "db_missing",
          });
        }
      }

      return Array.from(treeMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
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

    let filePath: string;

    if (records.length === 0) {
      // Handle orphaned files (db_missing case)
      filePath = `trees/${name}.db`;
    } else {
      filePath = records[0].file_path;
    }

    // Remove the actual database file if it exists
    if (await exists(filePath, { baseDir: BaseDirectory.AppData })) {
      await remove(filePath, { baseDir: BaseDirectory.AppData });
    }

    // Remove from metadata if entry exists
    if (records.length > 0) {
      await database.execute("DELETE FROM trees_metadata WHERE name = ?", [
        name,
      ]);
    }
  },

  async updateLastOpened(name: string): Promise<void> {
    await this.initialize();

    const database = await Database.load("sqlite:trees-metadata.db");

    await database.execute(
      "UPDATE trees_metadata SET last_opened = CURRENT_TIMESTAMP WHERE name = ?",
      [name],
    );
  },

  async rebuildDbEntry(name: string): Promise<TreeInfo> {
    await this.initialize();

    const treesDir = "trees";
    const dbFileName = `${name}.db`;
    const dbPath = `${treesDir}/${dbFileName}`;

    // Verify file exists
    if (!(await exists(dbPath, { baseDir: BaseDirectory.AppData }))) {
      throw new Error(`File not found: ${dbPath}`);
    }

    const database = await Database.load("sqlite:trees-metadata.db");

    // Check if entry already exists
    const existing = await database.select(
      "SELECT name FROM trees_metadata WHERE name = ?",
      [name],
    );

    if ((existing as Array<Record<string, unknown>>).length > 0) {
      throw new Error(`Tree '${name}' already exists in database`);
    }

    // Create DB entry
    const result = (await database.select(
      `INSERT INTO trees_metadata (name, file_path, file_exists) 
       VALUES (?, ?, ?) RETURNING *`,
      [name, dbPath, 1],
    )) as Array<Record<string, unknown>>;

    const created = result[0];

    return {
      name: created.name as string,
      path: created.file_path as string,
      created_at: new Date().toISOString(),
      description: undefined,
      fileExists: true,
      dbEntryExists: true,
      status: "healthy",
    };
  },
};
