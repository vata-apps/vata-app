import { withTreeDbById } from "../connection";
import {
  EventParticipant,
  CreateEventParticipantInput,
  UpdateEventParticipantInput,
} from "../../types";

/**
 * Create a new event participant in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param participant - Event participant data to create
 * @returns Promise with the created event participant
 */
export async function createEventParticipant(
  treeId: string,
  participant: CreateEventParticipantInput,
): Promise<EventParticipant> {
  return withTreeDbById(treeId, async (database) => {
    const eventId = parseInt(participant.event_id, 10);
    const individualId = parseInt(participant.individual_id, 10);
    const roleId = parseInt(participant.role_id, 10);

    if (isNaN(eventId)) {
      throw new Error(`Invalid event ID: ${participant.event_id}`);
    }
    if (isNaN(individualId)) {
      throw new Error(`Invalid individual ID: ${participant.individual_id}`);
    }
    if (isNaN(roleId)) {
      throw new Error(`Invalid role ID: ${participant.role_id}`);
    }

    const result = await database.execute(
      "INSERT INTO event_participants (event_id, individual_id, role_id) VALUES (?, ?, ?) RETURNING id, created_at, event_id, individual_id, role_id",
      [eventId, individualId, roleId],
    );

    const insertId = result.lastInsertId as number;

    return {
      id: insertId.toString(),
      created_at: new Date(),
      event_id: eventId.toString(),
      individual_id: individualId.toString(),
      role_id: roleId.toString(),
    };
  });
}

/**
 * Get all event participants from the specified tree database
 * @param treeId - Tree ID (as string)
 * @returns Promise with array of all event participants
 */
export async function getAllEventParticipants(
  treeId: string,
): Promise<EventParticipant[]> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        event_id: number;
        individual_id: number;
        role_id: number;
      }>
    >(
      "SELECT id, created_at, event_id, individual_id, role_id FROM event_participants ORDER BY created_at",
    );

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      event_id: row.event_id.toString(),
      individual_id: row.individual_id.toString(),
      role_id: row.role_id.toString(),
    }));
  });
}

/**
 * Get a specific event participant by ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Event participant ID (as string)
 * @returns Promise with the event participant or null if not found
 */
export async function getEventParticipantById(
  treeId: string,
  id: string,
): Promise<EventParticipant | null> {
  return withTreeDbById(treeId, async (database) => {
    const participantId = parseInt(id, 10);
    if (isNaN(participantId)) {
      throw new Error(`Invalid event participant ID: ${id}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        event_id: number;
        individual_id: number;
        role_id: number;
      }>
    >(
      "SELECT id, created_at, event_id, individual_id, role_id FROM event_participants WHERE id = ?",
      [participantId],
    );

    if (!result[0]) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      event_id: row.event_id.toString(),
      individual_id: row.individual_id.toString(),
      role_id: row.role_id.toString(),
    };
  });
}

/**
 * Get event participants by event ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param eventId - Event ID (as string)
 * @returns Promise with array of participants for the event
 */
export async function getEventParticipantsByEventId(
  treeId: string,
  eventId: string,
): Promise<EventParticipant[]> {
  return withTreeDbById(treeId, async (database) => {
    const eventIdNum = parseInt(eventId, 10);
    if (isNaN(eventIdNum)) {
      throw new Error(`Invalid event ID: ${eventId}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        event_id: number;
        individual_id: number;
        role_id: number;
      }>
    >(
      "SELECT id, created_at, event_id, individual_id, role_id FROM event_participants WHERE event_id = ? ORDER BY created_at",
      [eventIdNum],
    );

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      event_id: row.event_id.toString(),
      individual_id: row.individual_id.toString(),
      role_id: row.role_id.toString(),
    }));
  });
}

/**
 * Get event participants by individual ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param individualId - Individual ID (as string)
 * @returns Promise with array of events the individual participated in
 */
export async function getEventParticipantsByIndividualId(
  treeId: string,
  individualId: string,
): Promise<EventParticipant[]> {
  return withTreeDbById(treeId, async (database) => {
    const individualIdNum = parseInt(individualId, 10);
    if (isNaN(individualIdNum)) {
      throw new Error(`Invalid individual ID: ${individualId}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        event_id: number;
        individual_id: number;
        role_id: number;
      }>
    >(
      "SELECT id, created_at, event_id, individual_id, role_id FROM event_participants WHERE individual_id = ? ORDER BY created_at",
      [individualIdNum],
    );

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      event_id: row.event_id.toString(),
      individual_id: row.individual_id.toString(),
      role_id: row.role_id.toString(),
    }));
  });
}

/**
 * Get event participants by role ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param roleId - Role ID (as string)
 * @returns Promise with array of participants with the specified role
 */
export async function getEventParticipantsByRoleId(
  treeId: string,
  roleId: string,
): Promise<EventParticipant[]> {
  return withTreeDbById(treeId, async (database) => {
    const roleIdNum = parseInt(roleId, 10);
    if (isNaN(roleIdNum)) {
      throw new Error(`Invalid role ID: ${roleId}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        event_id: number;
        individual_id: number;
        role_id: number;
      }>
    >(
      "SELECT id, created_at, event_id, individual_id, role_id FROM event_participants WHERE role_id = ? ORDER BY created_at",
      [roleIdNum],
    );

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      event_id: row.event_id.toString(),
      individual_id: row.individual_id.toString(),
      role_id: row.role_id.toString(),
    }));
  });
}

/**
 * Update an existing event participant in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Event participant ID (as string)
 * @param participant - Updated event participant data
 * @returns Promise with the updated event participant
 */
export async function updateEventParticipant(
  treeId: string,
  id: string,
  participant: UpdateEventParticipantInput,
): Promise<EventParticipant> {
  return withTreeDbById(treeId, async (database) => {
    const participantId = parseInt(id, 10);
    if (isNaN(participantId)) {
      throw new Error(`Invalid event participant ID: ${id}`);
    }

    const updates: string[] = [];
    const values: number[] = [];

    if (participant.individual_id !== undefined) {
      const individualId = parseInt(participant.individual_id, 10);
      if (isNaN(individualId)) {
        throw new Error(`Invalid individual ID: ${participant.individual_id}`);
      }
      updates.push("individual_id = ?");
      values.push(individualId);
    }
    if (participant.role_id !== undefined) {
      const roleId = parseInt(participant.role_id, 10);
      if (isNaN(roleId)) {
        throw new Error(`Invalid role ID: ${participant.role_id}`);
      }
      updates.push("role_id = ?");
      values.push(roleId);
    }

    if (updates.length === 0) {
      // No updates, return current event participant
      const current = await getEventParticipantById(treeId, id);
      if (!current) {
        throw new Error(`Event participant with ID ${id} not found`);
      }
      return current;
    }

    values.push(participantId);
    await database.execute(
      `UPDATE event_participants SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const updated = await getEventParticipantById(treeId, id);
    if (!updated) {
      throw new Error(`Event participant with ID ${id} not found after update`);
    }

    return updated;
  });
}

/**
 * Delete an event participant from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Event participant ID (as string)
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteEventParticipant(
  treeId: string,
  id: string,
): Promise<void> {
  return withTreeDbById(treeId, async (database) => {
    const participantId = parseInt(id, 10);
    if (isNaN(participantId)) {
      throw new Error(`Invalid event participant ID: ${id}`);
    }

    await database.execute("DELETE FROM event_participants WHERE id = ?", [
      participantId,
    ]);
  });
}
