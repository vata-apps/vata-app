import Database from '@tauri-apps/plugin-sql';
import { mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';

let systemDb: Database | null = null;
let treeDb: Database | null = null;
let currentTreeFilename: string | null = null;

async function applyConnectionPragmas(db: Database): Promise<void> {
  await db.execute('PRAGMA journal_mode = WAL');
  await db.execute('PRAGMA synchronous = NORMAL');
  await db.execute('PRAGMA foreign_keys = ON');
  await db.execute('PRAGMA busy_timeout = 5000');
  await db.execute('PRAGMA cache_size = -20000');
  await db.execute('PRAGMA temp_store = MEMORY');
}

async function initializeSystemDb(db: Database): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS trees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      filename TEXT NOT NULL UNIQUE,
      description TEXT,
      individual_count INTEGER NOT NULL DEFAULT 0,
      family_count INTEGER NOT NULL DEFAULT 0,
      last_opened_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_trees_last_opened
    ON trees (last_opened_at DESC)
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

export async function getSystemDb(): Promise<Database> {
  if (!systemDb) {
    systemDb = await Database.load('sqlite:system.db');
    await applyConnectionPragmas(systemDb);
    await initializeSystemDb(systemDb);
  }
  return systemDb;
}

export async function openTreeDb(filename: string): Promise<Database> {
  if (treeDb && currentTreeFilename !== filename) {
    await treeDb.close(treeDb.path);
    treeDb = null;
    currentTreeFilename = null;
  }

  if (!treeDb) {
    await mkdir('trees', { baseDir: BaseDirectory.AppData, recursive: true });
    treeDb = await Database.load(`sqlite:trees/${filename}`);
    await applyConnectionPragmas(treeDb);
    currentTreeFilename = filename;
  }

  return treeDb;
}

export async function getTreeDb(): Promise<Database> {
  if (!treeDb) {
    throw new Error('No tree database is currently open');
  }
  return treeDb;
}

export async function closeTreeDb(): Promise<void> {
  if (treeDb) {
    await treeDb.close(treeDb.path);
    treeDb = null;
    currentTreeFilename = null;
  }
}

export function isTreeDbOpen(): boolean {
  return treeDb !== null;
}

export function getCurrentTreeFilename(): string | null {
  return currentTreeFilename;
}
