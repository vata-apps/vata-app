import { withTreeDbById } from "../connection";
import {
  EventRole,
  CreateEventRoleInput,
  UpdateEventRoleInput,
} from "../../types";

/**
 * Create a new event role in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param eventRole - Event role data to create
 * @returns Promise with the created event role
 */
export async function createEventRole(
  treeId: string,
  eventRole: CreateEventRoleInput,
): Promise<EventRole> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.execute(
      "INSERT INTO event_roles (name, key) VALUES (?, ?) RETURNING id, created_at, name, key",
      [eventRole.name, eventRole.key || null],
    );

    const insertId = result.lastInsertId as number;

    return {
      id: insertId.toString(),
      created_at: new Date(),
      name: eventRole.name,
      key: eventRole.key || null,
    };
  });
}

/**
 * Get all event roles from the specified tree database
 * @param treeId - Tree ID (as string)
 * @returns Promise with array of all event roles
 */
export async function getAllEventRoles(treeId: string): Promise<EventRole[]> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        name: string;
        key: string | null;
      }>
    >("SELECT id, created_at, name, key FROM event_roles ORDER BY name");

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      name: row.name,
      key: row.key,
    }));
  });
}

/**
 * Get a specific event role by ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Event role ID (as string)
 * @returns Promise with the event role or null if not found
 */
export async function getEventRoleById(
  treeId: string,
  id: string,
): Promise<EventRole | null> {
  return withTreeDbById(treeId, async (database) => {
    const eventRoleId = parseInt(id, 10);
    if (isNaN(eventRoleId)) {
      throw new Error(`Invalid event role ID: ${id}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        name: string;
        key: string | null;
      }>
    >("SELECT id, created_at, name, key FROM event_roles WHERE id = ?", [
      eventRoleId,
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
 * Get an event role by key from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param key - Event role key
 * @returns Promise with the event role or null if not found
 */
export async function getEventRoleByKey(
  treeId: string,
  key: string,
): Promise<EventRole | null> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        name: string;
        key: string | null;
      }>
    >("SELECT id, created_at, name, key FROM event_roles WHERE key = ?", [key]);

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
 * Update an existing event role in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Event role ID (as string)
 * @param eventRole - Updated event role data
 * @returns Promise with the updated event role
 */
export async function updateEventRole(
  treeId: string,
  id: string,
  eventRole: UpdateEventRoleInput,
): Promise<EventRole> {
  return withTreeDbById(treeId, async (database) => {
    const eventRoleId = parseInt(id, 10);
    if (isNaN(eventRoleId)) {
      throw new Error(`Invalid event role ID: ${id}`);
    }

    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (eventRole.name !== undefined) {
      updates.push("name = ?");
      values.push(eventRole.name);
    }
    if (eventRole.key !== undefined) {
      updates.push("key = ?");
      values.push(eventRole.key);
    }

    if (updates.length === 0) {
      // No updates, return current event role
      const current = await getEventRoleById(treeId, id);
      if (!current) {
        throw new Error(`Event role with ID ${id} not found`);
      }
      return current;
    }

    values.push(eventRoleId.toString());
    await database.execute(
      `UPDATE event_roles SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const updated = await getEventRoleById(treeId, id);
    if (!updated) {
      throw new Error(`Event role with ID ${id} not found after update`);
    }

    return updated;
  });
}

/**
 * Delete an event role from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Event role ID (as string)
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteEventRole(
  treeId: string,
  id: string,
): Promise<void> {
  return withTreeDbById(treeId, async (database) => {
    const eventRoleId = parseInt(id, 10);
    if (isNaN(eventRoleId)) {
      throw new Error(`Invalid event role ID: ${id}`);
    }

    await database.execute("DELETE FROM event_roles WHERE id = ?", [
      eventRoleId,
    ]);
  });
}
