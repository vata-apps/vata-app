import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createNewTree, updateTree, deleteCompleteTree } from "./tree-manager";
import { system, trees } from "$db";
import { generateTreeFilePath, DB_CONSTANTS } from "$db/constants";
import {
  exists,
  rename,
  remove,
  copyFile,
  mkdir,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import type { Tree, CreateTreeInput, UpdateTreeInput } from "$db";

// Mock the database modules
vi.mock("$db", () => ({
  system: {
    trees: {
      createTree: vi.fn(),
      updateTree: vi.fn(),
      deleteTree: vi.fn(),
      getTreeById: vi.fn(),
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
});
