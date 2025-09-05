import { BaseDirectory, exists, mkdir, remove } from '@tauri-apps/plugin-fs';
import { initializeDatabase } from '../db/migrations';
import { initializeTreesMetadataDatabase } from '../db/trees-metadata-migrations';

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
    const treesDir = 'trees';
    const dbFileName = `${name}.db`;
    const dbPath = `${treesDir}/${dbFileName}`;
    
    // Create trees directory if it doesn't exist
    if (!(await exists(treesDir, { baseDir: BaseDirectory.AppData }))) {
      await mkdir(treesDir, { baseDir: BaseDirectory.AppData, recursive: true });
    }
    
    // Initialize trees metadata DB if needed
    await this.initialize();
    
    // Check if tree already exists in metadata
    const Database = await import('@tauri-apps/plugin-sql');
    const database = await Database.default.load('sqlite:trees-metadata.db');
    
    const existing = await database.select('SELECT name FROM trees_metadata WHERE name = ?', [name]) as any[];
    if (existing.length > 0) {
      throw new Error(`Tree '${name}' already exists`);
    }
    
    // Initialize database (this will create the file)
    await initializeDatabase(name);
    
    // Add to metadata database
    const now = new Date();
    await database.execute(
      'INSERT INTO trees_metadata (name, file_path, description, file_exists, created_at) VALUES (?, ?, ?, ?, ?)',
      [name, dbPath, description, true, now.toISOString()]
    );
    
    
    return {
      name,
      path: dbPath,
      created_at: now.toISOString(),
      description: description || undefined,
      fileExists: true,
    };
  },

  async list(): Promise<TreeInfo[]> {
    try {
      // Initialize trees metadata DB if needed
      await this.initialize();
      
      // Use raw SQL to avoid Drizzle mapping issues
      const Database = await import('@tauri-apps/plugin-sql');
      const database = await Database.default.load('sqlite:trees-metadata.db');
      
      const rawRecords = await database.select(
        'SELECT name, file_path, created_at, description FROM trees_metadata'
      ) as any[];
      
      const results: TreeInfo[] = [];
      
      for (const record of rawRecords) {
        if (!record.name || !record.file_path) {
          continue;
        }
        
        const fileExists = await exists(record.file_path, { baseDir: BaseDirectory.AppData });
        
        const createdAt = record.created_at ? new Date(record.created_at).toISOString() : new Date().toISOString();
        
        results.push({
          name: record.name,
          path: record.file_path,
          created_at: createdAt,
          description: record.description || undefined,
          fileExists,
        });
      }
      
      return results.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error in trees.list():', error);
      throw new Error(`Failed to list trees: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async delete(name: string): Promise<void> {
    await this.initialize();
    
    const Database = await import('@tauri-apps/plugin-sql');
    const database = await Database.default.load('sqlite:trees-metadata.db');
    
    const records = await database.select(
      'SELECT file_path FROM trees_metadata WHERE name = ?',
      [name]
    ) as any[];
    
    if (records.length === 0) {
      throw new Error(`Tree '${name}' does not exist`);
    }
    
    const filePath = records[0].file_path;
    
    // Remove the actual database file if it exists
    if (await exists(filePath, { baseDir: BaseDirectory.AppData })) {
      await remove(filePath, { baseDir: BaseDirectory.AppData });
    }
    
    // Remove from metadata
    await database.execute('DELETE FROM trees_metadata WHERE name = ?', [name]);
  },

  async updateLastOpened(name: string): Promise<void> {
    await this.initialize();
    
    const Database = await import('@tauri-apps/plugin-sql');
    const database = await Database.default.load('sqlite:trees-metadata.db');
    
    await database.execute(
      'UPDATE trees_metadata SET last_opened = ? WHERE name = ?',
      [new Date().toISOString(), name]
    );
  },
};