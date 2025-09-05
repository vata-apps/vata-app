import Database from "@tauri-apps/plugin-sql";

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS place_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name TEXT NOT NULL,
    key TEXT,
    is_system INTEGER DEFAULT 0 NOT NULL
  );
  
  CREATE UNIQUE INDEX IF NOT EXISTS place_types_key_unique ON place_types (key);
  
  CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name TEXT NOT NULL,
    type_id INTEGER NOT NULL,
    parent_id INTEGER,
    latitude REAL,
    longitude REAL,
    gedcom_id INTEGER,
    FOREIGN KEY (type_id) REFERENCES place_types(id) ON UPDATE NO ACTION ON DELETE RESTRICT,
    FOREIGN KEY (parent_id) REFERENCES places(id) ON UPDATE NO ACTION ON DELETE SET NULL
  );
  
  CREATE UNIQUE INDEX IF NOT EXISTS places_gedcom_id_unique ON places (gedcom_id);
`;

const DEFAULT_PLACE_TYPES = [
  { name: "Country", key: "country", is_system: 1 },
  { name: "State", key: "state", is_system: 1 },
  { name: "City", key: "city", is_system: 1 },
  { name: "County", key: "county", is_system: 1 },
  { name: "Province", key: "province", is_system: 1 },
  { name: "Region", key: "region", is_system: 1 },
  { name: "District", key: "district", is_system: 1 },
  { name: "Village", key: "village", is_system: 1 },
  { name: "Town", key: "town", is_system: 1 },
  { name: "Address", key: "address", is_system: 1 },
];

export async function initializeDatabase(treeName: string): Promise<void> {
  const dbPath = `sqlite:trees/${treeName}.db`;
  const database = await Database.load(dbPath);

  try {
    // Execute schema creation
    const statements = SCHEMA_SQL.trim()
      .split(";")
      .filter((s) => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await database.execute(statement.trim());
      }
    }

    // Check if place types already exist
    const existingTypes = await database.select(
      "SELECT COUNT(*) as count FROM place_types WHERE is_system = 1"
    );
    const count = existingTypes[0]?.count || 0;

    // Insert default place types if they don't exist
    if (count === 0) {
      for (const placeType of DEFAULT_PLACE_TYPES) {
        await database.execute(
          "INSERT INTO place_types (name, key, is_system) VALUES ($1, $2, $3)",
          [placeType.name, placeType.key, placeType.is_system]
        );
      }
    }

    console.log(`Database initialized for tree: ${treeName}`);
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
