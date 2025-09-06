import { eq, count } from "drizzle-orm";
import Database from "@tauri-apps/plugin-sql";
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

// SQL schema for initial table creation
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS place_types (
  id text PRIMARY KEY NOT NULL,
  created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  name text NOT NULL,
  key text,
  is_system integer DEFAULT false NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS place_types_key_unique ON place_types (key);

CREATE TABLE IF NOT EXISTS places (
  id text PRIMARY KEY NOT NULL,
  created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  name text NOT NULL,
  type_id text NOT NULL,
  parent_id text,
  latitude real,
  longitude real,
  gedcom_id integer,
  FOREIGN KEY (type_id) REFERENCES place_types(id) ON UPDATE no action ON DELETE restrict,
  FOREIGN KEY (parent_id) REFERENCES places(id) ON UPDATE no action ON DELETE set null
);

CREATE UNIQUE INDEX IF NOT EXISTS places_gedcom_id_unique ON places (gedcom_id);
`;

export async function initializeDatabase(treeName: string): Promise<void> {
  try {
    const dbPath = `sqlite:trees/${treeName}.db`;
    const database = await Database.load(dbPath);

    // Create tables using SQL
    await database.execute(SCHEMA_SQL);

    // Now get Drizzle client for data operations
    const db = await getDb(treeName);

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
