import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Database from "@tauri-apps/plugin-sql";
import { connectToTreeDbById, withTreeDbById } from "./connection";
import { withSystemDb } from "../system/connection";
import {
  type MockFn,
  type MockDatabase,
  createMockDatabase,
  DB_TEST_CONSTANTS,
  suppressConsoleOutput,
} from "../../test/db-mocks";

// Mock the Tauri SQL plugin
vi.mock("@tauri-apps/plugin-sql", () => ({
  default: {
    load: vi.fn(),
  },
}));

// Mock the system database connection
vi.mock("../system/connection", () => ({
  withSystemDb: vi.fn(),
}));

/**
 * Mock system database interface for testing
 */
interface MockSystemDatabase {
  select: MockFn;
}

/**
 * Test constants specific to tree database tests
 */
const TEST_CONSTANTS = {
  TREE_ID: "1",
  INVALID_TREE_ID: "invalid",
  NON_EXISTENT_TREE_ID: "999",
  FILE_PATH: "/path/to/test-tree.db",
  TREE_DB_PATH: "sqlite:/path/to/test-tree.db",
} as const;

describe("Tree Database Connection", () => {
  let mockTreeDb: MockDatabase;
  let closeSpy: MockFn;
  let mockSystemDb: MockSystemDatabase;

  beforeEach(() => {
    mockTreeDb = createMockDatabase();
    closeSpy = mockTreeDb.close;

    mockSystemDb = {
      select: vi.fn(),
    };

    (Database.load as MockFn).mockResolvedValue(mockTreeDb);
    (withSystemDb as MockFn).mockImplementation(
      async (operation: (db: typeof mockSystemDb) => Promise<unknown>) => {
        return await operation(mockSystemDb);
      },
    );

    suppressConsoleOutput();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("connectToTreeDbById", () => {
    it("should create a tree database connection using tree ID", async () => {
      mockSystemDb.select.mockResolvedValue([
        { file_path: TEST_CONSTANTS.FILE_PATH },
      ]);

      const result = await connectToTreeDbById(TEST_CONSTANTS.TREE_ID);

      expect(withSystemDb).toHaveBeenCalled();
      expect(mockSystemDb.select).toHaveBeenCalledWith(
        "SELECT file_path FROM trees WHERE id = ?",
        [1],
      );
      expect(Database.load).toHaveBeenCalledWith(TEST_CONSTANTS.TREE_DB_PATH);
      expect(result).toBe(mockTreeDb);
    });

    it("should handle invalid tree ID", async () => {
      await expect(
        connectToTreeDbById(TEST_CONSTANTS.INVALID_TREE_ID),
      ).rejects.toThrow(`Invalid tree ID: ${TEST_CONSTANTS.INVALID_TREE_ID}`);

      expect(withSystemDb).not.toHaveBeenCalled();
      expect(Database.load).not.toHaveBeenCalled();
    });

    it("should handle tree not found in system database", async () => {
      mockSystemDb.select.mockResolvedValue([]);

      await expect(
        connectToTreeDbById(TEST_CONSTANTS.NON_EXISTENT_TREE_ID),
      ).rejects.toThrow(
        `Tree with ID ${TEST_CONSTANTS.NON_EXISTENT_TREE_ID} not found in system database`,
      );

      expect(Database.load).not.toHaveBeenCalled();
    });

    it("should handle system database query failure", async () => {
      (withSystemDb as MockFn).mockRejectedValue(new Error("System DB error"));

      await expect(connectToTreeDbById(TEST_CONSTANTS.TREE_ID)).rejects.toThrow(
        "System DB error",
      );

      expect(Database.load).not.toHaveBeenCalled();
    });

    it("should handle tree database connection failure", async () => {
      mockSystemDb.select.mockResolvedValue([
        { file_path: TEST_CONSTANTS.FILE_PATH },
      ]);
      (Database.load as MockFn).mockRejectedValue(
        new Error("Tree DB connection failed"),
      );

      await expect(connectToTreeDbById(TEST_CONSTANTS.TREE_ID)).rejects.toThrow(
        "Tree DB connection failed",
      );
    });
  });

  describe("withTreeDbById", () => {
    it("should execute operation and close connection on success", async () => {
      const operation = vi
        .fn()
        .mockResolvedValue(DB_TEST_CONSTANTS.SUCCESS_RESULT);

      mockSystemDb.select.mockResolvedValue([
        { file_path: TEST_CONSTANTS.FILE_PATH },
      ]);

      const result = await withTreeDbById(TEST_CONSTANTS.TREE_ID, operation);

      expect(withSystemDb).toHaveBeenCalled();
      expect(Database.load).toHaveBeenCalledWith(TEST_CONSTANTS.TREE_DB_PATH);
      expect(operation).toHaveBeenCalledWith(mockTreeDb);
      expect(closeSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(DB_TEST_CONSTANTS.SUCCESS_RESULT);
    });

    it("should close connection even when operation throws an error", async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new Error("Operation failed"));

      mockSystemDb.select.mockResolvedValue([
        { file_path: TEST_CONSTANTS.FILE_PATH },
      ]);

      await expect(
        withTreeDbById(TEST_CONSTANTS.TREE_ID, operation),
      ).rejects.toThrow("Operation failed");

      expect(withSystemDb).toHaveBeenCalled();
      expect(Database.load).toHaveBeenCalledWith(TEST_CONSTANTS.TREE_DB_PATH);
      expect(operation).toHaveBeenCalledWith(mockTreeDb);
      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle tree lookup failure", async () => {
      const operation = vi.fn();

      mockSystemDb.select.mockResolvedValue([]);

      await expect(
        withTreeDbById(TEST_CONSTANTS.NON_EXISTENT_TREE_ID, operation),
      ).rejects.toThrow(
        `Tree with ID ${TEST_CONSTANTS.NON_EXISTENT_TREE_ID} not found in system database`,
      );

      expect(operation).not.toHaveBeenCalled();
      expect(closeSpy).not.toHaveBeenCalled();
    });

    it("should handle connection creation failure", async () => {
      const operation = vi.fn();

      mockSystemDb.select.mockResolvedValue([
        { file_path: TEST_CONSTANTS.FILE_PATH },
      ]);
      (Database.load as MockFn).mockRejectedValue(
        new Error("Connection failed"),
      );

      await expect(
        withTreeDbById(TEST_CONSTANTS.TREE_ID, operation),
      ).rejects.toThrow("Connection failed");

      expect(operation).not.toHaveBeenCalled();
      expect(closeSpy).not.toHaveBeenCalled();
    });

    it("should handle connection close failure gracefully", async () => {
      const operation = vi
        .fn()
        .mockResolvedValue(DB_TEST_CONSTANTS.SUCCESS_RESULT);

      mockSystemDb.select.mockResolvedValue([
        { file_path: TEST_CONSTANTS.FILE_PATH },
      ]);
      closeSpy.mockRejectedValue(new Error("Close failed"));

      // Should not throw even if close fails
      const result = await withTreeDbById(TEST_CONSTANTS.TREE_ID, operation);

      expect(result).toBe(DB_TEST_CONSTANTS.SUCCESS_RESULT);
      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it("should not attempt to close if connection was never created", async () => {
      const operation = vi.fn();

      mockSystemDb.select.mockResolvedValue([]);

      await expect(
        withTreeDbById(TEST_CONSTANTS.NON_EXISTENT_TREE_ID, operation),
      ).rejects.toThrow(
        `Tree with ID ${TEST_CONSTANTS.NON_EXISTENT_TREE_ID} not found in system database`,
      );

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it("should handle multiple concurrent operations on different trees", async () => {
      const operation1 = vi.fn().mockResolvedValue("result1");
      const operation2 = vi.fn().mockResolvedValue("result2");

      mockSystemDb.select
        .mockResolvedValueOnce([{ file_path: "/path/to/tree1.db" }])
        .mockResolvedValueOnce([{ file_path: "/path/to/tree2.db" }]);

      const [result1, result2] = await Promise.all([
        withTreeDbById("1", operation1),
        withTreeDbById("2", operation2),
      ]);

      expect(result1).toBe("result1");
      expect(result2).toBe("result2");
      expect(closeSpy).toHaveBeenCalledTimes(2);
    });

    it("should handle multiple concurrent operations on same tree", async () => {
      const operation1 = vi.fn().mockResolvedValue("result1");
      const operation2 = vi.fn().mockResolvedValue("result2");

      mockSystemDb.select.mockResolvedValue([
        { file_path: TEST_CONSTANTS.FILE_PATH },
      ]);

      const [result1, result2] = await Promise.all([
        withTreeDbById(TEST_CONSTANTS.TREE_ID, operation1),
        withTreeDbById(TEST_CONSTANTS.TREE_ID, operation2),
      ]);

      expect(result1).toBe("result1");
      expect(result2).toBe("result2");
      expect(closeSpy).toHaveBeenCalledTimes(2);
    });
  });
});
