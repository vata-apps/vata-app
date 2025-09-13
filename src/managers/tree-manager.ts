import { system, trees } from "$db";
import type { CreateTreeInput, UpdateTreeInput, Tree } from "$db";
import { exists, rename, remove, BaseDirectory } from "@tauri-apps/plugin-fs";

/**
 * Get a tree by ID and ensure it exists
 * @param treeId - Tree ID to retrieve
 * @returns Promise with the tree (guaranteed to exist)
 * @throws Error if tree not found
 */
async function getTreeByIdOrThrow(treeId: string): Promise<Tree> {
  const tree = await system.trees.getTreeById(treeId);
  if (!tree) {
    throw new Error(`Tree with ID ${treeId} not found`);
  }
  return tree;
}

/**
 * Generate a file path for a tree based on its name
 * @param name - Tree name
 * @returns Sanitized file path
 */
function generateTreeFilePath(name: string): string {
  return `trees/${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.db`;
}

/**
 * Rename a tree database file
 * @param oldPath - Current file path
 * @param newPath - New file path
 */
async function renameTreeDatabaseFile(
  oldPath: string,
  newPath: string,
): Promise<void> {
  try {
    // Check if new path already exists
    const newPathExists = await exists(newPath, {
      baseDir: BaseDirectory.AppData,
    });
    if (newPathExists) {
      throw new Error(`Database file already exists at ${newPath}`);
    }

    // Check if old path exists
    const oldPathExists = await exists(oldPath, {
      baseDir: BaseDirectory.AppData,
    });
    if (!oldPathExists) {
      throw new Error(`Source database file not found at ${oldPath}`);
    }

    // Rename the file
    await rename(oldPath, newPath);
  } catch (error) {
    throw new Error(
      `Failed to rename database file: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Create a new complete family tree
 * - Creates the tree record in system database
 * - Initializes the physical tree database
 * - Seeds default data (place types, event types, event roles)
 * @param input - Tree data to create
 * @returns Promise with the created tree
 */
export async function createNewTree(input: CreateTreeInput): Promise<Tree> {
  // 1. Create tree record in system database (pure CRUD)
  const tree = await system.trees.createTree(input);

  try {
    // 2. Initialize the physical tree database (side effect)
    await trees.initializeTreeDatabase(tree.id);

    return tree;
  } catch (error) {
    // 3. Rollback: delete the tree record if database initialization fails
    await system.trees.deleteTree(tree.id);
    throw new Error(
      `Failed to create tree database: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Update an existing family tree
 * Handles both metadata updates and physical file operations when the tree name changes
 * @param treeId - Tree ID (as string)
 * @param input - Updated tree data
 * @returns Promise with the updated tree
 */
export async function updateTree(
  treeId: string,
  input: UpdateTreeInput,
): Promise<Tree> {
  if (!input.name) {
    return await system.trees.updateTree(treeId, input);
  }

  const currentTree = await getTreeByIdOrThrow(treeId);
  const newFilePath = generateTreeFilePath(input.name);

  if (newFilePath === currentTree.file_path) {
    return await system.trees.updateTree(treeId, input);
  }

  try {
    await renameTreeDatabaseFile(currentTree.file_path, newFilePath);

    const updatedInput = { ...input, file_path: newFilePath };
    return await system.trees.updateTree(treeId, updatedInput);
  } catch (error) {
    throw new Error(
      `Failed to rename tree database: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Delete a complete family tree
 * - Deletes the physical database file
 * - Deletes the tree record from system database
 * @param treeId - Tree ID (as string)
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteCompleteTree(treeId: string): Promise<void> {
  const tree = await getTreeByIdOrThrow(treeId);

  try {
    const fileExists = await exists(tree.file_path, {
      baseDir: BaseDirectory.AppData,
    });
    if (fileExists) {
      await remove(tree.file_path, { baseDir: BaseDirectory.AppData });
    }

    await system.trees.deleteTree(treeId);
  } catch (error) {
    throw new Error(
      `Failed to delete tree: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
