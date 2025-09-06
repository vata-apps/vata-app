import { eq, count } from "drizzle-orm";
import { getDb } from "./client";
import { placeTypes, NewPlaceType } from "./schema";

const DEFAULT_PLACE_TYPES: Omit<NewPlaceType, "id" | "createdAt">[] = [
  { name: "Country", key: "country", isSystem: true },
  { name: "State", key: "state", isSystem: true },
  { name: "City", key: "city", isSystem: true },
  { name: "County", key: "county", isSystem: true },
  { name: "Province", key: "province", isSystem: true },
  { name: "Region", key: "region", isSystem: true },
  { name: "District", key: "district", isSystem: true },
  { name: "Village", key: "village", isSystem: true },
  { name: "Town", key: "town", isSystem: true },
  { name: "Address", key: "address", isSystem: true },
];

export async function initializeDatabase(treeName: string): Promise<void> {
  try {
    const db = await getDb(treeName);

    // Tables are automatically created by Drizzle schema when first accessed

    // Check if place types already exist
    const existingTypesResult = await db
      .select({ count: count() })
      .from(placeTypes)
      .where(eq(placeTypes.isSystem, true));

    const existingCount = existingTypesResult[0]?.count ?? 0;

    // Insert default place types if they don't exist
    if (existingCount === 0) {
      const newPlaceTypes: NewPlaceType[] = DEFAULT_PLACE_TYPES.map(type => ({
        ...type,
      }));

      await db.insert(placeTypes).values(newPlaceTypes);
    }

    console.log(`Database initialized for tree: ${treeName}`);
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
