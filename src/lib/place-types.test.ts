import { describe, it, expect, beforeEach, vi } from "vitest";
import { placeTypes } from "./place-types";
import { mockDatabase, mockUuid } from "../test/mocks";
import {
  PlaceType,
  CreatePlaceTypeInput,
  UpdatePlaceTypeInput,
} from "./db/types";

describe("placeTypes", () => {
  const testTreeName = "test-tree";
  const mockPlaceType: PlaceType = {
    id: "mock-uuid-1234",
    created_at: "2025-09-07T10:00:00Z",
    name: "Country",
    key: null,
  };

  const mockSystemPlaceType: PlaceType = {
    id: "mock-uuid-system",
    created_at: "2025-09-07T10:00:00Z",
    name: "Country",
    key: "country",
  };

  beforeEach(() => {
    mockUuid.v4.mockReturnValue("mock-uuid-1234");
  });

  describe("getAll", () => {
    it("should return all place types ordered by name", async () => {
      const mockPlaceTypes = [mockPlaceType];
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue(mockPlaceTypes),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await placeTypes.getAll(testTreeName);

      expect(mockDatabase.load).toHaveBeenCalledWith(
        `sqlite:trees/${testTreeName}.db`,
      );
      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT id, created_at, name, key FROM place_types ORDER BY name",
      );
      expect(result).toEqual(mockPlaceTypes);
    });
  });

  describe("getById", () => {
    it("should return place type by id", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([mockPlaceType]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await placeTypes.getById(testTreeName, "test-id");

      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT id, created_at, name, key FROM place_types WHERE id = ?",
        ["test-id"],
      );
      expect(result).toEqual(mockPlaceType);
    });

    it("should return null if place type not found", async () => {
      const mockDatabaseInstance = { select: vi.fn().mockResolvedValue([]) };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await placeTypes.getById(testTreeName, "nonexistent-id");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a place type with generated UUID", async () => {
      const newPlaceType: CreatePlaceTypeInput = {
        name: "Region",
        key: "region",
      };
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([mockPlaceType]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await placeTypes.create(testTreeName, newPlaceType);

      expect(mockUuid.v4).toHaveBeenCalled();
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO place_types (id, name, key) VALUES (?, ?, ?)",
        ["mock-uuid-1234", "Region", "region"],
      );
      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT id, created_at, name, key FROM place_types WHERE id = ?",
        ["mock-uuid-1234"],
      );
      expect(result).toEqual(mockPlaceType);
    });

    it("should handle undefined key", async () => {
      const newPlaceType: CreatePlaceTypeInput = { name: "Region" };
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([mockPlaceType]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await placeTypes.create(testTreeName, newPlaceType);

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO place_types (id, name, key) VALUES (?, ?, ?)",
        ["mock-uuid-1234", "Region", null],
      );
    });
  });

  describe("update", () => {
    it("should update place type with provided fields", async () => {
      const updateData: UpdatePlaceTypeInput = { name: "Updated Name" };
      const getByIdSpy = vi
        .spyOn(placeTypes, "getById")
        .mockResolvedValue(mockPlaceType);
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi
          .fn()
          .mockResolvedValue([{ ...mockPlaceType, name: "Updated Name" }]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await placeTypes.update(
        testTreeName,
        "test-id",
        updateData,
      );

      expect(getByIdSpy).toHaveBeenCalledWith(testTreeName, "test-id");
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "UPDATE place_types SET name = ? WHERE id = ?",
        ["Updated Name", "test-id"],
      );
      expect(result.name).toBe("Updated Name");

      getByIdSpy.mockRestore();
    });

    it("should prevent updating system place types", async () => {
      const updateData: UpdatePlaceTypeInput = { name: "Updated Name" };
      const getByIdSpy = vi
        .spyOn(placeTypes, "getById")
        .mockResolvedValue(mockSystemPlaceType);

      await expect(
        placeTypes.update(testTreeName, "system-id", updateData),
      ).rejects.toThrow("Cannot modify system place type: Country");

      getByIdSpy.mockRestore();
    });

    it("should return existing place type if no updates provided", async () => {
      const getByIdSpy = vi
        .spyOn(placeTypes, "getById")
        .mockResolvedValue(mockPlaceType);

      const result = await placeTypes.update(testTreeName, "test-id", {});

      expect(result).toEqual(mockPlaceType);

      getByIdSpy.mockRestore();
    });

    it("should throw error if place type not found", async () => {
      const getByIdSpy = vi
        .spyOn(placeTypes, "getById")
        .mockResolvedValue(null);

      await expect(
        placeTypes.update(testTreeName, "nonexistent-id", { name: "New Name" }),
      ).rejects.toThrow("Place type with id nonexistent-id not found");

      getByIdSpy.mockRestore();
    });
  });

  describe("delete", () => {
    it("should delete place type by id", async () => {
      const mockDatabaseInstance = {
        select: vi
          .fn()
          .mockResolvedValueOnce([mockPlaceType]) // getById call
          .mockResolvedValueOnce([{ count: 0 }]), // usage count call
        execute: vi.fn().mockResolvedValue(undefined),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await placeTypes.delete(testTreeName, "test-id");

      expect(mockDatabaseInstance.select).toHaveBeenNthCalledWith(
        1,
        "SELECT id, created_at, name, key FROM place_types WHERE id = ?",
        ["test-id"],
      );
      expect(mockDatabaseInstance.select).toHaveBeenNthCalledWith(
        2,
        "SELECT COUNT(*) as count FROM places WHERE type_id = ?",
        ["test-id"],
      );
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "DELETE FROM place_types WHERE id = ?",
        ["test-id"],
      );
    });

    it("should prevent deleting system place types", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([mockSystemPlaceType]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await expect(
        placeTypes.delete(testTreeName, "system-id"),
      ).rejects.toThrow("Cannot delete system place type: Country");
    });

    it("should prevent deleting place types in use", async () => {
      const mockDatabaseInstance = {
        select: vi
          .fn()
          .mockResolvedValueOnce([mockPlaceType]) // getById call
          .mockResolvedValueOnce([{ count: 3 }]), // usage count call
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await expect(placeTypes.delete(testTreeName, "test-id")).rejects.toThrow(
        "Cannot delete place type: 3 places are using this type",
      );
    });

    it("should throw error if place type not found", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await expect(
        placeTypes.delete(testTreeName, "nonexistent-id"),
      ).rejects.toThrow("Place type with id nonexistent-id not found");
    });
  });

  describe("getUsageCount", () => {
    it("should return count of places using this place type", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([{ count: 5 }]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await placeTypes.getUsageCount(testTreeName, "type-id");

      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT COUNT(*) as count FROM places WHERE type_id = ?",
        ["type-id"],
      );
      expect(result).toBe(5);
    });

    it("should return 0 if no places use this type", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await placeTypes.getUsageCount(testTreeName, "type-id");

      expect(result).toBe(0);
    });
  });
});
