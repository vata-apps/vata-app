import Database from "@tauri-apps/plugin-sql";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_PLACE_TYPES = [
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

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS place_types (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
  name TEXT NOT NULL,
  key TEXT,
  is_system INTEGER DEFAULT 0 NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS place_types_key_unique ON place_types (key);

CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
  name TEXT NOT NULL,
  type_id TEXT NOT NULL,
  parent_id TEXT,
  latitude REAL,
  longitude REAL,
  gedcom_id INTEGER,
  FOREIGN KEY (type_id) REFERENCES place_types(id) ON UPDATE NO ACTION ON DELETE RESTRICT,
  FOREIGN KEY (parent_id) REFERENCES places(id) ON UPDATE NO ACTION ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS places_gedcom_id_unique ON places (gedcom_id);
`;

export async function initializeDatabase(treeName: string): Promise<void> {
  try {
    const dbPath = `sqlite:trees/${treeName}.db`;
    const database = await Database.load(dbPath);

    // Create tables
    await database.execute(SCHEMA_SQL);

    // Check if place types already exist
    const existingTypes = await database.select(
      "SELECT COUNT(*) as count FROM place_types WHERE is_system = 1"
    ) as Array<{ count: number }>;

    const existingCount = existingTypes[0]?.count || 0;

    // Insert default place types if they don't exist
    if (existingCount === 0) {
      for (const placeType of DEFAULT_PLACE_TYPES) {
        await database.execute(
          "INSERT INTO place_types (id, name, key, is_system) VALUES (?, ?, ?, ?)",
          [uuidv4(), placeType.name, placeType.key, placeType.isSystem ? 1 : 0]
        );
      }
      console.log(`Seeded ${DEFAULT_PLACE_TYPES.length} default place types`);
    }

    console.log(`Database initialized for tree: ${treeName}`);
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
