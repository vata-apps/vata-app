import { describe, it, expect, beforeEach, vi } from "vitest";
import { eventTypes } from "./event-types";
import { mockDatabase, mockUuid } from "../test/mocks";
import {
  EventType,
  CreateEventTypeInput,
  UpdateEventTypeInput,
} from "./db/types";

describe("eventTypes", () => {
  const testTreeName = "test-tree";
  const mockEventType: EventType = {
    id: "mock-uuid-1234",
    created_at: "2025-09-07T10:00:00Z",
    name: "Wedding",
    key: null,
  };

  beforeEach(() => {
    mockUuid.v4.mockReturnValue("mock-uuid-1234");
  });

  describe("getAll", () => {
    it("should return all event types ordered by name", async () => {
      const mockEventTypes = [mockEventType];
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue(mockEventTypes),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await eventTypes.getAll(testTreeName);

      expect(mockDatabase.load).toHaveBeenCalledWith(
        `sqlite:trees/${testTreeName}.db`,
      );
      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT id, created_at, name, key FROM event_types ORDER BY name",
      );
      expect(result).toEqual(mockEventTypes);
    });
  });

  describe("getById", () => {
    it("should return event type by id", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([mockEventType]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await eventTypes.getById(testTreeName, "test-id");

      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT id, created_at, name, key FROM event_types WHERE id = ?",
        ["test-id"],
      );
      expect(result).toEqual(mockEventType);
    });

    it("should return null if event type not found", async () => {
      const mockDatabaseInstance = { select: vi.fn().mockResolvedValue([]) };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await eventTypes.getById(testTreeName, "nonexistent-id");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create an event type with generated UUID", async () => {
      const newEventType: CreateEventTypeInput = {
        name: "Graduation",
        key: "graduation",
      };
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([mockEventType]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await eventTypes.create(testTreeName, newEventType);

      expect(mockUuid.v4).toHaveBeenCalled();
      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO event_types (id, name, key) VALUES (?, ?, ?)",
        ["mock-uuid-1234", "Graduation", "graduation"],
      );
      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT id, created_at, name, key FROM event_types WHERE id = ?",
        ["mock-uuid-1234"],
      );
      expect(result).toEqual(mockEventType);
    });

    it("should handle undefined key", async () => {
      const newEventType: CreateEventTypeInput = { name: "Custom Event" };
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([mockEventType]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await eventTypes.create(testTreeName, newEventType);

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO event_types (id, name, key) VALUES (?, ?, ?)",
        ["mock-uuid-1234", "Custom Event", null],
      );
    });
  });

  describe("update", () => {
    it("should update event type with provided fields", async () => {
      const updateData: UpdateEventTypeInput = { name: "Updated Wedding" };
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi
          .fn()
          .mockResolvedValue([{ ...mockEventType, name: "Updated Wedding" }]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await eventTypes.update(
        testTreeName,
        "test-id",
        updateData,
      );

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "UPDATE event_types SET name = ? WHERE id = ?",
        ["Updated Wedding", "test-id"],
      );
      expect(result.name).toBe("Updated Wedding");
    });

    it("should update both name and key", async () => {
      const updateData: UpdateEventTypeInput = {
        name: "Updated Event",
        key: "updated",
      };
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi
          .fn()
          .mockResolvedValue([
            { ...mockEventType, name: "Updated Event", key: "updated" },
          ]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await eventTypes.update(
        testTreeName,
        "test-id",
        updateData,
      );

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "UPDATE event_types SET name = ?, key = ? WHERE id = ?",
        ["Updated Event", "updated", "test-id"],
      );
      expect(result.name).toBe("Updated Event");
    });

    it("should return existing event type if no updates provided", async () => {
      const getByIdSpy = vi
        .spyOn(eventTypes, "getById")
        .mockResolvedValue(mockEventType);

      const result = await eventTypes.update(testTreeName, "test-id", {});

      expect(result).toEqual(mockEventType);

      getByIdSpy.mockRestore();
    });

    it("should throw error if event type not found for update", async () => {
      const updateData: UpdateEventTypeInput = { name: "New Name" };
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await expect(
        eventTypes.update(testTreeName, "nonexistent-id", updateData),
      ).rejects.toThrow("Event type with id nonexistent-id not found");
    });

    it("should throw error if event type not found when no updates provided", async () => {
      const getByIdSpy = vi
        .spyOn(eventTypes, "getById")
        .mockResolvedValue(null);

      await expect(
        eventTypes.update(testTreeName, "nonexistent-id", {}),
      ).rejects.toThrow("Event type with id nonexistent-id not found");

      getByIdSpy.mockRestore();
    });
  });

  describe("delete", () => {
    it("should delete event type by id", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await eventTypes.delete(testTreeName, "test-id");

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "DELETE FROM event_types WHERE id = ?",
        ["test-id"],
      );
    });
  });
});
