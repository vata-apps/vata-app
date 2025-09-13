import Database from "@tauri-apps/plugin-sql";

/**
 * Connect to the system database (system.db)
 * This database contains global application data like trees, settings, etc.
 */
export async function connectToSystemDb(): Promise<Database> {
  return Database.load("sqlite:system.db");
}

/**
 * Execute an operation on the system database
 * @param operation - Function to execute with the database connection
 * @returns Promise with the operation result
 */
export function withSystemDb<T>(
  operation: (database: Database) => Promise<T>,
): Promise<T> {
  return connectToSystemDb().then(operation);
}
