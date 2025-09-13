import { withTreeDbById } from "../connection";
import { Event, CreateEventInput, UpdateEventInput } from "../../types";

/**
 * Create a new event in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param event - Event data to create
 * @returns Promise with the created event
 */
export async function createEvent(
  treeId: string,
  event: CreateEventInput,
): Promise<Event> {
  return withTreeDbById(treeId, async (database) => {
    const typeId = parseInt(event.type_id, 10);
    const placeId = event.place_id ? parseInt(event.place_id, 10) : null;

    if (isNaN(typeId)) {
      throw new Error(`Invalid type ID: ${event.type_id}`);
    }
    if (event.place_id && isNaN(placeId!)) {
      throw new Error(`Invalid place ID: ${event.place_id}`);
    }

    const result = await database.execute(
      "INSERT INTO events (type_id, date, description, place_id) VALUES (?, ?, ?, ?) RETURNING id, created_at, type_id, date, description, place_id",
      [typeId, event.date || null, event.description || null, placeId],
    );

    const insertId = result.lastInsertId as number;

    return {
      id: insertId.toString(),
      created_at: new Date(),
      type_id: typeId.toString(),
      date: event.date || null,
      description: event.description || null,
      place_id: placeId?.toString() || null,
    };
  });
}

/**
 * Get all events from the specified tree database
 * @param treeId - Tree ID (as string)
 * @returns Promise with array of all events
 */
export async function getAllEvents(treeId: string): Promise<Event[]> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        type_id: number;
        date: string | null;
        description: string | null;
        place_id: number | null;
      }>
    >(
      "SELECT id, created_at, type_id, date, description, place_id FROM events ORDER BY date DESC, created_at DESC",
    );

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      type_id: row.type_id.toString(),
      date: row.date,
      description: row.description,
      place_id: row.place_id?.toString() || null,
    }));
  });
}

/**
 * Get a specific event by ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Event ID (as string)
 * @returns Promise with the event or null if not found
 */
export async function getEventById(
  treeId: string,
  id: string,
): Promise<Event | null> {
  return withTreeDbById(treeId, async (database) => {
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
      throw new Error(`Invalid event ID: ${id}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        type_id: number;
        date: string | null;
        description: string | null;
        place_id: number | null;
      }>
    >(
      "SELECT id, created_at, type_id, date, description, place_id FROM events WHERE id = ?",
      [eventId],
    );

    if (!result[0]) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      type_id: row.type_id.toString(),
      date: row.date,
      description: row.description,
      place_id: row.place_id?.toString() || null,
    };
  });
}

/**
 * Get events by type ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param typeId - Event type ID (as string)
 * @returns Promise with array of events of the specified type
 */
export async function getEventsByTypeId(
  treeId: string,
  typeId: string,
): Promise<Event[]> {
  return withTreeDbById(treeId, async (database) => {
    const typeIdNum = parseInt(typeId, 10);
    if (isNaN(typeIdNum)) {
      throw new Error(`Invalid type ID: ${typeId}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        type_id: number;
        date: string | null;
        description: string | null;
        place_id: number | null;
      }>
    >(
      "SELECT id, created_at, type_id, date, description, place_id FROM events WHERE type_id = ? ORDER BY date DESC, created_at DESC",
      [typeIdNum],
    );

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      type_id: row.type_id.toString(),
      date: row.date,
      description: row.description,
      place_id: row.place_id?.toString() || null,
    }));
  });
}

/**
 * Get events by place ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param placeId - Place ID (as string)
 * @returns Promise with array of events at the specified place
 */
export async function getEventsByPlaceId(
  treeId: string,
  placeId: string,
): Promise<Event[]> {
  return withTreeDbById(treeId, async (database) => {
    const placeIdNum = parseInt(placeId, 10);
    if (isNaN(placeIdNum)) {
      throw new Error(`Invalid place ID: ${placeId}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        type_id: number;
        date: string | null;
        description: string | null;
        place_id: number | null;
      }>
    >(
      "SELECT id, created_at, type_id, date, description, place_id FROM events WHERE place_id = ? ORDER BY date DESC, created_at DESC",
      [placeIdNum],
    );

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      type_id: row.type_id.toString(),
      date: row.date,
      description: row.description,
      place_id: row.place_id?.toString() || null,
    }));
  });
}

/**
 * Update an existing event in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Event ID (as string)
 * @param event - Updated event data
 * @returns Promise with the updated event
 */
export async function updateEvent(
  treeId: string,
  id: string,
  event: UpdateEventInput,
): Promise<Event> {
  return withTreeDbById(treeId, async (database) => {
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
      throw new Error(`Invalid event ID: ${id}`);
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (event.type_id !== undefined) {
      const typeId = parseInt(event.type_id, 10);
      if (isNaN(typeId)) {
        throw new Error(`Invalid type ID: ${event.type_id}`);
      }
      updates.push("type_id = ?");
      values.push(typeId);
    }
    if (event.date !== undefined) {
      updates.push("date = ?");
      values.push(event.date);
    }
    if (event.description !== undefined) {
      updates.push("description = ?");
      values.push(event.description);
    }
    if (event.place_id !== undefined) {
      const placeId = event.place_id ? parseInt(event.place_id, 10) : null;
      if (event.place_id && isNaN(placeId!)) {
        throw new Error(`Invalid place ID: ${event.place_id}`);
      }
      updates.push("place_id = ?");
      values.push(placeId);
    }

    if (updates.length === 0) {
      // No updates, return current event
      const current = await getEventById(treeId, id);
      if (!current) {
        throw new Error(`Event with ID ${id} not found`);
      }
      return current;
    }

    values.push(eventId);
    await database.execute(
      `UPDATE events SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const updated = await getEventById(treeId, id);
    if (!updated) {
      throw new Error(`Event with ID ${id} not found after update`);
    }

    return updated;
  });
}

/**
 * Delete an event from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Event ID (as string)
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteEvent(treeId: string, id: string): Promise<void> {
  return withTreeDbById(treeId, async (database) => {
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
      throw new Error(`Invalid event ID: ${id}`);
    }

    await database.execute("DELETE FROM events WHERE id = ?", [eventId]);
  });
}
