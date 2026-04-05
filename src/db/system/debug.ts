import { getSystemDb } from '../connection';
import { readDir, BaseDirectory } from '@tauri-apps/plugin-fs';

// Raw database row types (snake_case as in SQLite)
interface RawTree {
  id: number;
  name: string;
  path: string;
  description: string | null;
  individual_count: number;
  family_count: number;
  last_opened_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RawAppSetting {
  key: string;
  value: string;
}

export interface SystemDebugData {
  trees: RawTree[];
  appSettings: Record<string, string>;
}

export async function getSystemDebugData(): Promise<SystemDebugData> {
  const db = await getSystemDb();

  const [rawTrees, rawSettings] = await Promise.all([
    db.select<RawTree[]>(
      'SELECT id, name, path, description, individual_count, family_count, last_opened_at, created_at, updated_at FROM trees ORDER BY id'
    ),
    db.select<RawAppSetting[]>('SELECT key, value FROM app_settings ORDER BY key'),
  ]);

  const appSettings: Record<string, string> = {};
  for (const row of rawSettings) {
    appSettings[row.key] = row.value;
  }

  return {
    trees: rawTrees,
    appSettings,
  };
}

export async function listTreeDatabaseFiles(): Promise<string[]> {
  try {
    const entries = await readDir('trees', { baseDir: BaseDirectory.AppData });
    return entries
      .filter((entry) => entry.isDirectory || (entry.isFile && entry.name.endsWith('.db')))
      .map((entry) => entry.name);
  } catch {
    // Directory may not exist yet
    return [];
  }
}
