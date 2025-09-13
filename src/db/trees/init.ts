import { withTreeDbById } from "./connection";
import {
  TREE_SCHEMA_SQL,
  DEFAULT_PLACE_TYPES,
  DEFAULT_EVENT_TYPES,
  DEFAULT_EVENT_ROLES,
} from "./schema";

/**
 * Initialize a tree database with required tables and default data
 * This should be called when a new tree is created
 * @param treeId - Tree ID (as string)
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeTreeDatabase(treeId: string): Promise<void> {
  try {
    await withTreeDbById(treeId, async (database) => {
      // Create tables
      await database.execute(TREE_SCHEMA_SQL);

      // Check if place types already exist
      const existingPlaceTypes = await database.select<
        Array<{ count: number }>
      >("SELECT COUNT(*) as count FROM place_types");

      const placeTypesCount = existingPlaceTypes[0]?.count || 0;

      // Insert default place types if they don't exist
      if (placeTypesCount === 0) {
        for (const placeType of DEFAULT_PLACE_TYPES) {
          await database.execute(
            "INSERT INTO place_types (name, key) VALUES (?, ?)",
            [placeType.name, placeType.key],
          );
        }
        console.log(
          `Seeded ${DEFAULT_PLACE_TYPES.length} default place types for tree ${treeId}`,
        );
      }

      // Check if event types already exist
      const existingEventTypes = await database.select<
        Array<{ count: number }>
      >("SELECT COUNT(*) as count FROM event_types");

      const eventTypesCount = existingEventTypes[0]?.count || 0;

      // Insert default event types if they don't exist
      if (eventTypesCount === 0) {
        for (const eventType of DEFAULT_EVENT_TYPES) {
          await database.execute(
            "INSERT INTO event_types (name, key) VALUES (?, ?)",
            [eventType.name, eventType.key],
          );
        }
        console.log(
          `Seeded ${DEFAULT_EVENT_TYPES.length} default event types for tree ${treeId}`,
        );
      }

      // Check if event roles already exist
      const existingEventRoles = await database.select<
        Array<{ count: number }>
      >("SELECT COUNT(*) as count FROM event_roles");

      const eventRolesCount = existingEventRoles[0]?.count || 0;

      // Insert default event roles if they don't exist
      if (eventRolesCount === 0) {
        for (const eventRole of DEFAULT_EVENT_ROLES) {
          await database.execute(
            "INSERT INTO event_roles (name, key) VALUES (?, ?)",
            [eventRole.name, eventRole.key],
          );
        }
        console.log(
          `Seeded ${DEFAULT_EVENT_ROLES.length} default event roles for tree ${treeId}`,
        );
      }
    });

    console.log(`Tree database initialized successfully for tree: ${treeId}`);
  } catch (error) {
    console.error(
      `Failed to initialize tree database for tree ${treeId}:`,
      error,
    );
    throw error;
  }
}
