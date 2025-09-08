import { v4 as uuidv4 } from "uuid";
import { withTreeDb } from "./db/connection";
import {
  EventType,
  CreateEventTypeInput,
  UpdateEventTypeInput,
} from "./db/types";

export const eventTypes = {
  async getAll(treeName: string): Promise<EventType[]> {
    return withTreeDb(treeName, async (database) => {
      const result = await database.select<EventType[]>(
        "SELECT id, created_at, name, key FROM event_types ORDER BY name",
      );
      return result;
    });
  },

  async getById(treeName: string, id: string): Promise<EventType | null> {
    return withTreeDb(treeName, async (database) => {
      const result = await database.select<EventType[]>(
        "SELECT id, created_at, name, key FROM event_types WHERE id = ?",
        [id],
      );

      return result[0] || null;
    });
  },

  async create(
    treeName: string,
    eventType: CreateEventTypeInput,
  ): Promise<EventType> {
    return withTreeDb(treeName, async (database) => {
      const id = uuidv4();
      await database.execute(
        "INSERT INTO event_types (id, name, key) VALUES (?, ?, ?)",
        [id, eventType.name, eventType.key || null],
      );

      const result = await database.select<EventType[]>(
        "SELECT id, created_at, name, key FROM event_types WHERE id = ?",
        [id],
      );

      return result[0];
    });
  },

  async update(
    treeName: string,
    id: string,
    eventType: UpdateEventTypeInput,
  ): Promise<EventType> {
    return withTreeDb(treeName, async (database) => {
      // Build dynamic update query
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
        const existingEventType = await this.getById(treeName, id);
        if (!existingEventType) {
          throw new Error(`Event type with id ${id} not found`);
        }
        return existingEventType;
      }

      values.push(id);
      await database.execute(
        `UPDATE event_types SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );

      const result = await database.select<EventType[]>(
        "SELECT id, created_at, name, key FROM event_types WHERE id = ?",
        [id],
      );

      if (!result[0]) {
        throw new Error(`Event type with id ${id} not found`);
      }

      return result[0];
    });
  },

  async delete(treeName: string, id: string): Promise<void> {
    return withTreeDb(treeName, async (database) => {
      await database.execute("DELETE FROM event_types WHERE id = ?", [id]);
    });
  },
};
