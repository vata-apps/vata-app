import { describe, it, expect, vi } from "vitest";
import { withTreeDb, withMetadataDb } from "./connection";
import { mockDatabase } from "../../test/mocks";

describe("database connection", () => {
  describe("withTreeDb", () => {
    it("should execute operation with tree database", async () => {
      const mockOperation = vi.fn().mockResolvedValue("result");
      const mockDatabaseInstance = { mockInstance: true };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await withTreeDb("test-tree", mockOperation);

      expect(mockDatabase.load).toHaveBeenCalledWith(
        "sqlite:trees/test-tree.db",
      );
      expect(mockOperation).toHaveBeenCalledWith(mockDatabaseInstance);
      expect(result).toBe("result");
    });

    it("should propagate operation errors", async () => {
      const error = new Error("Operation failed");
      const mockOperation = vi.fn().mockRejectedValue(error);
      const mockDatabaseInstance = { mockInstance: true };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await expect(withTreeDb("test-tree", mockOperation)).rejects.toThrow(
        "Operation failed",
      );
    });

    it("should propagate database connection errors", async () => {
      const error = new Error("Database connection failed");
      const mockOperation = vi.fn();
      mockDatabase.load.mockRejectedValue(error);

      await expect(withTreeDb("test-tree", mockOperation)).rejects.toThrow(
        "Database connection failed",
      );
      expect(mockOperation).not.toHaveBeenCalled();
    });
  });

  describe("withMetadataDb", () => {
    it("should execute operation with metadata database", async () => {
      const mockOperation = vi.fn().mockResolvedValue("metadata-result");
      const mockDatabaseInstance = { mockInstance: true };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await withMetadataDb(mockOperation);

      expect(mockDatabase.load).toHaveBeenCalledWith(
        "sqlite:trees-metadata.db",
      );
      expect(mockOperation).toHaveBeenCalledWith(mockDatabaseInstance);
      expect(result).toBe("metadata-result");
    });

    it("should propagate metadata database errors", async () => {
      const error = new Error("Metadata DB failed");
      const mockOperation = vi.fn();
      mockDatabase.load.mockRejectedValue(error);

      await expect(withMetadataDb(mockOperation)).rejects.toThrow(
        "Metadata DB failed",
      );
    });
  });
});
