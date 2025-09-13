import { v4 as uuidv4 } from "uuid";
import { withTreeDb } from "./db/connection";
import {
  Event,
  EventParticipant,
  CreateEventInput,
  UpdateEventInput,
  CreateEventParticipantInput,
  UpdateEventParticipantInput,
} from "./db/types";

export const events = {
  // Events CRUD
  async getAll(treeName: string): Promise<Event[]> {
    return withTreeDb(treeName, async (database) => {
      return await database.select<Event[]>(
        "SELECT id, created_at, type_id, date, description, place_id, gedcom_id FROM events ORDER BY created_at DESC",
      );
    });
  },

  async getById(treeName: string, id: string): Promise<Event | null> {
    return withTreeDb(treeName, async (database) => {
      const result = await database.select<Event[]>(
        "SELECT id, created_at, type_id, date, description, place_id, gedcom_id FROM events WHERE id = ?",
        [id],
      );

      return result[0] || null;
    });
  },

  async create(treeName: string, event: CreateEventInput): Promise<Event> {
    return withTreeDb(treeName, async (database) => {
      const id = uuidv4();

      await database.execute(
        "INSERT INTO events (id, type_id, date, description, place_id, gedcom_id) VALUES (?, ?, ?, ?, ?, ?)",
        [
          id,
          event.typeId,
          event.date || null,
          event.description || null,
          event.placeId || null,
          event.gedcomId || null,
        ],
      );

      const result = await database.select<Event[]>(
        "SELECT id, created_at, type_id, date, description, place_id, gedcom_id FROM events WHERE id = ?",
        [id],
      );

      return result[0];
    });
  },

  async update(
    treeName: string,
    id: string,
    event: UpdateEventInput,
  ): Promise<Event> {
    return withTreeDb(treeName, async (database) => {
      const updates: string[] = [];
      const values: (string | number | null)[] = [];

      if (event.typeId !== undefined) {
        updates.push("type_id = ?");
        values.push(event.typeId);
      }
      if (event.date !== undefined) {
        updates.push("date = ?");
        values.push(event.date);
      }
      if (event.description !== undefined) {
        updates.push("description = ?");
        values.push(event.description);
      }
      if (event.placeId !== undefined) {
        updates.push("place_id = ?");
        values.push(event.placeId);
      }
      if (event.gedcomId !== undefined) {
        updates.push("gedcom_id = ?");
        values.push(event.gedcomId);
      }

      if (updates.length === 0) {
        const existingEvent = await this.getById(treeName, id);
        if (!existingEvent) {
          throw new Error(`Event with id ${id} not found`);
        }
        return existingEvent;
      }

      values.push(id);
      await database.execute(
        `UPDATE events SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );

      const result = await database.select<Event[]>(
        "SELECT id, created_at, type_id, date, description, place_id, gedcom_id FROM events WHERE id = ?",
        [id],
      );

      if (!result[0]) {
        throw new Error(`Event with id ${id} not found`);
      }

      return result[0];
    });
  },

  async delete(treeName: string, id: string): Promise<void> {
    return withTreeDb(treeName, async (database) => {
      // Event participants will be deleted automatically due to CASCADE
      await database.execute("DELETE FROM events WHERE id = ?", [id]);
    });
  },

  // Event Participants CRUD
  async getParticipants(
    treeName: string,
    eventId: string,
  ): Promise<EventParticipant[]> {
    return withTreeDb(treeName, async (database) => {
      return await database.select<EventParticipant[]>(
        "SELECT id, created_at, event_id, individual_id, role_id FROM event_participants WHERE event_id = ? ORDER BY created_at",
        [eventId],
      );
    });
  },

  async getParticipantById(
    treeName: string,
    id: string,
  ): Promise<EventParticipant | null> {
    return withTreeDb(treeName, async (database) => {
      const result = await database.select<EventParticipant[]>(
        "SELECT id, created_at, event_id, individual_id, role_id FROM event_participants WHERE id = ?",
        [id],
      );

      return result[0] || null;
    });
  },

  async addParticipant(
    treeName: string,
    participant: CreateEventParticipantInput,
  ): Promise<EventParticipant> {
    return withTreeDb(treeName, async (database) => {
      const id = uuidv4();

      await database.execute(
        "INSERT INTO event_participants (id, event_id, individual_id, role_id) VALUES (?, ?, ?, ?)",
        [id, participant.eventId, participant.individualId, participant.roleId],
      );

      const result = await database.select<EventParticipant[]>(
        "SELECT id, created_at, event_id, individual_id, role_id FROM event_participants WHERE id = ?",
        [id],
      );

      return result[0];
    });
  },

  async updateParticipant(
    treeName: string,
    id: string,
    participant: UpdateEventParticipantInput,
  ): Promise<EventParticipant> {
    return withTreeDb(treeName, async (database) => {
      const updates: string[] = [];
      const values: string[] = [];

      if (participant.individualId !== undefined) {
        updates.push("individual_id = ?");
        values.push(participant.individualId);
      }
      if (participant.roleId !== undefined) {
        updates.push("role_id = ?");
        values.push(participant.roleId);
      }

      if (updates.length === 0) {
        const existingParticipant = await this.getParticipantById(treeName, id);
        if (!existingParticipant) {
          throw new Error(`Event participant with id ${id} not found`);
        }
        return existingParticipant;
      }

      values.push(id);
      await database.execute(
        `UPDATE event_participants SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );

      const result = await database.select<EventParticipant[]>(
        "SELECT id, created_at, event_id, individual_id, role_id FROM event_participants WHERE id = ?",
        [id],
      );

      if (!result[0]) {
        throw new Error(`Event participant with id ${id} not found`);
      }

      return result[0];
    });
  },

  async removeParticipant(treeName: string, id: string): Promise<void> {
    return withTreeDb(treeName, async (database) => {
      await database.execute("DELETE FROM event_participants WHERE id = ?", [
        id,
      ]);
    });
  },

  // Helper to get event type key
  async getEventTypeKey(
    treeName: string,
    eventId: string,
  ): Promise<string | null> {
    return withTreeDb(treeName, async (database) => {
      const result = await database.select<Array<{ key: string | null }>>(
        `SELECT et.key FROM events e 
         INNER JOIN event_types et ON e.type_id = et.id 
         WHERE e.id = ?`,
        [eventId],
      );

      return result[0]?.key || null;
    });
  },

  // Validation for marriage events: always valid (no strict requirements)
  async validateMarriageParticipants(
    _treeName: string,
    _eventId: string,
  ): Promise<{ valid: boolean; message?: string }> {
    // No strict validation - marriage events are always valid
    // This allows flexibility for historical records, polygamy, incomplete records, etc.
    return { valid: true };
  },

  // Validation for non-marriage events: always valid (no strict requirements)
  async validateSingleSubjectParticipant(
    _treeName: string,
    _eventId: string,
  ): Promise<{ valid: boolean; message?: string }> {
    // No strict validation - events can have 0 or more subjects
    // This allows flexibility for incomplete records
    return { valid: true };
  },

  // Main validation function that routes to appropriate validator
  async validateEventParticipants(
    treeName: string,
    eventId: string,
  ): Promise<{ valid: boolean; message?: string }> {
    const eventTypeKey = await this.getEventTypeKey(treeName, eventId);

    if (eventTypeKey === "marriage") {
      return this.validateMarriageParticipants(treeName, eventId);
    } else {
      return this.validateSingleSubjectParticipant(treeName, eventId);
    }
  },

  // Legacy function for backward compatibility
  async validateSubjectExists(
    treeName: string,
    eventId: string,
  ): Promise<boolean> {
    const validation = await this.validateEventParticipants(treeName, eventId);
    return validation.valid;
  },

  // Helper methods with joined data
  async getAllWithDetails(
    treeName: string,
  ): Promise<(Event & { participantCount: number })[]> {
    const events = await this.getAll(treeName);

    const eventsWithDetails = await Promise.all(
      events.map(async (event) => {
        const participants = await this.getParticipants(treeName, event.id);
        return { ...event, participantCount: participants.length };
      }),
    );

    return eventsWithDetails;
  },

  async getByIdWithParticipants(
    treeName: string,
    id: string,
  ): Promise<(Event & { participants: EventParticipant[] }) | null> {
    const event = await this.getById(treeName, id);
    if (!event) return null;

    const participants = await this.getParticipants(treeName, id);
    return { ...event, participants };
  },

  // Create event with initial subject participant (for non-marriage events)
  async createWithSubject(
    treeName: string,
    event: CreateEventInput,
    subjectIndividualId: string,
    subjectRoleId: string,
  ): Promise<Event & { participants: EventParticipant[] }> {
    const createdEvent = await this.create(treeName, event);

    const participant = await this.addParticipant(treeName, {
      eventId: createdEvent.id,
      individualId: subjectIndividualId,
      roleId: subjectRoleId,
    });

    return { ...createdEvent, participants: [participant] };
  },

  // Create marriage event with husband and wife participants
  async createMarriage(
    treeName: string,
    event: CreateEventInput,
    husbandId: string,
    wifeId: string,
    husbandRoleId: string,
    wifeRoleId: string,
  ): Promise<Event & { participants: EventParticipant[] }> {
    const createdEvent = await this.create(treeName, event);

    const husbandParticipant = await this.addParticipant(treeName, {
      eventId: createdEvent.id,
      individualId: husbandId,
      roleId: husbandRoleId,
    });

    const wifeParticipant = await this.addParticipant(treeName, {
      eventId: createdEvent.id,
      individualId: wifeId,
      roleId: wifeRoleId,
    });

    return {
      ...createdEvent,
      participants: [husbandParticipant, wifeParticipant],
    };
  },

  // Helper to determine if an event type is marriage
  async isMarriageEventType(
    treeName: string,
    typeId: string,
  ): Promise<boolean> {
    return withTreeDb(treeName, async (database) => {
      const result = await database.select<Array<{ key: string | null }>>(
        "SELECT key FROM event_types WHERE id = ?",
        [typeId],
      );

      return result[0]?.key === "marriage";
    });
  },
};
