import { describe, it, expect, beforeEach, vi } from "vitest";
import { eventRoles } from "./event-roles";
import { mockDatabase, mockUuid } from "../test/mocks";
import {
  EventRole,
  CreateEventRoleInput,
  UpdateEventRoleInput,
} from "./db/types";

describe("eventRoles", () => {
  const testTreeName = "test-tree";
  const mockEventRole: EventRole = {
    id: "mock-uuid-1234",
    created_at: "2025-09-07T10:00:00Z",
    name: "Subject",
    key: "subject",
  };

  beforeEach(() => {
    mockUuid.v4.mockReturnValue("mock-uuid-1234");
  });

  describe("getAll", () => {
    it("should return all event roles ordered by name", async () => {
      const mockEventRoles = [mockEventRole];
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue(mockEventRoles),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await eventRoles.getAll(testTreeName);

      expect(mockDatabase.load).toHaveBeenCalledWith(
        `sqlite:trees/${testTreeName}.db`,
      );
      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT id, created_at, name, key FROM event_roles ORDER BY name",
      );
      expect(result).toEqual(mockEventRoles);
    });
  });

  describe("getById", () => {
    it("should return event role by id", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([mockEventRole]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await eventRoles.getById(testTreeName, "test-id");

      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT id, created_at, name, key FROM event_roles WHERE id = ?",
        ["test-id"],
      );
      expect(result).toEqual(mockEventRole);
    });

    it("should return null if event role not found", async () => {
      const mockDatabaseInstance = { select: vi.fn().mockResolvedValue([]) };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await eventRoles.getById(testTreeName, "nonexistent-id");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create an event role with generated UUID", async () => {
      const newEventRole: CreateEventRoleInput = {
        name: "Witness",
        key: "witness",
      };
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([mockEventRole]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await eventRoles.create(testTreeName, newEventRole);

      expect(mockUuid.v4).toHaveBeenCalled();
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO event_roles (id, name, key) VALUES (?, ?, ?)",
        ["mock-uuid-1234", "Witness", "witness"],
      );
      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT id, created_at, name, key FROM event_roles WHERE id = ?",
        ["mock-uuid-1234"],
      );
      expect(result).toEqual(mockEventRole);
    });

    it("should handle undefined key", async () => {
      const newEventRole: CreateEventRoleInput = { name: "Custom Role" };
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([mockEventRole]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await eventRoles.create(testTreeName, newEventRole);

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO event_roles (id, name, key) VALUES (?, ?, ?)",
        ["mock-uuid-1234", "Custom Role", null],
      );
    });
  });

  describe("update", () => {
    it("should update event role with provided fields", async () => {
      const updateData: UpdateEventRoleInput = { name: "Updated Subject" };
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi
          .fn()
          .mockResolvedValue([{ ...mockEventRole, name: "Updated Subject" }]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await eventRoles.update(
        testTreeName,
        "test-id",
        updateData,
      );

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "UPDATE event_roles SET name = ? WHERE id = ?",
        ["Updated Subject", "test-id"],
      );
      expect(result.name).toBe("Updated Subject");
    });

    it("should update both name and key", async () => {
      const updateData: UpdateEventRoleInput = {
        name: "Updated Role",
        key: "updated",
      };
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi
          .fn()
          .mockResolvedValue([
            { ...mockEventRole, name: "Updated Role", key: "updated" },
          ]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await eventRoles.update(
        testTreeName,
        "test-id",
        updateData,
      );

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "UPDATE event_roles SET name = ?, key = ? WHERE id = ?",
        ["Updated Role", "updated", "test-id"],
      );
      expect(result.name).toBe("Updated Role");
    });

    it("should return existing event role if no updates provided", async () => {
      const getByIdSpy = vi
        .spyOn(eventRoles, "getById")
        .mockResolvedValue(mockEventRole);

      const result = await eventRoles.update(testTreeName, "test-id", {});

      expect(result).toEqual(mockEventRole);

      getByIdSpy.mockRestore();
    });

    it("should throw error if event role not found for update", async () => {
      const updateData: UpdateEventRoleInput = { name: "New Name" };
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await expect(
        eventRoles.update(testTreeName, "nonexistent-id", updateData),
      ).rejects.toThrow("Event role with id nonexistent-id not found");
    });

    it("should throw error if event role not found when no updates provided", async () => {
      const getByIdSpy = vi
        .spyOn(eventRoles, "getById")
        .mockResolvedValue(null);

      await expect(
        eventRoles.update(testTreeName, "nonexistent-id", {}),
      ).rejects.toThrow("Event role with id nonexistent-id not found");

      getByIdSpy.mockRestore();
    });
  });

  describe("delete", () => {
    it("should delete event role by id", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await eventRoles.delete(testTreeName, "test-id");

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "DELETE FROM event_roles WHERE id = ?",
        ["test-id"],
      );
    });
  });
});
