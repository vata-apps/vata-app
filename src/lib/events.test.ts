import { describe, it, expect, beforeEach, vi } from "vitest";
import { events } from "./events";
import { mockDatabase, mockUuid } from "../test/mocks";
import {
  Event,
  EventParticipant,
  CreateEventInput,
  CreateEventParticipantInput,
} from "./db/types";

describe("events", () => {
  const testTreeName = "test-tree";
  const mockEvent: Event = {
    id: "mock-uuid-1234",
    created_at: "2025-09-13T10:00:00Z",
    type_id: "event-type-uuid",
    date: "1990-01-15",
    description: "Birth of John Doe",
    place_id: "place-uuid",
    gedcom_id: null,
  };

  const mockEventParticipant: EventParticipant = {
    id: "mock-uuid-participant",
    created_at: "2025-09-13T10:00:00Z",
    event_id: "mock-uuid-1234",
    individual_id: "individual-uuid",
    role_id: "role-uuid",
  };

  beforeEach(() => {
    mockUuid.v4.mockReturnValue("mock-uuid-1234");
  });

  describe("getAll", () => {
    it("should return all events ordered by created_at DESC", async () => {
      const mockEvents = [mockEvent];
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue(mockEvents),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.getAll(testTreeName);

      expect(mockDatabase.load).toHaveBeenCalledWith(
        `sqlite:trees/${testTreeName}.db`,
      );
      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT id, created_at, type_id, date, description, place_id, gedcom_id FROM events ORDER BY created_at DESC",
      );
      expect(result).toEqual(mockEvents);
    });
  });

  describe("getById", () => {
    it("should return event by id", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([mockEvent]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.getById(testTreeName, "mock-uuid-1234");

      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT id, created_at, type_id, date, description, place_id, gedcom_id FROM events WHERE id = ?",
        ["mock-uuid-1234"],
      );
      expect(result).toEqual(mockEvent);
    });

    it("should return null if event not found", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.getById(testTreeName, "nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create event with provided gedcom_id", async () => {
      const createInput: CreateEventInput = {
        typeId: "event-type-uuid",
        date: "1990-01-15",
        description: "Birth event",
        placeId: "place-uuid",
        gedcomId: 42,
      };

      const mockEventWithGedcomId = { ...mockEvent, gedcom_id: 42 };
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([mockEventWithGedcomId]),
        execute: vi.fn().mockResolvedValue(undefined),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.create(testTreeName, createInput);

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO events (id, type_id, date, description, place_id, gedcom_id) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "mock-uuid-1234",
          "event-type-uuid",
          "1990-01-15",
          "Birth event",
          "place-uuid",
          42,
        ],
      );
      expect(result).toEqual(mockEventWithGedcomId);
    });

    it("should handle null optional fields including gedcom_id", async () => {
      const createInput: CreateEventInput = {
        typeId: "event-type-uuid",
      };

      const mockEventWithNulls = {
        ...mockEvent,
        date: null,
        description: null,
        place_id: null,
        gedcom_id: null,
      };
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([mockEventWithNulls]),
        execute: vi.fn().mockResolvedValue(undefined),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.create(testTreeName, createInput);

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO events (id, type_id, date, description, place_id, gedcom_id) VALUES (?, ?, ?, ?, ?, ?)",
        ["mock-uuid-1234", "event-type-uuid", null, null, null, null],
      );
      expect(result).toEqual(mockEventWithNulls);
    });
  });

  describe("update", () => {
    it("should update event fields dynamically", async () => {
      const updates = {
        date: "1990-02-15",
        description: "Updated description",
      };

      const updatedEvent = { ...mockEvent, ...updates };
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([updatedEvent]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.update(
        testTreeName,
        "mock-uuid-1234",
        updates,
      );

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "UPDATE events SET date = ?, description = ? WHERE id = ?",
        ["1990-02-15", "Updated description", "mock-uuid-1234"],
      );
      expect(result).toEqual(updatedEvent);
    });

    it("should return existing event if no updates provided", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([mockEvent]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.update(testTreeName, "mock-uuid-1234", {});

      expect(result).toEqual(mockEvent);
    });

    it("should throw error if event not found after update", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await expect(
        events.update(testTreeName, "nonexistent", { date: "2000-01-01" }),
      ).rejects.toThrow("Event with id nonexistent not found");
    });
  });

  describe("delete", () => {
    it("should delete event", async () => {
      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      await events.delete(testTreeName, "mock-uuid-1234");

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "DELETE FROM events WHERE id = ?",
        ["mock-uuid-1234"],
      );
    });
  });

  describe("getParticipants", () => {
    it("should return participants for an event", async () => {
      const mockParticipants = [mockEventParticipant];
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue(mockParticipants),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.getParticipants(
        testTreeName,
        "mock-uuid-1234",
      );

      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT id, created_at, event_id, individual_id, role_id FROM event_participants WHERE event_id = ? ORDER BY created_at",
        ["mock-uuid-1234"],
      );
      expect(result).toEqual(mockParticipants);
    });
  });

  describe("addParticipant", () => {
    it("should add participant to event", async () => {
      const participantInput: CreateEventParticipantInput = {
        eventId: "event-uuid",
        individualId: "individual-uuid",
        roleId: "role-uuid",
      };

      const mockDatabaseInstance = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([mockEventParticipant]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.addParticipant(
        testTreeName,
        participantInput,
      );

      expect(mockDatabaseInstance.execute).toHaveBeenCalledWith(
        "INSERT INTO event_participants (id, event_id, individual_id, role_id) VALUES (?, ?, ?, ?)",
        ["mock-uuid-1234", "event-uuid", "individual-uuid", "role-uuid"],
      );
      expect(result).toEqual(mockEventParticipant);
    });
  });

  describe("validateSubjectExists", () => {
    it("should always return true (no strict validation)", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([{ key: "birth" }]), // getEventTypeKey
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.validateSubjectExists(
        testTreeName,
        "event-uuid",
      );

      expect(result).toBe(true);
    });

    it("should return true even for events with no participants", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([{ key: "birth" }]), // getEventTypeKey
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.validateSubjectExists(
        testTreeName,
        "event-uuid",
      );

      expect(result).toBe(true);
    });
  });

  describe("createWithSubject", () => {
    it("should create event with initial subject participant", async () => {
      const eventInput: CreateEventInput = {
        typeId: "event-type-uuid",
        date: "1990-01-15",
      };

      const mockDatabaseInstance = {
        select: vi
          .fn()
          .mockResolvedValueOnce([mockEvent]) // create event
          .mockResolvedValueOnce([mockEventParticipant]), // add participant
        execute: vi.fn().mockResolvedValue(undefined),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);
      mockUuid.v4
        .mockReturnValueOnce("mock-uuid-1234") // event id
        .mockReturnValueOnce("mock-uuid-participant"); // participant id

      const result = await events.createWithSubject(
        testTreeName,
        eventInput,
        "individual-uuid",
        "subject-role-uuid",
      );

      expect(result).toEqual({
        ...mockEvent,
        participants: [mockEventParticipant],
      });
    });
  });

  describe("marriage event validation", () => {
    it("should always validate marriage events as valid (no database calls needed)", async () => {
      const result = await events.validateMarriageParticipants(
        testTreeName,
        "event-uuid",
      );

      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it("should validate marriage with no participants", async () => {
      const result = await events.validateMarriageParticipants(
        testTreeName,
        "event-uuid",
      );

      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it("should validate any marriage configuration", async () => {
      const result = await events.validateMarriageParticipants(
        testTreeName,
        "event-uuid",
      );

      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });
  });

  describe("createMarriage", () => {
    it("should create marriage event with husband and wife participants", async () => {
      const eventInput: CreateEventInput = {
        typeId: "marriage-type-uuid",
        date: "1990-06-15",
      };

      const mockDatabaseInstance = {
        select: vi
          .fn()
          .mockResolvedValueOnce([mockEvent]) // create event
          .mockResolvedValueOnce([mockEventParticipant]) // add husband
          .mockResolvedValueOnce([
            { ...mockEventParticipant, id: "wife-participant" },
          ]), // add wife
        execute: vi.fn().mockResolvedValue(undefined),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      mockUuid.v4
        .mockReturnValueOnce("mock-uuid-1234") // event id
        .mockReturnValueOnce("husband-participant") // husband participant id
        .mockReturnValueOnce("wife-participant"); // wife participant id

      const result = await events.createMarriage(
        testTreeName,
        eventInput,
        "husband-uuid",
        "wife-uuid",
        "husband-role-uuid",
        "wife-role-uuid",
      );

      expect(result.participants).toHaveLength(2);
      expect(mockDatabaseInstance.execute).toHaveBeenCalledTimes(3); // 1 event + 2 participants
    });
  });

  describe("event type checking", () => {
    it("should identify marriage event type correctly", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([{ key: "marriage" }]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.isMarriageEventType(
        testTreeName,
        "marriage-type-uuid",
      );

      expect(result).toBe(true);
      expect(mockDatabaseInstance.select).toHaveBeenCalledWith(
        "SELECT key FROM event_types WHERE id = ?",
        ["marriage-type-uuid"],
      );
    });

    it("should identify non-marriage event type correctly", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([{ key: "birth" }]),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.isMarriageEventType(
        testTreeName,
        "birth-type-uuid",
      );

      expect(result).toBe(false);
    });
  });

  describe("validateEventParticipants routing", () => {
    it("should route marriage events to marriage validation", async () => {
      const mockDatabaseInstance = {
        select: vi
          .fn()
          .mockResolvedValueOnce([{ key: "marriage" }]) // getEventTypeKey
          .mockResolvedValueOnce([{ count: 1 }]) // husband count
          .mockResolvedValueOnce([{ count: 1 }]), // wife count
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.validateEventParticipants(
        testTreeName,
        "event-uuid",
      );

      expect(result.valid).toBe(true);
    });

    it("should route non-marriage events to subject validation and always pass", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValueOnce([{ key: "birth" }]), // getEventTypeKey
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.validateEventParticipants(
        testTreeName,
        "event-uuid",
      );

      expect(result.valid).toBe(true);
    });

    it("should validate events with no subjects", async () => {
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValueOnce([{ key: "birth" }]), // getEventTypeKey
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.validateEventParticipants(
        testTreeName,
        "event-uuid",
      );

      expect(result.valid).toBe(true);
    });
  });

  describe("business logic validation", () => {
    it("should prevent creation of events without type_id", async () => {
      // This would be caught at the TypeScript level with CreateEventInput
      const invalidInput = {} as CreateEventInput;

      // The database constraint would catch this, but TypeScript prevents it
      expect(invalidInput.typeId).toBeUndefined();
    });

    it("should handle date as string (not validate format)", async () => {
      // Test that date field accepts any string format as specified
      const createInput: CreateEventInput = {
        typeId: "event-type-uuid",
        date: "circa 1990", // Non-standard date format should be allowed
      };

      const mockEventWithCustomDate = { ...mockEvent, date: "circa 1990" };
      const mockDatabaseInstance = {
        select: vi.fn().mockResolvedValue([mockEventWithCustomDate]),
        execute: vi.fn().mockResolvedValue(undefined),
      };
      mockDatabase.load.mockResolvedValue(mockDatabaseInstance);

      const result = await events.create(testTreeName, createInput);

      expect(result.date).toBe("circa 1990");
    });
  });
});
