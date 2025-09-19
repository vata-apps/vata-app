import type { TreeWithStatus } from "$/types/tree-status";
import { getStatusInfo } from "$/utils/tree-status";
import type { CreateTreeInput, Tree, UpdateTreeInput } from "$db";
import { system, trees } from "$db";
import { DB_CONSTANTS, generateTreeFilePath } from "$db/constants";
import {
  BaseDirectory,
  copyFile,
  exists,
  mkdir,
  readDir,
  remove,
  rename,
} from "@tauri-apps/plugin-fs";

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
 * Ensure the trees directory exists in app data
 */
async function ensureTreesDirectoryExists(): Promise<void> {
  const treesDirExists = await exists(DB_CONSTANTS.TREES_DIRECTORY, {
    baseDir: BaseDirectory.AppData,
  });

  if (!treesDirExists) {
    await mkdir(DB_CONSTANTS.TREES_DIRECTORY, {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });
  }
}

/**
 * Format error for consistent error messages
 */
function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Rename a tree database file safely
 */
async function renameTreeDatabaseFile(
  oldPath: string,
  newPath: string,
): Promise<void> {
  const newPathExists = await exists(newPath, {
    baseDir: BaseDirectory.AppData,
  });
  if (newPathExists) {
    throw new Error(`Database file already exists at ${newPath}`);
  }

  const oldPathExists = await exists(oldPath, {
    baseDir: BaseDirectory.AppData,
  });
  if (!oldPathExists) {
    throw new Error(`Source database file not found at ${oldPath}`);
  }

  try {
    await rename(oldPath, newPath, {
      oldPathBaseDir: BaseDirectory.AppData,
      newPathBaseDir: BaseDirectory.AppData,
    });
  } catch {
    await copyFile(oldPath, newPath, {
      fromPathBaseDir: BaseDirectory.AppData,
      toPathBaseDir: BaseDirectory.AppData,
    });

    await remove(oldPath, { baseDir: BaseDirectory.AppData });
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
  const tree = await system.trees.createTree(input);

  try {
    await ensureTreesDirectoryExists();
    await trees.initializeTreeDatabase(tree.id);
    return tree;
  } catch (error) {
    await system.trees.deleteTree(tree.id);
    throw new Error(`Failed to create tree database: ${formatError(error)}`);
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

  const updatedInput = { ...input, file_path: newFilePath };
  const updatedTree = await system.trees.updateTree(treeId, updatedInput);

  try {
    await renameTreeDatabaseFile(currentTree.file_path, newFilePath);
    return updatedTree;
  } catch (error) {
    // Rollback database changes if file rename fails
    try {
      await system.trees.updateTree(treeId, {
        file_path: currentTree.file_path,
      });
    } catch {
      // Rollback failed - log this in production
    }

    throw new Error(`Failed to rename tree database: ${formatError(error)}`);
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

  const fileExists = await exists(tree.file_path, {
    baseDir: BaseDirectory.AppData,
  });
  if (fileExists) {
    await remove(tree.file_path, { baseDir: BaseDirectory.AppData });
  }

  await system.trees.deleteTree(treeId);
}

/**
 * Simple function to check if a tree file exists
 * @param filePath - Path to check
 * @returns Promise with boolean indicating if file exists
 */
export async function checkTreeFileExists(filePath: string): Promise<boolean> {
  try {
    return await exists(filePath, {
      baseDir: BaseDirectory.AppData,
    });
  } catch {
    return false;
  }
}

/**
 * Simple function to get all unregistered database files
 * @returns Promise with array of unregistered file paths
 */
export async function getUnregisteredFiles(): Promise<string[]> {
  try {
    await ensureTreesDirectoryExists();

    const treesDirExists = await exists(DB_CONSTANTS.TREES_DIRECTORY, {
      baseDir: BaseDirectory.AppData,
    });

    if (!treesDirExists) {
      return [];
    }

    const allTrees = await system.trees.getAllTrees();
    const registeredPaths = new Set(allTrees.map((tree) => tree.file_path));

    const dirEntries = await readDir(DB_CONSTANTS.TREES_DIRECTORY, {
      baseDir: BaseDirectory.AppData,
    });

    const unregisteredFiles: string[] = [];

    for (const entry of dirEntries) {
      if (entry.isFile && entry.name.endsWith(DB_CONSTANTS.DB_FILE_EXTENSION)) {
        const filePath = `${DB_CONSTANTS.TREES_DIRECTORY}/${entry.name}`;
        if (!registeredPaths.has(filePath)) {
          unregisteredFiles.push(filePath);
        }
      }
    }

    return unregisteredFiles;
  } catch (error) {
    console.error("Error getting unregistered files:", error);
    return [];
  }
}

/**
 * Simple function to remove an orphaned tree from database
 * @param treeId - Tree ID to remove
 * @returns Promise that resolves when removal is complete
 */
export async function removeOrphanedTree(treeId: string): Promise<void> {
  const tree = await getTreeByIdOrThrow(treeId);

  // Check that the file doesn't exist
  const fileExists = await checkTreeFileExists(tree.file_path);

  if (fileExists) {
    throw new Error(
      `Tree file exists at ${tree.file_path}. This is not an orphaned tree.`,
    );
  }

  await system.trees.deleteTree(treeId);
}

/**
 * Simple function to register an unregistered file
 * @param filePath - Path to the file
 * @param treeName - Name for the tree
 * @param description - Optional description
 * @returns Promise with the created tree
 */
export async function registerUnregisteredFile(
  filePath: string,
  treeName: string,
  description?: string,
): Promise<Tree> {
  // Verify the file exists
  const fileExists = await checkTreeFileExists(filePath);
  if (!fileExists) {
    throw new Error(`File does not exist at ${filePath}`);
  }

  // Check if name already exists
  const existingTree = await system.trees.getTreeByName(treeName);
  if (existingTree) {
    throw new Error(`Tree with name "${treeName}" already exists`);
  }

  // Create tree with the existing file path
  const tree = await system.trees.createTree({
    name: treeName,
    description,
  });

  // Update with the correct file path
  const updatedTree = await system.trees.updateTree(tree.id, {
    file_path: filePath,
  });

  return updatedTree;
}

/**
 * Get all trees with detailed status information
 * Includes registered trees, orphaned trees, and unregistered files
 *
 * Status definitions:
 * - "healthy": Tree is registered in database and physical file exists
 * - "orphaned": Tree is registered in database but physical file is missing
 * - "unregistered": Physical file exists but is not registered in database
 *
 * @returns Promise with all trees and count
 */
export async function getAllTreesWithStatus(): Promise<{
  trees: TreeWithStatus[];
  count: number;
}> {
  try {
    // Ensure system database is initialized
    await system.initializeSystemDatabase();

    // Get all registered trees from database
    const registeredTrees = await system.trees.getAllTrees();

    // Get all unregistered files
    const unregisteredFilePaths = await getUnregisteredFiles();

    // Process registered trees to get detailed status
    const registeredTreesWithStatus = await Promise.all(
      registeredTrees.map(async (tree): Promise<TreeWithStatus> => {
        let fileExists = true;

        try {
          // Check if physical file exists
          fileExists = await checkTreeFileExists(tree.file_path);
        } catch (error) {
          console.error(`Error checking tree ${tree.id}:`, error);
          fileExists = false;
        }

        return {
          id: tree.id,
          label: tree.name,
          path: tree.file_path,
          created_at: tree.created_at.toISOString(),
          description: tree.description,
          status: getStatusInfo(tree.file_path, fileExists),
        };
      }),
    );

    // Create tree entries for unregistered files
    const unregisteredTrees: TreeWithStatus[] = unregisteredFilePaths.map(
      (filePath, index) => {
        // Extract name from file path (remove directory and extension)
        const fileName = filePath.split("/").pop() || "";
        const nameWithoutExt = fileName.replace(
          DB_CONSTANTS.DB_FILE_EXTENSION,
          "",
        );

        return {
          id: `unregistered-${index}`, // Temporary ID for unregistered files
          label: nameWithoutExt || "Unknown",
          path: filePath,
          created_at: undefined,
          description: undefined,
          status: {
            type: "unregistered" as const,
            message: "Error",
            details:
              "This database file was found but has not been imported into the application yet.",
          },
        };
      },
    );

    // Combine all trees
    const allTrees = [...registeredTreesWithStatus, ...unregisteredTrees];

    return {
      trees: allTrees,
      count: allTrees.length,
    };
  } catch (error) {
    console.error("Error getting trees with status:", error);
    throw new Error(`Failed to get trees with status: ${formatError(error)}`);
  }
}
