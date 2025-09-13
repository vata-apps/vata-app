import { withSystemDb } from "./connection";
import { SYSTEM_SCHEMA_SQL } from "./schema";

/**
 * Initialize the system database with required tables
 * This should be called when the application starts
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeSystemDatabase(): Promise<void> {
  try {
    await withSystemDb(async (database) => {
      await database.execute(SYSTEM_SCHEMA_SQL);
    });

    console.log("System database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize system database:", error);
    throw error;
  }
}
