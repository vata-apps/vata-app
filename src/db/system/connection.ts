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
export async function withSystemDb<T>(
  operation: (database: Database) => Promise<T>,
): Promise<T> {
  let database: Database | null = null;

  try {
    database = await connectToSystemDb();
    const result = await operation(database);
    return result;
  } finally {
    // Ensure connection is closed
    if (database) {
      try {
        await database.close();
      } catch (closeError) {
        console.warn(`Failed to close system database connection:`, closeError);
      }
    }
  }
}
