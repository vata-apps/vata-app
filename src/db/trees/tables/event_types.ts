import { withTreeDbById } from "../connection";
import {
  EventType,
  CreateEventTypeInput,
  UpdateEventTypeInput,
} from "../../types";

/**
 * Create a new event type in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param eventType - Event type data to create
 * @returns Promise with the created event type
 */
export async function createEventType(
  treeId: string,
  eventType: CreateEventTypeInput,
): Promise<EventType> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.execute(
      "INSERT INTO event_types (name, key) VALUES (?, ?) RETURNING id, created_at, name, key",
      [eventType.name, eventType.key || null],
    );

    const insertId = result.lastInsertId as number;

    return {
      id: insertId.toString(),
      created_at: new Date(),
      name: eventType.name,
      key: eventType.key || null,
    };
  });
}

/**
 * Get all event types from the specified tree database
 * @param treeId - Tree ID (as string)
 * @returns Promise with array of all event types
 */
export async function getAllEventTypes(treeId: string): Promise<EventType[]> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        name: string;
        key: string | null;
      }>
    >("SELECT id, created_at, name, key FROM event_types ORDER BY name");

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      name: row.name,
      key: row.key,
    }));
  });
}

/**
 * Get a specific event type by ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Event type ID (as string)
 * @returns Promise with the event type or null if not found
 */
export async function getEventTypeById(
  treeId: string,
  id: string,
): Promise<EventType | null> {
  return withTreeDbById(treeId, async (database) => {
    const eventTypeId = parseInt(id, 10);
    if (isNaN(eventTypeId)) {
      throw new Error(`Invalid event type ID: ${id}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        name: string;
        key: string | null;
      }>
    >("SELECT id, created_at, name, key FROM event_types WHERE id = ?", [
      eventTypeId,
    ]);

    if (!result[0]) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      name: row.name,
      key: row.key,
    };
  });
}

/**
 * Get an event type by key from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param key - Event type key
 * @returns Promise with the event type or null if not found
 */
export async function getEventTypeByKey(
  treeId: string,
  key: string,
): Promise<EventType | null> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        name: string;
        key: string | null;
      }>
    >("SELECT id, created_at, name, key FROM event_types WHERE key = ?", [key]);

    if (!result[0]) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      name: row.name,
      key: row.key,
    };
  });
}

/**
 * Update an existing event type in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Event type ID (as string)
 * @param eventType - Updated event type data
 * @returns Promise with the updated event type
 */
export async function updateEventType(
  treeId: string,
  id: string,
  eventType: UpdateEventTypeInput,
): Promise<EventType> {
  return withTreeDbById(treeId, async (database) => {
    const eventTypeId = parseInt(id, 10);
    if (isNaN(eventTypeId)) {
      throw new Error(`Invalid event type ID: ${id}`);
    }

    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (eventType.name !== undefined) {
      updates.push("name = ?");
      values.push(eventType.name);
    }
    if (eventType.key !== undefined) {
      updates.push("key = ?");
      values.push(eventType.key);
    }

    if (updates.length === 0) {
      // No updates, return current event type
      const current = await getEventTypeById(treeId, id);
      if (!current) {
        throw new Error(`Event type with ID ${id} not found`);
      }
      return current;
    }

    values.push(eventTypeId.toString());
    await database.execute(
      `UPDATE event_types SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const updated = await getEventTypeById(treeId, id);
    if (!updated) {
      throw new Error(`Event type with ID ${id} not found after update`);
    }

    return updated;
  });
}

/**
 * Delete an event type from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Event type ID (as string)
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteEventType(
  treeId: string,
  id: string,
): Promise<void> {
  return withTreeDbById(treeId, async (database) => {
    const eventTypeId = parseInt(id, 10);
    if (isNaN(eventTypeId)) {
      throw new Error(`Invalid event type ID: ${id}`);
    }

    await database.execute("DELETE FROM event_types WHERE id = ?", [
      eventTypeId,
    ]);
  });
}
