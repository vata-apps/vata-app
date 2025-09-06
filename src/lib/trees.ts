import { BaseDirectory, exists, mkdir, remove } from "@tauri-apps/plugin-fs";
import { eq } from "drizzle-orm";
import { initializeDatabase } from "../db/migrations";
import { initializeTreesMetadataDatabase } from "./trees-metadata/migrations";
import { getTreesMetadataDb } from "./trees-metadata/client";
import { treesMetadata, NewTreeMetadata } from "./trees-metadata/schema";

export interface TreeInfo {
  name: string;
  path: string;
  created_at: string;
  description?: string;
  fileExists: boolean;
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

    const db = await getTreesMetadataDb();

    const existing = await db
      .select()
      .from(treesMetadata)
      .where(eq(treesMetadata.name, name))
      .limit(1);

    if (existing.length > 0) {
      throw new Error(`Tree '${name}' already exists`);
    }

    // Initialize database (this will create the file)
    await initializeDatabase(name);

    const newTreeMetadata: NewTreeMetadata = {
      name,
      filePath: dbPath,
      description,
      fileExists: true,
    };

    const result = await db
      .insert(treesMetadata)
      .values(newTreeMetadata)
      .returning();

    const created = result[0];

    return {
      name: created.name,
      path: created.filePath,
      created_at: created.createdAt.toISOString(),
      description: created.description || undefined,
      fileExists: created.fileExists,
    };
  },

  async list(): Promise<TreeInfo[]> {
    try {
      await this.initialize();

      const db = await getTreesMetadataDb();

      const records = await db
        .select({
          name: treesMetadata.name,
          filePath: treesMetadata.filePath,
          createdAt: treesMetadata.createdAt,
          description: treesMetadata.description,
        })
        .from(treesMetadata);

      const results: TreeInfo[] = [];

      for (const record of records) {
        if (!record.name || !record.filePath) {
          continue;
        }

        const fileExists = await exists(record.filePath, {
          baseDir: BaseDirectory.AppData,
        });

        results.push({
          name: record.name,
          path: record.filePath,
          created_at: record.createdAt.toISOString(),
          description: record.description || undefined,
          fileExists,
        });
      }

      return results.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("Error in trees.list():", error);
      throw new Error(
        `Failed to list trees: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async delete(name: string): Promise<void> {
    await this.initialize();

    const db = await getTreesMetadataDb();

    const records = await db
      .select({ filePath: treesMetadata.filePath })
      .from(treesMetadata)
      .where(eq(treesMetadata.name, name))
      .limit(1);

    if (records.length === 0) {
      throw new Error(`Tree '${name}' does not exist`);
    }

    const filePath = records[0].filePath;

    // Remove the actual database file if it exists
    if (await exists(filePath, { baseDir: BaseDirectory.AppData })) {
      await remove(filePath, { baseDir: BaseDirectory.AppData });
    }

    // Remove from metadata
    await db
      .delete(treesMetadata)
      .where(eq(treesMetadata.name, name));
  },

  async updateLastOpened(name: string): Promise<void> {
    await this.initialize();

    const db = await getTreesMetadataDb();

    await db
      .update(treesMetadata)
      .set({ lastOpened: new Date() })
      .where(eq(treesMetadata.name, name));
  },
};
