import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockUuid } from "../test/mocks";
import { GenderType, NameType } from "./db/types";

// Mock withTreeDb locally for this test file only
vi.mock("./db/connection", () => ({
  withTreeDb: vi.fn(),
  withMetadataDb: vi.fn(),
}));

import { individuals } from "./individuals";

const mockWithTreeDb = vi.mocked((await import("./db/connection")).withTreeDb);

describe("individuals", () => {
  const testTreeName = "test-tree";

  // Helper to create a complete database mock
  interface MockDatabase {
    select: ReturnType<typeof vi.fn>;
    execute: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    path: string;
  }

  const createMockDatabase = (
    overrides: Partial<MockDatabase> = {},
  ): MockDatabase => ({
    select: vi.fn(),
    execute: vi.fn(),
    close: vi.fn(),
    path: "mock-path",
    ...overrides,
  });

  beforeEach(() => {
    mockUuid.v4.mockImplementation(() => `uuid-${Math.random()}`);
  });

  describe("getAll", () => {
    it("should return all individuals sorted by creation date desc", async () => {
      const mockIndividuals = [
        {
          id: "individual-1",
          created_at: "2023-01-01T00:00:00Z",
          gender: "male" as GenderType,
          gedcom_id: null,
        },
        {
          id: "individual-2",
          created_at: "2023-01-02T00:00:00Z",
          gender: "female" as GenderType,
          gedcom_id: 123,
        },
      ];

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback(
          createMockDatabase({
            select: vi.fn().mockResolvedValue(mockIndividuals),
          }),
        ),
      );

      const result = await individuals.getAll(testTreeName);

      expect(mockWithTreeDb).toHaveBeenCalledWith(
        testTreeName,
        expect.any(Function),
      );
      expect(result).toEqual(mockIndividuals);
    });

    it("should return empty array when no individuals exist", async () => {
      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          select: vi.fn().mockResolvedValue([]),
        }),
      );

      const result = await individuals.getAll(testTreeName);

      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should return individual when found", async () => {
      const mockIndividual = {
        id: "individual-1",
        created_at: "2023-01-01T00:00:00Z",
        gender: "male" as GenderType,
        gedcom_id: null,
      };

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          select: vi.fn().mockResolvedValue([mockIndividual]),
        }),
      );

      const result = await individuals.getById(testTreeName, "individual-1");

      expect(result).toEqual(mockIndividual);
    });

    it("should return null when individual not found", async () => {
      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          select: vi.fn().mockResolvedValue([]),
        }),
      );

      const result = await individuals.getById(testTreeName, "nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create individual with all fields", async () => {
      const newIndividual = {
        gender: "female" as GenderType,
      };

      const createdIndividual = {
        id: "uuid-123",
        created_at: "2023-01-01T00:00:00Z",
        gender: "female" as GenderType,
        gedcom_id: null,
      };

      mockUuid.v4.mockReturnValue("uuid-123");
      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: vi.fn().mockResolvedValue(undefined),
          select: vi.fn().mockResolvedValue([createdIndividual]),
        }),
      );

      const result = await individuals.create(testTreeName, newIndividual);

      expect(result).toEqual(createdIndividual);
    });

    it("should create individual with default null gedcom_id", async () => {
      const newIndividual = {
        gender: "unknown" as GenderType,
      };

      const createdIndividual = {
        id: "uuid-123",
        created_at: "2023-01-01T00:00:00Z",
        gender: "unknown" as GenderType,
        gedcom_id: null,
      };

      mockUuid.v4.mockReturnValue("uuid-123");
      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: vi.fn().mockResolvedValue(undefined),
          select: vi.fn().mockResolvedValue([createdIndividual]),
        }),
      );

      const result = await individuals.create(testTreeName, newIndividual);

      expect(result).toEqual(createdIndividual);
    });

    it("should use correct SQL and parameters", async () => {
      const mockExecute = vi.fn().mockResolvedValue(undefined);
      const mockSelect = vi.fn().mockResolvedValue([
        {
          id: "uuid-123",
          created_at: "2023-01-01T00:00:00Z",
          gender: "male",
          gedcom_id: 789,
        },
      ]);

      mockUuid.v4.mockReturnValue("uuid-123");
      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: mockExecute,
          select: mockSelect,
        }),
      );

      await individuals.create(testTreeName, {
        gender: "male",
      });

      expect(mockExecute).toHaveBeenCalledWith(
        "INSERT INTO individuals (id, gender, gedcom_id) VALUES (?, ?, ?)",
        ["uuid-123", "male", null],
      );

      expect(mockSelect).toHaveBeenCalledWith(
        "SELECT id, created_at, gender, gedcom_id FROM individuals WHERE id = ?",
        ["uuid-123"],
      );
    });
  });

  describe("update", () => {
    it("should update individual with provided fields", async () => {
      const updates = {
        gender: "female" as GenderType,
      };

      const updatedIndividual = {
        id: "individual-1",
        created_at: "2023-01-01T00:00:00Z",
        gender: "female" as GenderType,
        gedcom_id: null,
      };

      const mockExecute = vi.fn().mockResolvedValue(undefined);
      const mockSelect = vi.fn().mockResolvedValue([updatedIndividual]);

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: mockExecute,
          select: mockSelect,
        }),
      );

      const result = await individuals.update(
        testTreeName,
        "individual-1",
        updates,
      );

      expect(mockExecute).toHaveBeenCalledWith(
        "UPDATE individuals SET gender = ? WHERE id = ?",
        ["female", "individual-1"],
      );

      expect(result).toEqual(updatedIndividual);
    });

    it("should handle partial updates", async () => {
      const updates = {
        gender: "male" as GenderType,
      };

      const mockExecute = vi.fn().mockResolvedValue(undefined);
      const mockSelect = vi.fn().mockResolvedValue([
        {
          id: "individual-1",
          created_at: "2023-01-01T00:00:00Z",
          gender: "male",
          gedcom_id: null,
        },
      ]);

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: mockExecute,
          select: mockSelect,
        }),
      );

      await individuals.update(testTreeName, "individual-1", updates);

      expect(mockExecute).toHaveBeenCalledWith(
        "UPDATE individuals SET gender = ? WHERE id = ?",
        ["male", "individual-1"],
      );
    });

    it("should return existing individual when no updates provided", async () => {
      const existingIndividual = {
        id: "individual-1",
        created_at: "2023-01-01T00:00:00Z",
        gender: "unknown" as GenderType,
        gedcom_id: null,
      };

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          select: vi.fn().mockResolvedValue([existingIndividual]),
        }),
      );

      const result = await individuals.update(testTreeName, "individual-1", {});

      expect(result).toEqual(existingIndividual);
    });

    it("should throw error when individual not found", async () => {
      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: vi.fn().mockResolvedValue(undefined),
          select: vi.fn().mockResolvedValue([]),
        }),
      );

      await expect(
        individuals.update(testTreeName, "nonexistent", { gender: "male" }),
      ).rejects.toThrow("Individual with id nonexistent not found");
    });
  });

  describe("delete", () => {
    it("should delete individual by id", async () => {
      const mockExecute = vi.fn().mockResolvedValue(undefined);

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: mockExecute,
        }),
      );

      await individuals.delete(testTreeName, "individual-1");

      expect(mockExecute).toHaveBeenCalledWith(
        "DELETE FROM individuals WHERE id = ?",
        ["individual-1"],
      );
    });
  });

  describe("createName", () => {
    it("should create name with all fields", async () => {
      const newName = {
        individualId: "individual-1",
        type: "birth" as NameType,
        firstName: "John",
        lastName: "Doe",
        isPrimary: true,
      };

      const createdName = {
        id: "uuid-name",
        created_at: "2023-01-01T00:00:00Z",
        individual_id: "individual-1",
        type: "birth" as NameType,
        first_name: "John",
        last_name: "Doe",
        is_primary: true,
      };

      mockUuid.v4.mockReturnValue("uuid-name");
      const mockExecute = vi.fn().mockResolvedValue(undefined);
      const mockSelect = vi.fn().mockResolvedValue([createdName]);

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: mockExecute,
          select: mockSelect,
        }),
      );

      const result = await individuals.createName(testTreeName, newName);

      // Should unset other primary names first
      expect(mockExecute).toHaveBeenCalledWith(
        "UPDATE names SET is_primary = 0 WHERE individual_id = ?",
        ["individual-1"],
      );

      // Should insert new name
      expect(mockExecute).toHaveBeenCalledWith(
        "INSERT INTO names (id, individual_id, type, first_name, last_name, is_primary) VALUES (?, ?, ?, ?, ?, ?)",
        ["uuid-name", "individual-1", "birth", "John", "Doe", 1],
      );

      expect(result).toEqual(createdName);
    });

    it("should not unset other primary names when isPrimary is false", async () => {
      const newName = {
        individualId: "individual-1",
        type: "nickname" as NameType,
        firstName: "Johnny",
        isPrimary: false,
      };

      mockUuid.v4.mockReturnValue("uuid-name");
      const mockExecute = vi.fn().mockResolvedValue(undefined);
      const mockSelect = vi.fn().mockResolvedValue([
        {
          id: "uuid-name",
          created_at: "2023-01-01T00:00:00Z",
          individual_id: "individual-1",
          type: "nickname",
          first_name: "Johnny",
          last_name: null,
          is_primary: false,
        },
      ]);

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: mockExecute,
          select: mockSelect,
        }),
      );

      await individuals.createName(testTreeName, newName);

      // Should not try to unset other primary names
      expect(mockExecute).not.toHaveBeenCalledWith(
        "UPDATE names SET is_primary = 0 WHERE individual_id = ?",
        expect.any(Array),
      );

      // Should insert with is_primary = 0
      expect(mockExecute).toHaveBeenCalledWith(
        "INSERT INTO names (id, individual_id, type, first_name, last_name, is_primary) VALUES (?, ?, ?, ?, ?, ?)",
        ["uuid-name", "individual-1", "nickname", "Johnny", null, 0],
      );
    });
  });

  describe("updateName", () => {
    it("should update name and handle primary name logic", async () => {
      const updates = {
        firstName: "Jane",
        lastName: "Smith",
        isPrimary: true,
      };

      const currentName = {
        individual_id: "individual-1",
      };

      const updatedName = {
        id: "name-1",
        created_at: "2023-01-01T00:00:00Z",
        individual_id: "individual-1",
        type: "birth" as NameType,
        first_name: "Jane",
        last_name: "Smith",
        is_primary: true,
      };

      const mockExecute = vi.fn().mockResolvedValue(undefined);
      const mockSelect = vi
        .fn()
        .mockResolvedValueOnce([currentName]) // First call to get current name
        .mockResolvedValueOnce([updatedName]); // Second call to get updated name

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: mockExecute,
          select: mockSelect,
        }),
      );

      const result = await individuals.updateName(
        testTreeName,
        "name-1",
        updates,
      );

      // Should unset other primary names
      expect(mockExecute).toHaveBeenCalledWith(
        "UPDATE names SET is_primary = 0 WHERE individual_id = ? AND id != ?",
        ["individual-1", "name-1"],
      );

      // Should update the name
      expect(mockExecute).toHaveBeenCalledWith(
        "UPDATE names SET first_name = ?, last_name = ?, is_primary = ? WHERE id = ?",
        ["Jane", "Smith", 1, "name-1"],
      );

      expect(result).toEqual(updatedName);
    });

    it("should return existing name when no updates provided", async () => {
      const existingName = {
        id: "name-1",
        created_at: "2023-01-01T00:00:00Z",
        individual_id: "individual-1",
        type: "birth" as NameType,
        first_name: "John",
        last_name: "Doe",
        is_primary: true,
      };

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          select: vi.fn().mockResolvedValue([existingName]),
        }),
      );

      const result = await individuals.updateName(testTreeName, "name-1", {});

      expect(result).toEqual(existingName);
    });

    it("should throw error when name not found", async () => {
      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: vi.fn().mockResolvedValue(undefined),
          select: vi.fn().mockResolvedValue([]),
        }),
      );

      await expect(
        individuals.updateName(testTreeName, "nonexistent", {
          firstName: "Test",
        }),
      ).rejects.toThrow("Name with id nonexistent not found");
    });
  });

  describe("deleteName", () => {
    it("should delete name by id", async () => {
      const mockExecute = vi.fn().mockResolvedValue(undefined);

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: mockExecute,
        }),
      );

      await individuals.deleteName(testTreeName, "name-1");

      expect(mockExecute).toHaveBeenCalledWith(
        "DELETE FROM names WHERE id = ?",
        ["name-1"],
      );
    });
  });

  describe("getAllWithNames", () => {
    it("should return individuals with their primary names", async () => {
      const mockIndividuals = [
        {
          id: "individual-1",
          created_at: "2023-01-01T00:00:00Z",
          gender: "male" as GenderType,
          gedcom_id: null,
        },
        {
          id: "individual-2",
          created_at: "2023-01-02T00:00:00Z",
          gender: "female" as GenderType,
          gedcom_id: 123,
        },
      ];

      const mockPrimaryName = {
        id: "name-1",
        created_at: "2023-01-01T00:00:00Z",
        individual_id: "individual-1",
        type: "birth" as NameType,
        first_name: "John",
        last_name: "Doe",
        is_primary: true,
      };

      // Mock individuals.getAll
      const originalGetAll = individuals.getAll;
      individuals.getAll = vi.fn().mockResolvedValue(mockIndividuals);

      // Mock individuals.getPrimaryName
      const originalGetPrimaryName = individuals.getPrimaryName;
      individuals.getPrimaryName = vi
        .fn()
        .mockResolvedValueOnce(mockPrimaryName) // individual-1 has primary name
        .mockResolvedValueOnce(null); // individual-2 has no primary name

      const result = await individuals.getAllWithNames(testTreeName);

      expect(result).toEqual([
        { ...mockIndividuals[0], primaryName: mockPrimaryName },
        { ...mockIndividuals[1], primaryName: null },
      ]);

      // Restore original methods
      individuals.getAll = originalGetAll;
      individuals.getPrimaryName = originalGetPrimaryName;
    });
  });

  describe("getByIdWithNames", () => {
    it("should return individual with all names", async () => {
      const mockIndividual = {
        id: "individual-1",
        created_at: "2023-01-01T00:00:00Z",
        gender: "male" as GenderType,
        gedcom_id: null,
      };

      const mockNames = [
        {
          id: "name-1",
          created_at: "2023-01-01T00:00:00Z",
          individual_id: "individual-1",
          type: "birth" as NameType,
          first_name: "John",
          last_name: "Doe",
          is_primary: true,
        },
        {
          id: "name-2",
          created_at: "2023-01-02T00:00:00Z",
          individual_id: "individual-1",
          type: "nickname" as NameType,
          first_name: "Johnny",
          last_name: null,
          is_primary: false,
        },
      ];

      // Mock individuals.getById and individuals.getNames
      const originalGetById = individuals.getById;
      const originalGetNames = individuals.getNames;

      individuals.getById = vi.fn().mockResolvedValue(mockIndividual);
      individuals.getNames = vi.fn().mockResolvedValue(mockNames);

      const result = await individuals.getByIdWithNames(
        testTreeName,
        "individual-1",
      );

      expect(result).toEqual({
        ...mockIndividual,
        names: mockNames,
      });

      // Restore original methods
      individuals.getById = originalGetById;
      individuals.getNames = originalGetNames;
    });

    it("should return null when individual not found", async () => {
      const originalGetById = individuals.getById;
      individuals.getById = vi.fn().mockResolvedValue(null);

      const result = await individuals.getByIdWithNames(
        testTreeName,
        "nonexistent",
      );

      expect(result).toBeNull();

      individuals.getById = originalGetById;
    });
  });

  describe("edge cases", () => {
    it("should handle null values correctly in name fields", async () => {
      const nameWithNulls = {
        individualId: "individual-1",
        type: "birth" as NameType,
        firstName: null,
        lastName: null,
        isPrimary: false,
      };

      const createdName = {
        id: "uuid-name",
        created_at: "2023-01-01T00:00:00Z",
        individual_id: "individual-1",
        type: "birth" as NameType,
        first_name: null,
        last_name: null,
        is_primary: false,
      };

      mockUuid.v4.mockReturnValue("uuid-name");
      const mockExecute = vi.fn().mockResolvedValue(undefined);
      const mockSelect = vi.fn().mockResolvedValue([createdName]);

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: mockExecute,
          select: mockSelect,
        }),
      );

      const result = await individuals.createName(testTreeName, nameWithNulls);

      expect(mockExecute).toHaveBeenCalledWith(
        "INSERT INTO names (id, individual_id, type, first_name, last_name, is_primary) VALUES (?, ?, ?, ?, ?, ?)",
        ["uuid-name", "individual-1", "birth", null, null, 0],
      );

      expect(result).toEqual(createdName);
    });

    it("should handle empty string name fields by converting to null", async () => {
      const nameWithEmptyStrings = {
        individualId: "individual-1",
        type: "birth" as NameType,
        firstName: "",
        lastName: "",
        isPrimary: false,
      };

      mockUuid.v4.mockReturnValue("uuid-name");
      const mockExecute = vi.fn().mockResolvedValue(undefined);
      const mockSelect = vi.fn().mockResolvedValue([
        {
          id: "uuid-name",
          created_at: "2023-01-01T00:00:00Z",
          individual_id: "individual-1",
          type: "birth",
          first_name: null,
          last_name: null,
          is_primary: false,
        },
      ]);

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: mockExecute,
          select: mockSelect,
        }),
      );

      await individuals.createName(testTreeName, nameWithEmptyStrings);

      // Empty strings should be converted to null in our business logic
      expect(mockExecute).toHaveBeenCalledWith(
        "INSERT INTO names (id, individual_id, type, first_name, last_name, is_primary) VALUES (?, ?, ?, ?, ?, ?)",
        ["uuid-name", "individual-1", "birth", null, null, 0],
      );
    });
  });

  describe("primary name business logic", () => {
    it("should ensure only one primary name per individual", async () => {
      // This tests our business logic for maintaining only one primary name
      const nameUpdate = {
        isPrimary: true,
      };

      const currentName = { individual_id: "individual-1" };
      const updatedName = {
        id: "name-2",
        created_at: "2023-01-01T00:00:00Z",
        individual_id: "individual-1",
        type: "marriage" as NameType,
        first_name: "Jane",
        last_name: "Smith",
        is_primary: true,
      };

      const mockExecute = vi.fn().mockResolvedValue(undefined);
      const mockSelect = vi
        .fn()
        .mockResolvedValueOnce([currentName])
        .mockResolvedValueOnce([updatedName]);

      mockWithTreeDb.mockImplementation((_treeName, callback) =>
        callback({
          execute: mockExecute,
          select: mockSelect,
        }),
      );

      await individuals.updateName(testTreeName, "name-2", nameUpdate);

      // Should clear other primary names first
      expect(mockExecute).toHaveBeenCalledWith(
        "UPDATE names SET is_primary = 0 WHERE individual_id = ? AND id != ?",
        ["individual-1", "name-2"],
      );

      // Then update the target name
      expect(mockExecute).toHaveBeenCalledWith(
        "UPDATE names SET is_primary = ? WHERE id = ?",
        [1, "name-2"],
      );
    });
  });
});
