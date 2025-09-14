import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Database from "@tauri-apps/plugin-sql";
import { createTree } from "./system/tables/trees";
import { createIndividual } from "./trees/tables/individuals";
import { createName } from "./trees/tables/names";
import {
  type MockFn,
  type MockDatabase,
  createMockDatabase,
  createStandardDatabaseLoader,
  createTestTreeData,
  createTestIndividualData,
  createTestNameData,
  suppressConsoleOutput,
} from "../test/db-mocks";

// Mock the Tauri SQL plugin
vi.mock("@tauri-apps/plugin-sql", () => ({
  default: {
    load: vi.fn(),
  },
}));

describe("Database Integration Tests", () => {
  let mockSystemDatabase: MockDatabase;
  let mockTreeDatabase: MockDatabase;
  let systemCloseSpy: MockFn;
  let treeCloseSpy: MockFn;

  beforeEach(() => {
    // Create mock databases
    mockSystemDatabase = createMockDatabase();
    mockTreeDatabase = createMockDatabase();
    systemCloseSpy = mockSystemDatabase.close;
    treeCloseSpy = mockTreeDatabase.close;

    // Set up database loader
    const databaseLoader = createStandardDatabaseLoader(
      mockSystemDatabase,
      mockTreeDatabase,
    );
    (Database.load as MockFn).mockImplementation(databaseLoader);

    suppressConsoleOutput();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("System Database Operations", () => {
    it("should close connection after successful tree creation", async () => {
      const treeData = createTestTreeData();

      await createTree(treeData);

      expect(systemCloseSpy).toHaveBeenCalledTimes(1);
    });

    it("should close connection after failed tree creation", async () => {
      const treeData = createTestTreeData();

      // Mock a failure in the operation
      mockSystemDatabase.execute.mockRejectedValue(new Error("Database error"));

      await expect(createTree(treeData)).rejects.toThrow("Database error");

      expect(systemCloseSpy).toHaveBeenCalledTimes(1);
    });

    it("should close connection after multiple system operations", async () => {
      const treeData1 = { name: "Tree 1", description: "First tree" };
      const treeData2 = { name: "Tree 2", description: "Second tree" };

      await Promise.all([createTree(treeData1), createTree(treeData2)]);

      expect(systemCloseSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("Tree Database Operations", () => {
    beforeEach(() => {
      // Mock system database to return tree path for tree operations
      mockSystemDatabase.select.mockResolvedValue([
        { file_path: "/path/to/test-tree.db" },
      ]);
    });

    it("should close connection after successful individual creation", async () => {
      const individualData = createTestIndividualData();

      await createIndividual("1", individualData);

      expect(treeCloseSpy).toHaveBeenCalledTimes(1);
    });

    it("should close connection after successful name creation", async () => {
      const nameData = createTestNameData("1");

      await createName("1", nameData);

      expect(treeCloseSpy).toHaveBeenCalledTimes(1);
    });

    it("should close connection after failed tree operation", async () => {
      const individualData = createTestIndividualData();

      // Mock a failure in the operation
      mockTreeDatabase.execute.mockRejectedValue(
        new Error("Tree database error"),
      );

      await expect(createIndividual("1", individualData)).rejects.toThrow(
        "Tree database error",
      );

      expect(treeCloseSpy).toHaveBeenCalledTimes(1);
    });

    it("should close connection after multiple tree operations", async () => {
      const individualData = createTestIndividualData();
      const nameData = createTestNameData("1");

      await Promise.all([
        createIndividual("1", individualData),
        createName("1", nameData),
      ]);

      expect(treeCloseSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("Mixed Operations", () => {
    it("should close all connections after mixed system and tree operations", async () => {
      // Mock system database select to handle both tree existence check and tree path lookup
      mockSystemDatabase.select
        .mockResolvedValueOnce([]) // First call: tree existence check (empty = doesn't exist)
        .mockResolvedValueOnce([{ file_path: "/path/to/test-tree.db" }]); // Second call: tree path lookup

      const treeData = createTestTreeData({ name: "Mixed Test Tree" });
      const individualData = createTestIndividualData({ gender: "female" });

      await Promise.all([
        createTree(treeData),
        createIndividual("1", individualData),
      ]);

      expect(systemCloseSpy).toHaveBeenCalledTimes(2); // createTree + createIndividual both use system DB
      expect(treeCloseSpy).toHaveBeenCalledTimes(1);
    });

    it("should close all connections even when some operations fail", async () => {
      // Mock system database select to handle both tree existence check and tree path lookup
      mockSystemDatabase.select
        .mockResolvedValueOnce([]) // First call: tree existence check (empty = doesn't exist)
        .mockResolvedValueOnce([{ file_path: "/path/to/test-tree.db" }]); // Second call: tree path lookup

      const treeData = createTestTreeData({ name: "Mixed Test Tree Fail" });
      const individualData = createTestIndividualData({ gender: "female" });

      // Mock tree operation to fail
      mockTreeDatabase.execute.mockRejectedValue(
        new Error("Tree operation failed"),
      );

      await Promise.allSettled([
        createTree(treeData),
        createIndividual("1", individualData),
      ]);

      expect(systemCloseSpy).toHaveBeenCalledTimes(2); // createTree + createIndividual both use system DB
      expect(treeCloseSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Connection Leak Prevention", () => {
    it("should handle rapid successive operations without connection leaks", async () => {
      const operations = Array.from({ length: 10 }, (_, i) =>
        createTree({ name: `Tree ${i}`, description: `Tree ${i} description` }),
      );

      await Promise.all(operations);

      expect(systemCloseSpy).toHaveBeenCalledTimes(10);
    });

    it("should handle connection close failures gracefully", async () => {
      const treeData = createTestTreeData({ name: "Close Failure Tree" });

      // Mock close to fail
      systemCloseSpy.mockRejectedValue(new Error("Close failed"));

      // Operation should still succeed even if close fails
      await expect(createTree(treeData)).resolves.toBeDefined();

      expect(systemCloseSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle mixed success and failure scenarios", async () => {
      const operations = Array.from({ length: 50 }, (_, i) =>
        createTree({
          name: `Tree ${i}`,
          description: `Tree ${i} description`,
        }),
      );

      // Mock every other operation to fail
      let callCount = 0;
      mockSystemDatabase.execute.mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          return Promise.reject(new Error("Simulated failure"));
        }
        return Promise.resolve({ lastInsertId: callCount });
      });

      const results = await Promise.allSettled(operations);

      expect(results).toHaveLength(50);
      expect(systemCloseSpy).toHaveBeenCalledTimes(50);

      // Verify that we have both successes and failures
      const succeeded = results.filter((r) => r.status === "fulfilled");
      const failed = results.filter((r) => r.status === "rejected");
      expect(succeeded.length).toBeGreaterThan(0);
      expect(failed.length).toBeGreaterThan(0);
      expect(succeeded.length + failed.length).toBe(50);
    });
  });
});
