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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createNewTree,
  deleteCompleteTree,
  getAllTreesWithStatus,
  updateTree,
} from "./tree-manager";

// Mock the database modules
vi.mock("$db", () => ({
  system: {
    initializeSystemDatabase: vi.fn(),
    trees: {
      createTree: vi.fn(),
      updateTree: vi.fn(),
      deleteTree: vi.fn(),
      getTreeById: vi.fn(),
      getAllTrees: vi.fn(),
      getTreeByName: vi.fn(),
    },
  },
  trees: {
    initializeTreeDatabase: vi.fn(),
  },
}));

// Mock the file system operations
vi.mock("@tauri-apps/plugin-fs", () => ({
  exists: vi.fn(),
  rename: vi.fn(),
  remove: vi.fn(),
  copyFile: vi.fn(),
  mkdir: vi.fn(),
  readDir: vi.fn(),
  BaseDirectory: {
    AppData: "AppData",
  },
}));

// Mock the constants
vi.mock("$db/constants", () => ({
  generateTreeFilePath: vi.fn(),
  DB_CONSTANTS: {
    TREES_DIRECTORY: "trees",
    DB_FILE_EXTENSION: ".db",
  },
}));

describe("TreeManager", () => {
  const mockTree: Tree = {
    id: "tree-123",
    name: "Test Family Tree",
    file_path: "trees/test_family_tree.db",
    created_at: new Date("2024-01-01"),
    description: "A test family tree",
  };

  const mockCreateInput: CreateTreeInput = {
    name: "Test Family Tree",
    description: "A test family tree",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createNewTree", () => {
    it("should create a new tree successfully", async () => {
      // Arrange
      const mockCreatedTree = { ...mockTree };
      vi.mocked(system.trees.createTree).mockResolvedValue(mockCreatedTree);
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(mkdir).mockResolvedValue(undefined);
      vi.mocked(trees.initializeTreeDatabase).mockResolvedValue(undefined);

      // Act
      const result = await createNewTree(mockCreateInput);

      // Assert
      expect(system.trees.createTree).toHaveBeenCalledWith(mockCreateInput);
      expect(exists).toHaveBeenCalledWith(DB_CONSTANTS.TREES_DIRECTORY, {
        baseDir: BaseDirectory.AppData,
      });
      expect(mkdir).toHaveBeenCalledWith(DB_CONSTANTS.TREES_DIRECTORY, {
        baseDir: BaseDirectory.AppData,
        recursive: true,
      });
      expect(trees.initializeTreeDatabase).toHaveBeenCalledWith(
        mockCreatedTree.id,
      );
      expect(result).toEqual(mockCreatedTree);
    });

    it("should create trees directory if it does not exist", async () => {
      // Arrange
      const mockCreatedTree = { ...mockTree };
      vi.mocked(system.trees.createTree).mockResolvedValue(mockCreatedTree);
      vi.mocked(exists).mockResolvedValue(false); // Directory doesn't exist
      vi.mocked(mkdir).mockResolvedValue(undefined);
      vi.mocked(trees.initializeTreeDatabase).mockResolvedValue(undefined);

      // Act
      await createNewTree(mockCreateInput);

      // Assert
      expect(mkdir).toHaveBeenCalledWith(DB_CONSTANTS.TREES_DIRECTORY, {
        baseDir: BaseDirectory.AppData,
        recursive: true,
      });
    });

    it("should not create trees directory if it already exists", async () => {
      // Arrange
      const mockCreatedTree = { ...mockTree };
      vi.mocked(system.trees.createTree).mockResolvedValue(mockCreatedTree);
      vi.mocked(exists).mockResolvedValue(true); // Directory exists
      vi.mocked(trees.initializeTreeDatabase).mockResolvedValue(undefined);

      // Act
      await createNewTree(mockCreateInput);

      // Assert
      expect(mkdir).not.toHaveBeenCalled();
    });

    it("should rollback tree creation if database initialization fails", async () => {
      // Arrange
      const mockCreatedTree = { ...mockTree };
      const dbError = new Error("Database initialization failed");
      vi.mocked(system.trees.createTree).mockResolvedValue(mockCreatedTree);
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(mkdir).mockResolvedValue(undefined);
      vi.mocked(trees.initializeTreeDatabase).mockRejectedValue(dbError);
      vi.mocked(system.trees.deleteTree).mockResolvedValue(undefined);

      // Act & Assert
      await expect(createNewTree(mockCreateInput)).rejects.toThrow(
        "Failed to create tree database: Database initialization failed",
      );
      expect(system.trees.deleteTree).toHaveBeenCalledWith(mockCreatedTree.id);
    });

    it("should handle non-Error objects in error formatting", async () => {
      // Arrange
      const mockCreatedTree = { ...mockTree };
      vi.mocked(system.trees.createTree).mockResolvedValue(mockCreatedTree);
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(mkdir).mockResolvedValue(undefined);
      vi.mocked(trees.initializeTreeDatabase).mockRejectedValue("String error");
      vi.mocked(system.trees.deleteTree).mockResolvedValue(undefined);

      // Act & Assert
      await expect(createNewTree(mockCreateInput)).rejects.toThrow(
        "Failed to create tree database: String error",
      );
    });
  });

  describe("updateTree", () => {
    it("should update tree metadata without name change", async () => {
      // Arrange
      const updateInput: UpdateTreeInput = {
        description: "Updated description",
      };
      const updatedTree = { ...mockTree, description: "Updated description" };
      vi.mocked(system.trees.updateTree).mockResolvedValue(updatedTree);

      // Act
      const result = await updateTree(mockTree.id, updateInput);

      // Assert
      expect(system.trees.updateTree).toHaveBeenCalledWith(
        mockTree.id,
        updateInput,
      );
      expect(result).toEqual(updatedTree);
    });

    it("should update tree with name change but same file path", async () => {
      // Arrange
      const updateInput: UpdateTreeInput = { name: "Test Family Tree" }; // Same name
      const updatedTree = { ...mockTree };
      vi.mocked(system.trees.getTreeById).mockResolvedValue(mockTree);
      vi.mocked(system.trees.updateTree).mockResolvedValue(updatedTree);
      vi.mocked(generateTreeFilePath).mockReturnValue(mockTree.file_path);

      // Act
      const result = await updateTree(mockTree.id, updateInput);

      // Assert
      expect(system.trees.updateTree).toHaveBeenCalledWith(
        mockTree.id,
        updateInput,
      );
      expect(result).toEqual(updatedTree);
    });

    it("should update tree with name change and rename database file", async () => {
      // Arrange
      const newName = "New Family Tree Name";
      const newFilePath = "trees/new_family_tree_name.db";
      const updateInput: UpdateTreeInput = { name: newName };
      const updatedTree = {
        ...mockTree,
        name: newName,
        file_path: newFilePath,
      };

      vi.mocked(system.trees.getTreeById).mockResolvedValue(mockTree);
      vi.mocked(generateTreeFilePath).mockReturnValue(newFilePath);
      vi.mocked(system.trees.updateTree).mockResolvedValue(updatedTree);
      vi.mocked(exists).mockResolvedValue(false); // New path doesn't exist
      vi.mocked(exists)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true); // Old path exists
      vi.mocked(rename).mockResolvedValue(undefined);

      // Act
      const result = await updateTree(mockTree.id, updateInput);

      // Assert
      expect(system.trees.updateTree).toHaveBeenCalledWith(mockTree.id, {
        ...updateInput,
        file_path: newFilePath,
      });
      expect(rename).toHaveBeenCalledWith(mockTree.file_path, newFilePath, {
        oldPathBaseDir: BaseDirectory.AppData,
        newPathBaseDir: BaseDirectory.AppData,
      });
      expect(result).toEqual(updatedTree);
    });

    it("should rollback database changes if file rename fails", async () => {
      // Arrange
      const newName = "New Family Tree Name";
      const newFilePath = "trees/new_family_tree_name.db";
      const updateInput: UpdateTreeInput = { name: newName };
      const updatedTree = {
        ...mockTree,
        name: newName,
        file_path: newFilePath,
      };
      const copyError = new Error("Copy file failed");

      vi.mocked(system.trees.getTreeById).mockResolvedValue(mockTree);
      vi.mocked(generateTreeFilePath).mockReturnValue(newFilePath);
      vi.mocked(system.trees.updateTree)
        .mockResolvedValueOnce(updatedTree) // First call succeeds
        .mockResolvedValueOnce(mockTree); // Rollback call succeeds
      vi.mocked(exists)
        .mockResolvedValueOnce(false) // New path doesn't exist
        .mockResolvedValueOnce(true); // Old path exists
      vi.mocked(rename).mockRejectedValue(new Error("Rename failed"));
      vi.mocked(copyFile).mockRejectedValue(copyError);

      // Act & Assert
      await expect(updateTree(mockTree.id, updateInput)).rejects.toThrow(
        "Failed to rename tree database: Copy file failed",
      );
      expect(system.trees.updateTree).toHaveBeenCalledWith(mockTree.id, {
        file_path: mockTree.file_path,
      });
    });

    it("should throw error if tree not found", async () => {
      // Arrange
      const updateInput: UpdateTreeInput = { name: "New Name" };
      vi.mocked(system.trees.getTreeById).mockResolvedValue(null);

      // Act & Assert
      await expect(updateTree("non-existent-id", updateInput)).rejects.toThrow(
        "Tree with ID non-existent-id not found",
      );
    });

    it("should throw error if new file path already exists", async () => {
      // Arrange
      const newName = "New Family Tree Name";
      const newFilePath = "trees/new_family_tree_name.db";
      const updateInput: UpdateTreeInput = { name: newName };

      vi.mocked(system.trees.getTreeById).mockResolvedValue(mockTree);
      vi.mocked(generateTreeFilePath).mockReturnValue(newFilePath);
      vi.mocked(exists).mockResolvedValue(true); // New path already exists

      // Act & Assert
      await expect(updateTree(mockTree.id, updateInput)).rejects.toThrow(
        `Database file already exists at ${newFilePath}`,
      );
    });

    it("should throw error if old file path does not exist", async () => {
      // Arrange
      const newName = "New Family Tree Name";
      const newFilePath = "trees/new_family_tree_name.db";
      const updateInput: UpdateTreeInput = { name: newName };

      vi.mocked(system.trees.getTreeById).mockResolvedValue(mockTree);
      vi.mocked(generateTreeFilePath).mockReturnValue(newFilePath);
      vi.mocked(exists)
        .mockResolvedValueOnce(false) // New path doesn't exist
        .mockResolvedValueOnce(false); // Old path doesn't exist

      // Act & Assert
      await expect(updateTree(mockTree.id, updateInput)).rejects.toThrow(
        `Source database file not found at ${mockTree.file_path}`,
      );
    });

    it("should use copyFile and remove if rename fails", async () => {
      // Arrange
      const newName = "New Family Tree Name";
      const newFilePath = "trees/new_family_tree_name.db";
      const updateInput: UpdateTreeInput = { name: newName };
      const updatedTree = {
        ...mockTree,
        name: newName,
        file_path: newFilePath,
      };

      vi.mocked(system.trees.getTreeById).mockResolvedValue(mockTree);
      vi.mocked(generateTreeFilePath).mockReturnValue(newFilePath);
      vi.mocked(system.trees.updateTree).mockResolvedValue(updatedTree);
      vi.mocked(exists).mockResolvedValue(false); // New path doesn't exist
      vi.mocked(exists)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true); // Old path exists
      vi.mocked(rename).mockRejectedValue(new Error("Rename failed"));
      vi.mocked(copyFile).mockResolvedValue(undefined);
      vi.mocked(remove).mockResolvedValue(undefined);

      // Act
      const result = await updateTree(mockTree.id, updateInput);

      // Assert
      expect(copyFile).toHaveBeenCalledWith(mockTree.file_path, newFilePath, {
        fromPathBaseDir: BaseDirectory.AppData,
        toPathBaseDir: BaseDirectory.AppData,
      });
      expect(remove).toHaveBeenCalledWith(mockTree.file_path, {
        baseDir: BaseDirectory.AppData,
      });
      expect(result).toEqual(updatedTree);
    });
  });

  describe("deleteCompleteTree", () => {
    it("should delete tree and remove database file", async () => {
      // Arrange
      vi.mocked(system.trees.getTreeById).mockResolvedValue(mockTree);
      vi.mocked(exists).mockResolvedValue(true); // File exists
      vi.mocked(remove).mockResolvedValue(undefined);
      vi.mocked(system.trees.deleteTree).mockResolvedValue(undefined);

      // Act
      await deleteCompleteTree(mockTree.id);

      // Assert
      expect(exists).toHaveBeenCalledWith(mockTree.file_path, {
        baseDir: BaseDirectory.AppData,
      });
      expect(remove).toHaveBeenCalledWith(mockTree.file_path, {
        baseDir: BaseDirectory.AppData,
      });
      expect(system.trees.deleteTree).toHaveBeenCalledWith(mockTree.id);
    });

    it("should delete tree even if database file does not exist", async () => {
      // Arrange
      vi.mocked(system.trees.getTreeById).mockResolvedValue(mockTree);
      vi.mocked(exists).mockResolvedValue(false); // File doesn't exist
      vi.mocked(system.trees.deleteTree).mockResolvedValue(undefined);

      // Act
      await deleteCompleteTree(mockTree.id);

      // Assert
      expect(remove).not.toHaveBeenCalled();
      expect(system.trees.deleteTree).toHaveBeenCalledWith(mockTree.id);
    });

    it("should throw error if tree not found", async () => {
      // Arrange
      vi.mocked(system.trees.getTreeById).mockResolvedValue(null);

      // Act & Assert
      await expect(deleteCompleteTree("non-existent-id")).rejects.toThrow(
        "Tree with ID non-existent-id not found",
      );
    });

    it("should handle file removal errors gracefully", async () => {
      // Arrange
      const removeError = new Error("File removal failed");
      vi.mocked(system.trees.getTreeById).mockResolvedValue(mockTree);
      vi.mocked(exists).mockResolvedValue(true); // File exists
      vi.mocked(remove).mockRejectedValue(removeError);
      vi.mocked(system.trees.deleteTree).mockResolvedValue(undefined);

      // Act & Assert
      await expect(deleteCompleteTree(mockTree.id)).rejects.toThrow(
        "File removal failed",
      );
      expect(system.trees.deleteTree).not.toHaveBeenCalled();
    });
  });

  describe("Helper Functions", () => {
    describe("getTreeByIdOrThrow", () => {
      it("should return tree if found", async () => {
        // This function is not exported, so we test it indirectly through updateTree
        vi.mocked(system.trees.getTreeById).mockResolvedValue(mockTree);
        vi.mocked(generateTreeFilePath).mockReturnValue(mockTree.file_path);
        vi.mocked(system.trees.updateTree).mockResolvedValue(mockTree);

        const result = await updateTree(mockTree.id, { description: "test" });

        expect(result).toEqual(mockTree);
      });

      it("should throw error if tree not found", async () => {
        vi.mocked(system.trees.getTreeById).mockResolvedValue(null);

        await expect(
          updateTree("non-existent-id", { name: "test" }),
        ).rejects.toThrow("Tree with ID non-existent-id not found");
      });
    });

    describe("formatError", () => {
      it("should format Error objects correctly", async () => {
        // Test through createNewTree error handling
        const mockCreatedTree = { ...mockTree };
        const testError = new Error("Test error message");
        vi.mocked(system.trees.createTree).mockResolvedValue(mockCreatedTree);
        vi.mocked(exists).mockResolvedValue(false);
        vi.mocked(mkdir).mockResolvedValue(undefined);
        vi.mocked(trees.initializeTreeDatabase).mockRejectedValue(testError);
        vi.mocked(system.trees.deleteTree).mockResolvedValue(undefined);

        await expect(createNewTree(mockCreateInput)).rejects.toThrow(
          "Failed to create tree database: Test error message",
        );
      });

      it("should format non-Error objects correctly", async () => {
        // Test through createNewTree error handling
        const mockCreatedTree = { ...mockTree };
        vi.mocked(system.trees.createTree).mockResolvedValue(mockCreatedTree);
        vi.mocked(exists).mockResolvedValue(false);
        vi.mocked(mkdir).mockResolvedValue(undefined);
        vi.mocked(trees.initializeTreeDatabase).mockRejectedValue(
          "String error",
        );
        vi.mocked(system.trees.deleteTree).mockResolvedValue(undefined);

        await expect(createNewTree(mockCreateInput)).rejects.toThrow(
          "Failed to create tree database: String error",
        );
      });
    });

    describe("ensureTreesDirectoryExists", () => {
      it("should create directory if it does not exist", async () => {
        // Test through createNewTree
        const mockCreatedTree = { ...mockTree };
        vi.mocked(system.trees.createTree).mockResolvedValue(mockCreatedTree);
        vi.mocked(exists).mockResolvedValue(false); // Directory doesn't exist
        vi.mocked(mkdir).mockResolvedValue(undefined);
        vi.mocked(trees.initializeTreeDatabase).mockResolvedValue(undefined);

        await createNewTree(mockCreateInput);

        expect(mkdir).toHaveBeenCalledWith(DB_CONSTANTS.TREES_DIRECTORY, {
          baseDir: BaseDirectory.AppData,
          recursive: true,
        });
      });

      it("should not create directory if it already exists", async () => {
        // Test through createNewTree
        const mockCreatedTree = { ...mockTree };
        vi.mocked(system.trees.createTree).mockResolvedValue(mockCreatedTree);
        vi.mocked(exists).mockResolvedValue(true); // Directory exists
        vi.mocked(trees.initializeTreeDatabase).mockResolvedValue(undefined);

        await createNewTree(mockCreateInput);

        expect(mkdir).not.toHaveBeenCalled();
      });
    });

    describe("renameTreeDatabaseFile", () => {
      it("should throw error if new path already exists", async () => {
        // Test through updateTree
        const newName = "New Family Tree Name";
        const newFilePath = "trees/new_family_tree_name.db";
        const updateInput: UpdateTreeInput = { name: newName };

        vi.mocked(system.trees.getTreeById).mockResolvedValue(mockTree);
        vi.mocked(generateTreeFilePath).mockReturnValue(newFilePath);
        vi.mocked(exists).mockResolvedValue(true); // New path already exists

        await expect(updateTree(mockTree.id, updateInput)).rejects.toThrow(
          `Database file already exists at ${newFilePath}`,
        );
      });

      it("should throw error if old path does not exist", async () => {
        // Test through updateTree
        const newName = "New Family Tree Name";
        const newFilePath = "trees/new_family_tree_name.db";
        const updateInput: UpdateTreeInput = { name: newName };

        vi.mocked(system.trees.getTreeById).mockResolvedValue(mockTree);
        vi.mocked(generateTreeFilePath).mockReturnValue(newFilePath);
        vi.mocked(exists)
          .mockResolvedValueOnce(false) // New path doesn't exist
          .mockResolvedValueOnce(false); // Old path doesn't exist

        await expect(updateTree(mockTree.id, updateInput)).rejects.toThrow(
          `Source database file not found at ${mockTree.file_path}`,
        );
      });
    });
  });

  describe("getAllTreesWithStatus", () => {
    const mockRegisteredTrees: Tree[] = [
      {
        id: "tree-1",
        name: "Family Tree 1",
        description: "First tree",
        file_path: "trees/family_tree_1.db",
        created_at: new Date("2024-01-01"),
      },
      {
        id: "tree-2",
        name: "Family Tree 2",
        description: "Second tree",
        file_path: "trees/family_tree_2.db",
        created_at: new Date("2024-01-02"),
      },
      {
        id: "tree-3",
        name: "Orphaned Tree",
        description: "Tree without file",
        file_path: "trees/orphaned_tree.db",
        created_at: new Date("2024-01-03"),
      },
    ];

    const mockDirEntries = [
      {
        name: "family_tree_1.db",
        isFile: true,
        isDirectory: false,
        isSymlink: false,
      },
      {
        name: "family_tree_2.db",
        isFile: true,
        isDirectory: false,
        isSymlink: false,
      },
      {
        name: "unregistered_tree.db",
        isFile: true,
        isDirectory: false,
        isSymlink: false,
      },
      {
        name: "some_folder",
        isFile: false,
        isDirectory: true,
        isSymlink: false,
      },
      {
        name: "not_a_db.txt",
        isFile: true,
        isDirectory: false,
        isSymlink: false,
      },
    ];

    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(system.initializeSystemDatabase).mockResolvedValue(undefined);
      vi.mocked(system.trees.getAllTrees).mockResolvedValue(
        mockRegisteredTrees,
      );
    });

    it("should return all healthy, orphaned, and unregistered trees", async () => {
      // Arrange
      vi.mocked(exists)
        .mockResolvedValueOnce(true) // trees directory exists (for getUnregisteredFiles)
        .mockResolvedValueOnce(true) // trees directory exists (for ensureTreesDirectoryExists)
        .mockResolvedValueOnce(true) // tree-1 file exists
        .mockResolvedValueOnce(true) // tree-2 file exists
        .mockResolvedValueOnce(false); // tree-3 file doesn't exist (orphaned)

      vi.mocked(readDir).mockResolvedValue(mockDirEntries);

      // Act
      const result = await getAllTreesWithStatus();

      // Assert
      expect(result.count).toBe(4); // 3 registered + 1 unregistered
      expect(result.trees).toHaveLength(4);

      // Check healthy trees
      const healthyTrees = result.trees.filter(
        (t) => t.status.type === "healthy",
      );
      expect(healthyTrees).toHaveLength(2);
      expect(healthyTrees[0].id).toBe("tree-1");
      expect(healthyTrees[1].id).toBe("tree-2");

      // Check orphaned tree
      const orphanedTrees = result.trees.filter(
        (t) => t.status.type === "orphaned",
      );
      expect(orphanedTrees).toHaveLength(1);
      expect(orphanedTrees[0].id).toBe("tree-3");
      expect(orphanedTrees[0].label).toBe("Orphaned Tree");

      // Check unregistered tree
      const unregisteredTrees = result.trees.filter(
        (t) => t.status.type === "unregistered",
      );
      expect(unregisteredTrees).toHaveLength(1);
      expect(unregisteredTrees[0].id).toBe("unregistered-0");
      expect(unregisteredTrees[0].label).toBe("unregistered_tree");
      expect(unregisteredTrees[0].path).toBe("trees/unregistered_tree.db");
    });

    it("should handle when all trees are healthy", async () => {
      // Arrange
      const healthyTrees = mockRegisteredTrees.slice(0, 2); // Only first two trees
      vi.mocked(system.trees.getAllTrees).mockResolvedValue(healthyTrees);
      vi.mocked(exists)
        .mockResolvedValueOnce(true) // trees directory exists (for getUnregisteredFiles)
        .mockResolvedValueOnce(true) // trees directory exists (for ensureTreesDirectoryExists)
        .mockResolvedValueOnce(true) // tree-1 file exists
        .mockResolvedValueOnce(true); // tree-2 file exists

      vi.mocked(readDir).mockResolvedValue([
        mockDirEntries[0], // family_tree_1.db
        mockDirEntries[1], // family_tree_2.db
      ]);

      // Act
      const result = await getAllTreesWithStatus();

      // Assert
      expect(result.count).toBe(2);
      expect(result.trees).toHaveLength(2);
      expect(result.trees.every((t) => t.status.type === "healthy")).toBe(true);
    });

    it("should handle when all trees are orphaned", async () => {
      // Arrange
      vi.mocked(exists)
        .mockResolvedValueOnce(true) // trees directory exists (for getUnregisteredFiles)
        .mockResolvedValueOnce(true) // trees directory exists (for ensureTreesDirectoryExists)
        .mockResolvedValueOnce(false) // tree-1 file doesn't exist
        .mockResolvedValueOnce(false) // tree-2 file doesn't exist
        .mockResolvedValueOnce(false); // tree-3 file doesn't exist

      vi.mocked(readDir).mockResolvedValue([]); // No files in directory

      // Act
      const result = await getAllTreesWithStatus();

      // Assert
      expect(result.count).toBe(3);
      expect(result.trees).toHaveLength(3);
      expect(result.trees.every((t) => t.status.type === "orphaned")).toBe(
        true,
      );
    });

    it("should handle only unregistered files", async () => {
      // Arrange
      vi.mocked(system.trees.getAllTrees).mockResolvedValue([]); // No registered trees
      vi.mocked(exists).mockResolvedValue(true); // trees directory exists

      vi.mocked(readDir).mockResolvedValue([
        {
          name: "unregistered1.db",
          isFile: true,
          isDirectory: false,
          isSymlink: false,
        },
        {
          name: "unregistered2.db",
          isFile: true,
          isDirectory: false,
          isSymlink: false,
        },
      ]);

      // Act
      const result = await getAllTreesWithStatus();

      // Assert
      expect(result.count).toBe(2);
      expect(result.trees).toHaveLength(2);
      expect(result.trees.every((t) => t.status.type === "unregistered")).toBe(
        true,
      );
      expect(result.trees[0].id).toBe("unregistered-0");
      expect(result.trees[0].label).toBe("unregistered1");
      expect(result.trees[1].id).toBe("unregistered-1");
      expect(result.trees[1].label).toBe("unregistered2");
    });

    it("should handle empty state (no trees at all)", async () => {
      // Arrange
      vi.mocked(system.trees.getAllTrees).mockResolvedValue([]);
      vi.mocked(exists).mockResolvedValue(true); // trees directory exists
      vi.mocked(readDir).mockResolvedValue([]); // No files

      // Act
      const result = await getAllTreesWithStatus();

      // Assert
      expect(result.count).toBe(0);
      expect(result.trees).toHaveLength(0);
    });

    it("should handle trees directory not existing", async () => {
      // Arrange
      vi.mocked(system.trees.getAllTrees).mockResolvedValue(
        mockRegisteredTrees,
      );
      vi.mocked(exists)
        .mockResolvedValueOnce(true) // ensureTreesDirectoryExists check
        .mockResolvedValueOnce(false) // trees directory doesn't exist (for unregistered check)
        .mockResolvedValueOnce(true) // tree-1 file exists
        .mockResolvedValueOnce(true) // tree-2 file exists
        .mockResolvedValueOnce(false); // tree-3 file doesn't exist

      // Act
      const result = await getAllTreesWithStatus();

      // Assert
      expect(result.count).toBe(3); // Only registered trees
      expect(result.trees).toHaveLength(3);
      // Should not have attempted to read directory because it doesn't exist
      expect(readDir).not.toHaveBeenCalled();
    });

    it("should handle error checking file existence gracefully", async () => {
      // Arrange
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(exists)
        .mockResolvedValueOnce(true) // trees directory exists (for getUnregisteredFiles)
        .mockResolvedValueOnce(true) // trees directory exists (for ensureTreesDirectoryExists)
        .mockRejectedValueOnce(new Error("Permission denied")) // tree-1 check fails
        .mockResolvedValueOnce(true) // tree-2 file exists
        .mockResolvedValueOnce(false); // tree-3 file doesn't exist

      vi.mocked(readDir).mockResolvedValue([]);

      // Act
      const result = await getAllTreesWithStatus();

      // Assert
      expect(result.count).toBe(3);
      expect(result.trees).toHaveLength(3);

      // Tree with error should be marked as orphaned
      const tree1 = result.trees.find((t) => t.id === "tree-1");
      expect(tree1?.status.type).toBe("orphaned");

      // Note: checkTreeFileExists handles errors silently, so no console.error is expected
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should handle readDir errors gracefully", async () => {
      // Arrange
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(exists)
        .mockResolvedValueOnce(true) // trees directory exists (for getUnregisteredFiles)
        .mockResolvedValueOnce(true) // trees directory exists (for ensureTreesDirectoryExists)
        .mockResolvedValueOnce(true) // tree-1 file exists
        .mockResolvedValueOnce(true) // tree-2 file exists
        .mockResolvedValueOnce(true); // tree-3 file exists

      vi.mocked(readDir).mockRejectedValue(new Error("Permission denied"));

      // Act
      const result = await getAllTreesWithStatus();

      // Assert
      expect(result.count).toBe(3); // Only registered trees
      expect(result.trees).toHaveLength(3);
      expect(result.trees.every((t) => t.status.type === "healthy")).toBe(true);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error getting unregistered files:",
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it("should properly extract names from file paths for unregistered files", async () => {
      // Arrange
      vi.mocked(system.trees.getAllTrees).mockResolvedValue([]);
      vi.mocked(exists).mockResolvedValue(true);

      vi.mocked(readDir).mockResolvedValue([
        {
          name: "my_family_tree.db",
          isFile: true,
          isDirectory: false,
          isSymlink: false,
        },
        {
          name: "another-tree.db",
          isFile: true,
          isDirectory: false,
          isSymlink: false,
        },
        {
          name: "Test Tree 2024.db",
          isFile: true,
          isDirectory: false,
          isSymlink: false,
        },
      ]);

      // Act
      const result = await getAllTreesWithStatus();

      // Assert
      expect(result.trees[0].label).toBe("my_family_tree");
      expect(result.trees[1].label).toBe("another-tree");
      expect(result.trees[2].label).toBe("Test Tree 2024");
    });

    it("should handle database initialization error", async () => {
      // Arrange
      const initError = new Error("Failed to initialize database");
      vi.mocked(system.initializeSystemDatabase).mockRejectedValue(initError);

      // Act & Assert
      await expect(getAllTreesWithStatus()).rejects.toThrow(
        "Failed to get trees with status: Failed to initialize database",
      );
    });

    it("should handle getAllTrees error", async () => {
      // Arrange
      const dbError = new Error("Database query failed");
      vi.mocked(system.initializeSystemDatabase).mockResolvedValue(undefined);
      vi.mocked(system.trees.getAllTrees).mockRejectedValue(dbError);

      // Act & Assert
      await expect(getAllTreesWithStatus()).rejects.toThrow(
        "Failed to get trees with status: Database query failed",
      );
    });

    it("should return correct TreeWithStatus properties", async () => {
      // Arrange
      const singleTree: Tree[] = [
        {
          id: "test-tree",
          name: "Test Tree",
          description: "Test description",
          file_path: "trees/test_tree.db",
          created_at: new Date("2024-01-01"),
        },
      ];

      vi.mocked(system.trees.getAllTrees).mockResolvedValue(singleTree);
      vi.mocked(exists)
        .mockResolvedValueOnce(true) // trees directory exists (for getUnregisteredFiles)
        .mockResolvedValueOnce(true) // trees directory exists (for ensureTreesDirectoryExists)
        .mockResolvedValueOnce(true); // tree file exists
      vi.mocked(readDir).mockResolvedValue([]);

      // Act
      const result = await getAllTreesWithStatus();

      // Assert
      expect(result.trees[0]).toEqual({
        id: "test-tree",
        label: "Test Tree",
        description: "Test description",
        path: "trees/test_tree.db",
        created_at: singleTree[0].created_at.toISOString(),
        status: {
          type: "healthy",
          message: "Tree is properly configured",
        },
      });
    });

    it("should assign correct status based on tree state", async () => {
      // Arrange
      vi.mocked(system.trees.getAllTrees).mockResolvedValue([
        {
          id: "healthy-tree",
          name: "Healthy Tree",
          file_path: "trees/healthy.db",
          created_at: new Date(),
        },
        {
          id: "orphaned-tree",
          name: "Orphaned Tree",
          file_path: "trees/orphaned.db",
          created_at: new Date(),
        },
      ]);

      vi.mocked(exists)
        .mockResolvedValueOnce(true) // trees directory exists (for getUnregisteredFiles)
        .mockResolvedValueOnce(true) // trees directory exists (for ensureTreesDirectoryExists)
        .mockResolvedValueOnce(true) // healthy tree file exists
        .mockResolvedValueOnce(false); // orphaned tree file doesn't exist

      vi.mocked(readDir).mockResolvedValue([
        {
          name: "unregistered.db",
          isFile: true,
          isDirectory: false,
          isSymlink: false,
        },
      ]);

      // Act
      const result = await getAllTreesWithStatus();

      // Assert
      const statuses = result.trees.map((t) => t.status.type);
      expect(statuses).toContain("healthy");
      expect(statuses).toContain("orphaned");
      expect(statuses).toContain("unregistered");

      // Verify each tree has the correct status
      const healthyTree = result.trees.find((t) => t.id === "healthy-tree");
      expect(healthyTree?.status.type).toBe("healthy");

      const orphanedTree = result.trees.find((t) => t.id === "orphaned-tree");
      expect(orphanedTree?.status.type).toBe("orphaned");

      const unregisteredTree = result.trees.find(
        (t) => t.id === "unregistered-0",
      );
      expect(unregisteredTree?.status.type).toBe("unregistered");
    });
  });
});
