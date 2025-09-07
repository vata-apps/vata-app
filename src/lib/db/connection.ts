import Database from "@tauri-apps/plugin-sql";

export async function connectToTreeDb(treeName: string) {
  const dbPath = `sqlite:trees/${treeName}.db`;
  return Database.load(dbPath);
}

export async function connectToMetadataDb() {
  return Database.load("sqlite:trees-metadata.db");
}

export function withTreeDb<T>(
  treeName: string,
  operation: (database: Database) => Promise<T>,
): Promise<T> {
  return connectToTreeDb(treeName).then(operation);
}

export function withMetadataDb<T>(
  operation: (database: Database) => Promise<T>,
): Promise<T> {
  return connectToMetadataDb().then(operation);
}
