import { describe, it, expect, beforeEach, vi } from "vitest";
import { initializeDatabase } from "./migrations";
import { mockDatabase, mockUuid } from "../../test/mocks";

describe("migrations", () => {
  const testTreeName = "test-tree";

  beforeEach(() => {
    mockUuid.v4.mockImplementation(() => `uuid-${Math.random()}`);
  });

  describe("initializeDatabase", () => {
    it("should create tables and seed default place types", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([{ count: 0 }]), // No existing place types
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await initializeDatabase(testTreeName);

      expect(mockDatabase.load).toHaveBeenCalledWith(
        `sqlite:trees/${testTreeName}.db`,
      );

      // Should execute schema SQL
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        expect.stringContaining("CREATE TABLE IF NOT EXISTS place_types"),
      );

      // Should check existing place types count
      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT COUNT(*) as count FROM place_types",
      );

      // Should seed default place types (10) and event types (11)
      expect(mockDatabaseInstance.execute).toHaveBeenCalledTimes(22); // 1 schema + 10 place types + 11 event types

      // Verify place type insertions
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO place_types (id, name, key) VALUES (?, ?, ?)",
        [expect.any(String), "Country", "country"],
      );
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO place_types (id, name, key) VALUES (?, ?, ?)",
        [expect.any(String), "State", "state"],
      );
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO place_types (id, name, key) VALUES (?, ?, ?)",
        [expect.any(String), "City", "city"],
      );

      // Verify some event type insertions
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO event_types (id, name, key) VALUES (?, ?, ?)",
        [expect.any(String), "Birth", "birth"],
      );
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO event_types (id, name, key) VALUES (?, ?, ?)",
        [expect.any(String), "Death", "death"],
      );
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO event_types (id, name, key) VALUES (?, ?, ?)",
        [expect.any(String), "Marriage", "marriage"],
      );

      expect(consoleSpy).toHaveBeenCalledWith("Seeded 10 default place types");
      expect(consoleSpy).toHaveBeenCalledWith("Seeded 11 default event types");
      expect(consoleSpy).toHaveBeenCalledWith(
        `Database initialized for tree: ${testTreeName}`,
      );

      consoleSpy.mockRestore();
    });

    it("should not seed place types if they already exist", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([{ count: 5 }]), // Existing place types
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await initializeDatabase(testTreeName);

      // Should only execute schema SQL (no insertions)
      expect(mockDatabaseInstance.execute).toHaveBeenCalledTimes(1);
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        expect.stringContaining("CREATE TABLE IF NOT EXISTS place_types"),
      );

      // Should not log seeding message
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("Seeded"),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `Database initialized for tree: ${testTreeName}`,
      );

      consoleSpy.mockRestore();
    });

    it("should handle empty count result", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([]), // Empty result
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await initializeDatabase(testTreeName);

      // Should treat empty result as 0 count and seed place types and event types
      expect(mockDatabaseInstance.execute).toHaveBeenCalledTimes(22); // 1 schema + 10 place types + 11 event types

      consoleSpy.mockRestore();
    });

    it("should generate unique UUIDs for each place type", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([{ count: 0 }]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      let callCount = 0;
      mockUuid.v4.mockImplementation(() => `uuid-${++callCount}`);

      await initializeDatabase(testTreeName);

      // Verify that unique UUIDs were used
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO place_types (id, name, key) VALUES (?, ?, ?)",
        ["uuid-1", "Country", "country"],
      );
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO place_types (id, name, key) VALUES (?, ?, ?)",
        ["uuid-2", "State", "state"],
      );
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO place_types (id, name, key) VALUES (?, ?, ?)",
        ["uuid-10", "Address", "address"],
      );
    });

    it("should throw and log error on database failure", async () => {
      const error = new Error("Database connection failed");
      mockDatabase.load.mockRejectedValue(error);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(initializeDatabase(testTreeName)).rejects.toThrow(
        "Database connection failed",
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to initialize database:",
        error,
      );

      consoleSpy.mockRestore();
    });

    it("should throw error if schema creation fails", async () => {
      const error = new Error("Schema creation failed");
      const mockDatabaseInstance = {
        execute: vi.fn().mockRejectedValue(error),
        select: vi.fn(),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(initializeDatabase(testTreeName)).rejects.toThrow(
        "Schema creation failed",
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to initialize database:",
        error,
      );

      consoleSpy.mockRestore();
    });

    it("should throw error if place type insertion fails", async () => {
      const error = new Error("Insert failed");
      const mockDatabaseInstance = {
        execute: vi
          .fn()
          .mockResolvedValueOnce(undefined) // Schema creation succeeds
          .mockRejectedValue(error), // First insert fails
        select: vi.fn().mockResolvedValue([{ count: 0 }]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(initializeDatabase(testTreeName)).rejects.toThrow(
        "Insert failed",
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to initialize database:",
        error,
      );

      consoleSpy.mockRestore();
    });

    it("should use correct database path format", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([{ count: 1 }]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await initializeDatabase("my-family-tree");

      expect(mockDatabase.load).toHaveBeenCalledWith(
        "sqlite:trees/my-family-tree.db",
      );
    });
  });
});
