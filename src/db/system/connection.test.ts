import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Database from "@tauri-apps/plugin-sql";
import { connectToSystemDb, withSystemDb } from "./connection";
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

describe("System Database Connection", () => {
  let mockSystemDb: MockDatabase;
  let closeSpy: MockFn;

  beforeEach(() => {
    mockSystemDb = createMockDatabase();
    closeSpy = mockSystemDb.close;

    (Database.load as MockFn).mockResolvedValue(mockSystemDb);
    suppressConsoleOutput();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("connectToSystemDb", () => {
    it("should create a database connection", async () => {
      const result = await connectToSystemDb();

      expect(Database.load).toHaveBeenCalledWith(
        DB_TEST_CONSTANTS.SYSTEM_DB_PATH,
      );
      expect(result).toBe(mockSystemDb);
    });

    it("should handle connection errors", async () => {
      const error = new Error(DB_TEST_CONSTANTS.ERROR_MESSAGE);
      (Database.load as MockFn).mockRejectedValue(error);

      await expect(connectToSystemDb()).rejects.toThrow(
        DB_TEST_CONSTANTS.ERROR_MESSAGE,
      );
    });
  });

  describe("withSystemDb", () => {
    it("should execute operation and close connection on success", async () => {
      const operation = vi
        .fn()
        .mockResolvedValue(DB_TEST_CONSTANTS.SUCCESS_RESULT);

      const result = await withSystemDb(operation);

      expect(Database.load).toHaveBeenCalledWith(
        DB_TEST_CONSTANTS.SYSTEM_DB_PATH,
      );
      expect(operation).toHaveBeenCalledWith(mockSystemDb);
      expect(closeSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(DB_TEST_CONSTANTS.SUCCESS_RESULT);
    });

    it("should close connection even when operation throws an error", async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new Error(DB_TEST_CONSTANTS.ERROR_MESSAGE));

      await expect(withSystemDb(operation)).rejects.toThrow(
        DB_TEST_CONSTANTS.ERROR_MESSAGE,
      );

      expect(Database.load).toHaveBeenCalledWith(
        DB_TEST_CONSTANTS.SYSTEM_DB_PATH,
      );
      expect(operation).toHaveBeenCalledWith(mockSystemDb);
      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle connection creation failure", async () => {
      const connectionError = new Error(DB_TEST_CONSTANTS.ERROR_MESSAGE);
      (Database.load as MockFn).mockRejectedValue(connectionError);
      const operation = vi.fn();

      await expect(withSystemDb(operation)).rejects.toThrow(
        DB_TEST_CONSTANTS.ERROR_MESSAGE,
      );

      expect(operation).not.toHaveBeenCalled();
      expect(closeSpy).not.toHaveBeenCalled();
    });

    it("should handle connection close failure gracefully", async () => {
      const closeError = new Error("Close failed");
      closeSpy.mockRejectedValue(closeError);
      const operation = vi
        .fn()
        .mockResolvedValue(DB_TEST_CONSTANTS.SUCCESS_RESULT);

      // Should not throw even if close fails
      const result = await withSystemDb(operation);

      expect(result).toBe(DB_TEST_CONSTANTS.SUCCESS_RESULT);
      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it("should not attempt to close if connection was never created", async () => {
      (Database.load as MockFn).mockRejectedValue(
        new Error(DB_TEST_CONSTANTS.ERROR_MESSAGE),
      );
      const operation = vi.fn();

      await expect(withSystemDb(operation)).rejects.toThrow(
        DB_TEST_CONSTANTS.ERROR_MESSAGE,
      );

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it("should handle multiple concurrent operations", async () => {
      const operation1 = vi.fn().mockResolvedValue("result1");
      const operation2 = vi.fn().mockResolvedValue("result2");

      const [result1, result2] = await Promise.all([
        withSystemDb(operation1),
        withSystemDb(operation2),
      ]);

      expect(result1).toBe("result1");
      expect(result2).toBe("result2");
      expect(closeSpy).toHaveBeenCalledTimes(2);
    });

    it("should close connection when operation throws synchronous error", async () => {
      const operation = vi.fn().mockImplementation(() => {
        throw new Error("Synchronous error");
      });

      await expect(withSystemDb(operation)).rejects.toThrow(
        "Synchronous error",
      );

      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it("should close connection when operation throws non-Error object", async () => {
      const operation = vi.fn().mockImplementation(() => {
        throw "String error";
      });

      await expect(withSystemDb(operation)).rejects.toBe("String error");

      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle rapid successive operations without connection leaks", async () => {
      const operations = Array.from({ length: 100 }, (_, i) =>
        withSystemDb(async () => `operation-${i}`),
      );

      const results = await Promise.all(operations);

      expect(results).toHaveLength(100);
      expect(closeSpy).toHaveBeenCalledTimes(100);
    });

    it("should handle mixed success and failure scenarios", async () => {
      const operations = [
        withSystemDb(async () => "success1"),
        withSystemDb(async () => {
          throw new Error("error1");
        }),
        withSystemDb(async () => "success2"),
        withSystemDb(async () => {
          throw new Error("error2");
        }),
      ];

      const results = await Promise.allSettled(operations);

      expect(results).toHaveLength(4);
      expect(closeSpy).toHaveBeenCalledTimes(4);
    });
  });
});
