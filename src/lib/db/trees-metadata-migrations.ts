import Database from "@tauri-apps/plugin-sql";

const TREES_METADATA_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS trees_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT UNIQUE NOT NULL,
    file_path TEXT NOT NULL,
    created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_opened INTEGER,
    description TEXT,
    file_exists INTEGER DEFAULT 1 NOT NULL
  )
`;

export async function initializeTreesMetadataDatabase(): Promise<void> {
  const dbPath = 'sqlite:trees-metadata.db';
  const database = await Database.load(dbPath);

  try {
    await database.execute(TREES_METADATA_SCHEMA_SQL);
    console.log('Trees metadata database initialized');
  } catch (error) {
    console.error("Failed to initialize trees metadata database:", error);
    throw error;
  }
}