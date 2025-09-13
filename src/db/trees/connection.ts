import Database from "@tauri-apps/plugin-sql";
import { withSystemDb } from "../system/connection";

/**
 * Connect to a specific tree database using the tree ID
 * This function looks up the tree path from the system database
 * then connects to the individual tree database
 * @param treeId - Tree ID (as string)
 * @returns Promise with database connection
 */
export async function connectToTreeDbById(treeId: string): Promise<Database> {
  const treeIdNum = parseInt(treeId, 10);
  if (isNaN(treeIdNum)) {
    throw new Error(`Invalid tree ID: ${treeId}`);
  }

  // Get the tree file path from the system database
  const treePath = await withSystemDb(async (systemDb) => {
    const result = await systemDb.select<Array<{ file_path: string }>>(
      "SELECT file_path FROM trees WHERE id = ?",
      [treeIdNum],
    );

    if (!result[0]) {
      throw new Error(`Tree with ID ${treeId} not found in system database`);
    }

    return result[0].file_path;
  });

  // Connect to the individual tree database
  const dbPath = `sqlite:${treePath}`;
  return Database.load(dbPath);
}

/**
 * Execute an operation on a tree database using the tree ID
 * This is the main function used by all tree-specific CRUD operations
 * @param treeId - Tree ID (as string)
 * @param operation - Function to execute with the database connection
 * @returns Promise with the operation result
 */
export function withTreeDbById<T>(
  treeId: string,
  operation: (database: Database) => Promise<T>,
): Promise<T> {
  return connectToTreeDbById(treeId).then(operation);
}
