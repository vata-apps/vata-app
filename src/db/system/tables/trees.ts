import { withSystemDb } from "../connection";
import { Tree, CreateTreeInput, UpdateTreeInput } from "../../types";

/**
 * Create a new family tree record in the system database
 * @param tree - Tree data to create
 * @returns Promise with the created tree
 */
export async function createTree(tree: CreateTreeInput): Promise<Tree> {
  return withSystemDb(async (database) => {
    const filePath = `trees/${tree.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.db`;

    const result = await database.execute(
      "INSERT INTO trees (name, file_path, description) VALUES (?, ?, ?) RETURNING id, name, file_path, created_at, description",
      [tree.name, filePath, tree.description || null],
    );

    const insertId = result.lastInsertId as number;

    // Convert the result to match our interface
    return {
      id: insertId.toString(),
      name: tree.name,
      file_path: filePath,
      created_at: new Date(),
      description: tree.description,
    };
  });
}

/**
 * Get all family trees from the system database
 * @returns Promise with array of all trees
 */
export async function getAllTrees(): Promise<Tree[]> {
  return withSystemDb(async (database) => {
    const result = await database.select<
      Array<{
        id: number;
        name: string;
        file_path: string;
        created_at: string;
        description: string | null;
      }>
    >(
      "SELECT id, name, file_path, created_at, description FROM trees ORDER BY name",
    );

    return result.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      file_path: row.file_path,
      created_at: new Date(row.created_at),
      description: row.description || undefined,
    }));
  });
}

/**
 * Get a specific family tree by ID
 * @param id - Tree ID (as string)
 * @returns Promise with the tree or null if not found
 */
export async function getTreeById(id: string): Promise<Tree | null> {
  return withSystemDb(async (database) => {
    const treeId = parseInt(id, 10);
    if (isNaN(treeId)) {
      throw new Error(`Invalid tree ID: ${id}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        name: string;
        file_path: string;
        created_at: string;
        description: string | null;
      }>
    >(
      "SELECT id, name, file_path, created_at, description FROM trees WHERE id = ?",
      [treeId],
    );

    if (!result[0]) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id.toString(),
      name: row.name,
      file_path: row.file_path,
      created_at: new Date(row.created_at),
      description: row.description || undefined,
    };
  });
}

/**
 * Get a specific family tree by name
 * @param name - Tree name
 * @returns Promise with the tree or null if not found
 */
export async function getTreeByName(name: string): Promise<Tree | null> {
  return withSystemDb(async (database) => {
    const result = await database.select<
      Array<{
        id: number;
        name: string;
        file_path: string;
        created_at: string;
        description: string | null;
      }>
    >(
      "SELECT id, name, file_path, created_at, description FROM trees WHERE name = ?",
      [name],
    );

    if (!result[0]) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id.toString(),
      name: row.name,
      file_path: row.file_path,
      created_at: new Date(row.created_at),
      description: row.description || undefined,
    };
  });
}

/**
 * Update an existing family tree
 * @param id - Tree ID (as string)
 * @param tree - Updated tree data
 * @returns Promise with the updated tree
 */
export async function updateTree(
  id: string,
  tree: UpdateTreeInput,
): Promise<Tree> {
  return withSystemDb(async (database) => {
    const treeId = parseInt(id, 10);
    if (isNaN(treeId)) {
      throw new Error(`Invalid tree ID: ${id}`);
    }

    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (tree.name !== undefined) {
      updates.push("name = ?");
      values.push(tree.name);
    }
    if (tree.description !== undefined) {
      updates.push("description = ?");
      values.push(tree.description);
    }

    if (updates.length === 0) {
      // No updates, return current tree
      const current = await getTreeById(id);
      if (!current) {
        throw new Error(`Tree with ID ${id} not found`);
      }
      return current;
    }

    values.push(treeId.toString());
    await database.execute(
      `UPDATE trees SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values,
    );

    const updated = await getTreeById(id);
    if (!updated) {
      throw new Error(`Tree with ID ${id} not found after update`);
    }

    return updated;
  });
}

/**
 * Delete a family tree from the system database
 * Note: This only removes the record, not the actual database file
 * @param id - Tree ID (as string)
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteTree(id: string): Promise<void> {
  return withSystemDb(async (database) => {
    const treeId = parseInt(id, 10);
    if (isNaN(treeId)) {
      throw new Error(`Invalid tree ID: ${id}`);
    }

    await database.execute("DELETE FROM trees WHERE id = ?", [treeId]);
  });
}
