import { describe, it, expect, beforeEach, vi } from "vitest";
import { trees } from "./trees";
import { mockDatabase, mockFs } from "../test/mocks";

// Mock the initializeDatabase function
vi.mock("./db/migrations", () => ({
  initializeDatabase: vi.fn().mockResolvedValue(undefined),
}));

// Import the mocked function after mocking
import { initializeDatabase } from "./db/migrations";
const mockInitializeDatabase = initializeDatabase as ReturnType<typeof vi.fn>;

describe("trees", () => {
  const mockTreeRecord = {
    name: "test-tree",
    file_path: "trees/test-tree.db",
    created_at: 1725700000,
    description: "Test tree description",
  };

  beforeEach(() => {
    const mockDatabaseInstance = {
      execute: vi.fn().mockResolvedValue(undefined),
      select: vi.fn().mockResolvedValue([]),
    };
    mockDatabase.load.mockResolvedValue(mockDatabaseInstance);
    mockInitializeDatabase.mockClear();
  });

  describe("initialize", () => {
    it("should create trees metadata table", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await trees.initialize();

      expect(mockDatabase.load).toHaveBeenCalledWith(
        "sqlite:trees-metadata.db",
      );
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        expect.stringContaining("CREATE TABLE IF NOT EXISTS trees_metadata"),
      );
    });
  });

  describe("create", () => {
    it("should create a new tree successfully", async () => {
      mockFs.exists.mockResolvedValue(false);
      mockFs.mkdir.mockResolvedValue(undefined);

      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi
          .fn()
          .mockResolvedValueOnce([]) // Check existing tree
          .mockResolvedValueOnce([
            {
              // Insert and return new tree
              name: "new-tree",
              file_path: "trees/new-tree.db",
              description: "New tree",
              file_exists: 1,
            },
          ]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await trees.create("new-tree", "New tree");

      expect(mockInitializeDatabase).toHaveBeenCalledWith("new-tree");
      expect(mockFs.exists).toHaveBeenCalledWith("trees", {
        baseDir: expect.any(Number),
      });
      expect(mockFs.mkdir).toHaveBeenCalledWith("trees", {
        baseDir: expect.any(Number),
        recursive: true,
      });
      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT name FROM trees_metadata WHERE name = ?",
        ["new-tree"],
      );
      expect(result.name).toBe("new-tree");
      expect(result.status).toBe("healthy");
    });

    it("should throw error if tree already exists", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValueOnce([{ name: "existing-tree" }]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await expect(trees.create("existing-tree")).rejects.toThrow(
        "Tree 'existing-tree' already exists",
      );
    });

    it("should create trees directory if it doesn't exist", async () => {
      mockFs.exists.mockResolvedValue(false);
      mockFs.mkdir.mockResolvedValue(undefined);

      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([mockTreeRecord]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await trees.create("new-tree");

      expect(mockFs.exists).toHaveBeenCalledWith("trees", {
        baseDir: expect.any(Number),
      });
      expect(mockFs.mkdir).toHaveBeenCalledWith("trees", {
        baseDir: expect.any(Number),
        recursive: true,
      });
    });
  });

  describe("list", () => {
    it("should return healthy trees with both db entry and file", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([mockTreeRecord]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      mockFs.exists
        .mockResolvedValueOnce(true) // trees directory exists
        .mockResolvedValueOnce(true); // specific tree file exists

      mockFs.readDir.mockResolvedValue([
        { name: "test-tree.db", isDirectory: false },
      ]);

      const result = await trees.list();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("test-tree");
      expect(result[0].status).toBe("healthy");
      expect(result[0].fileExists).toBe(true);
      expect(result[0].dbEntryExists).toBe(true);
    });

    it("should return file_missing status for trees with db entry but no file", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([mockTreeRecord]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      mockFs.exists
        .mockResolvedValueOnce(true) // trees directory exists
        .mockResolvedValueOnce(false); // specific tree file doesn't exist

      mockFs.readDir.mockResolvedValue([]);

      const result = await trees.list();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("file_missing");
      expect(result[0].fileExists).toBe(false);
      expect(result[0].dbEntryExists).toBe(true);
    });

    it("should return db_missing status for orphaned files", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([]), // No db entries
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      mockFs.exists.mockResolvedValue(true);
      mockFs.readDir.mockResolvedValue([
        { name: "orphaned-tree.db", isDirectory: false },
      ]);

      const result = await trees.list();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("orphaned-tree");
      expect(result[0].status).toBe("db_missing");
      expect(result[0].fileExists).toBe(true);
      expect(result[0].dbEntryExists).toBe(false);
    });

    it("should handle missing trees directory gracefully", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      mockFs.exists.mockResolvedValue(false);

      const result = await trees.list();

      expect(result).toEqual([]);
    });

    it("should handle errors reading trees directory", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      mockFs.exists.mockResolvedValue(true);
      mockFs.readDir.mockRejectedValue(new Error("Permission denied"));

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await trees.list();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error reading trees directory:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("delete", () => {
    it("should delete tree with both db entry and file", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi
          .fn()
          .mockResolvedValue([{ file_path: "trees/test-tree.db" }]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      mockFs.exists.mockResolvedValue(true);
      mockFs.remove.mockResolvedValue(undefined);

      await trees.delete("test-tree");

      expect(mockFs.remove).toHaveBeenCalledWith("trees/test-tree.db", {
        baseDir: expect.any(Number),
      });
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "DELETE FROM trees_metadata WHERE name = ?",
        ["test-tree"],
      );
    });

    it("should handle orphaned files without db entry", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([]), // No db entry found
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      mockFs.exists.mockResolvedValue(true);
      mockFs.remove.mockResolvedValue(undefined);

      await trees.delete("orphaned-tree");

      expect(mockFs.remove).toHaveBeenCalledWith("trees/orphaned-tree.db", {
        baseDir: expect.any(Number),
      });
      // Should not try to delete from db since no entry exists
      expect(mockDatabaseInstance.execute).toHaveBeenCalledTimes(1); // Only initialize call
    });

    it("should handle missing files gracefully", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi
          .fn()
          .mockResolvedValue([{ file_path: "trees/missing-tree.db" }]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      mockFs.exists.mockResolvedValue(false);

      await trees.delete("missing-tree");

      expect(mockFs.remove).not.toHaveBeenCalled();
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "DELETE FROM trees_metadata WHERE name = ?",
        ["missing-tree"],
      );
    });
  });

  describe("updateLastOpened", () => {
    it("should update last opened timestamp", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await trees.updateLastOpened("test-tree");

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "UPDATE trees_metadata SET last_opened = CURRENT_TIMESTAMP WHERE name = ?",
        ["test-tree"],
      );
    });
  });

  describe("rebuildDbEntry", () => {
    it("should rebuild db entry for orphaned file", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi
          .fn()
          .mockResolvedValueOnce([]) // No existing entry
          .mockResolvedValueOnce([
            {
              // Insert and return
              name: "rebuilt-tree",
              file_path: "trees/rebuilt-tree.db",
            },
          ]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      mockFs.exists.mockResolvedValue(true);

      const result = await trees.rebuildDbEntry("rebuilt-tree");

      expect(mockFs.exists).toHaveBeenCalledWith("trees/rebuilt-tree.db", {
        baseDir: expect.any(Number),
      });
      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT name FROM trees_metadata WHERE name = ?",
        ["rebuilt-tree"],
      );
      expect(result.name).toBe("rebuilt-tree");
      expect(result.status).toBe("healthy");
    });

    it("should throw error if file doesn't exist", async () => {
      mockFs.exists.mockResolvedValue(false);

      await expect(trees.rebuildDbEntry("nonexistent-tree")).rejects.toThrow(
        "File not found: trees/nonexistent-tree.db",
      );
    });

    it("should throw error if db entry already exists", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([{ name: "existing-tree" }]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      mockFs.exists.mockResolvedValue(true);

      await expect(trees.rebuildDbEntry("existing-tree")).rejects.toThrow(
        "Tree 'existing-tree' already exists in database",
      );
    });
  });
});
