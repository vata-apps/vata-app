import { BaseDirectory, exists, mkdir, readDir, remove } from '@tauri-apps/plugin-fs';
import { initializeDatabase } from '../db/migrations';

export interface TreeInfo {
  name: string;
  path: string;
  created_at: string;
}

export const trees = {
  async create(name: string): Promise<TreeInfo> {
    const treesDir = 'trees';
    const dbFileName = `${name}.db`;
    const dbPath = `${treesDir}/${dbFileName}`;
    
    // Create trees directory if it doesn't exist
    if (!(await exists(treesDir, { baseDir: BaseDirectory.AppData }))) {
      await mkdir(treesDir, { baseDir: BaseDirectory.AppData, recursive: true });
    }
    
    // Check if tree already exists by trying to list files
    const entries = await readDir(treesDir, { baseDir: BaseDirectory.AppData });
    const existingTree = entries.find(entry => entry.name === dbFileName);
    if (existingTree) {
      throw new Error(`Tree '${name}' already exists`);
    }
    
    // Initialize database (this will create the file)
    await initializeDatabase(name);
    
    const treeInfo: TreeInfo = {
      name,
      path: dbPath,
      created_at: new Date().toISOString(),
    };
    
    return treeInfo;
  },

  async list(): Promise<TreeInfo[]> {
    const treesDir = 'trees';
    
    // Check if trees directory exists
    if (!(await exists(treesDir, { baseDir: BaseDirectory.AppData }))) {
      return [];
    }
    
    const entries = await readDir(treesDir, { baseDir: BaseDirectory.AppData });
    const trees: TreeInfo[] = [];
    
    for (const entry of entries) {
      if (entry.isFile && entry.name.endsWith('.db')) {
        const name = entry.name.replace('.db', '');
        trees.push({
          name,
          path: `${treesDir}/${entry.name}`,
          created_at: new Date().toISOString(), // We can't get file creation date easily
        });
      }
    }
    
    return trees.sort((a, b) => a.name.localeCompare(b.name));
  },

  async delete(name: string): Promise<void> {
    const dbPath = `trees/${name}.db`;
    
    if (!(await exists(dbPath, { baseDir: BaseDirectory.AppData }))) {
      throw new Error(`Tree '${name}' does not exist`);
    }
    
    await remove(dbPath, { baseDir: BaseDirectory.AppData });
  },
};