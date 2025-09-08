import { v4 as uuidv4 } from "uuid";
import { withTreeDb } from "./db/connection";
import {
  EventRole,
  CreateEventRoleInput,
  UpdateEventRoleInput,
} from "./db/types";

export const eventRoles = {
  async getAll(treeName: string): Promise<EventRole[]> {
    return withTreeDb(treeName, async (database) => {
      const result = await database.select<EventRole[]>(
        "SELECT id, created_at, name, key FROM event_roles ORDER BY name",
      );
      return result;
    });
  },

  async getById(treeName: string, id: string): Promise<EventRole | null> {
    return withTreeDb(treeName, async (database) => {
      const result = await database.select<EventRole[]>(
        "SELECT id, created_at, name, key FROM event_roles WHERE id = ?",
        [id],
      );

      return result[0] || null;
    });
  },

  async create(
    treeName: string,
    eventRole: CreateEventRoleInput,
  ): Promise<EventRole> {
    return withTreeDb(treeName, async (database) => {
      const id = uuidv4();
      await database.execute(
        "INSERT INTO event_roles (id, name, key) VALUES (?, ?, ?)",
        [id, eventRole.name, eventRole.key || null],
      );

      const result = await database.select<EventRole[]>(
        "SELECT id, created_at, name, key FROM event_roles WHERE id = ?",
        [id],
      );

      return result[0];
    });
  },

  async update(
    treeName: string,
    id: string,
    eventRole: UpdateEventRoleInput,
  ): Promise<EventRole> {
    return withTreeDb(treeName, async (database) => {
      // Build dynamic update query
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
        const existingEventRole = await this.getById(treeName, id);
        if (!existingEventRole) {
          throw new Error(`Event role with id ${id} not found`);
        }
        return existingEventRole;
      }

      values.push(id);
      await database.execute(
        `UPDATE event_roles SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );

      const result = await database.select<EventRole[]>(
        "SELECT id, created_at, name, key FROM event_roles WHERE id = ?",
        [id],
      );

      if (!result[0]) {
        throw new Error(`Event role with id ${id} not found`);
      }

      return result[0];
    });
  },

  async delete(treeName: string, id: string): Promise<void> {
    return withTreeDb(treeName, async (database) => {
      await database.execute("DELETE FROM event_roles WHERE id = ?", [id]);
    });
  },
};
