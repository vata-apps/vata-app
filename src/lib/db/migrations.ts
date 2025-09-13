import Database from "@tauri-apps/plugin-sql";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_PLACE_TYPES = [
  { name: "Country", key: "country" },
  { name: "State", key: "state" },
  { name: "City", key: "city" },
  { name: "County", key: "county" },
  { name: "Province", key: "province" },
  { name: "Region", key: "region" },
  { name: "District", key: "district" },
  { name: "Village", key: "village" },
  { name: "Town", key: "town" },
  { name: "Address", key: "address" },
];

const DEFAULT_EVENT_TYPES = [
  { name: "Birth", key: "birth" },
  { name: "Death", key: "death" },
  { name: "Marriage", key: "marriage" },
  { name: "Baptism", key: "baptism" },
  { name: "Burial", key: "burial" },
  { name: "Immigration", key: "immigration" },
  { name: "Census", key: "census" },
  { name: "Engagement", key: "engagement" },
  { name: "Separation", key: "separation" },
  { name: "Retirement", key: "retirement" },
  { name: "Other", key: "other" },
];

const DEFAULT_EVENT_ROLES = [
  { name: "Subject", key: "subject" },
  { name: "Husband", key: "husband" },
  { name: "Wife", key: "wife" },
  { name: "Mother", key: "mother" },
  { name: "Father", key: "father" },
  { name: "Witness", key: "witness" },
  { name: "Godfather", key: "godfather" },
  { name: "Godmother", key: "godmother" },
  { name: "Officiant", key: "officiant" },
  { name: "Father of Husband", key: "father_of_husband" },
  { name: "Mother of Husband", key: "mother_of_husband" },
  { name: "Father of Wife", key: "father_of_wife" },
  { name: "Mother of Wife", key: "mother_of_wife" },
  { name: "Other", key: "other" },
];

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS place_types (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
  name TEXT NOT NULL,
  key TEXT
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

CREATE TABLE IF NOT EXISTS event_types (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
  name TEXT NOT NULL,
  key TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS event_types_key_unique ON event_types (key);

CREATE TABLE IF NOT EXISTS event_roles (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
  name TEXT NOT NULL,
  key TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS event_roles_key_unique ON event_roles (key);

CREATE TABLE IF NOT EXISTS individuals (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'unknown')),
  gedcom_id INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS individuals_gedcom_id_unique ON individuals (gedcom_id);

CREATE TABLE IF NOT EXISTS names (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
  individual_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('birth', 'marriage', 'nickname', 'unknown')),
  first_name TEXT,
  last_name TEXT,
  is_primary INTEGER DEFAULT 0 NOT NULL CHECK (is_primary IN (0, 1)),
  FOREIGN KEY (individual_id) REFERENCES individuals(id) ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS names_individual_id_index ON names (individual_id);
CREATE INDEX IF NOT EXISTS names_is_primary_index ON names (is_primary);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
  type_id TEXT NOT NULL,
  date TEXT,
  description TEXT,
  place_id TEXT,
  gedcom_id INTEGER,
  FOREIGN KEY (type_id) REFERENCES event_types(id) ON UPDATE NO ACTION ON DELETE RESTRICT,
  FOREIGN KEY (place_id) REFERENCES places(id) ON UPDATE NO ACTION ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS events_gedcom_id_unique ON events (gedcom_id);
CREATE INDEX IF NOT EXISTS events_type_id_index ON events (type_id);
CREATE INDEX IF NOT EXISTS events_place_id_index ON events (place_id);

CREATE TABLE IF NOT EXISTS event_participants (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
  event_id TEXT NOT NULL,
  individual_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON UPDATE NO ACTION ON DELETE CASCADE,
  FOREIGN KEY (individual_id) REFERENCES individuals(id) ON UPDATE NO ACTION ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES event_roles(id) ON UPDATE NO ACTION ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS event_participants_event_id_index ON event_participants (event_id);
CREATE INDEX IF NOT EXISTS event_participants_individual_id_index ON event_participants (individual_id);
CREATE INDEX IF NOT EXISTS event_participants_role_id_index ON event_participants (role_id);
CREATE UNIQUE INDEX IF NOT EXISTS event_participants_unique ON event_participants (event_id, individual_id, role_id);
`;

export async function initializeDatabase(treeName: string): Promise<void> {
  try {
    const dbPath = `sqlite:trees/${treeName}.db`;
    const database = await Database.load(dbPath);

    // Create tables
    await database.execute(SCHEMA_SQL);

    // Check if place types already exist
    const existingTypes = await database.select<Array<{ count: number }>>(
      "SELECT COUNT(*) as count FROM place_types",
    );

    const existingCount = existingTypes[0]?.count || 0;

    // Insert default place types if they don't exist
    if (existingCount === 0) {
      for (const placeType of DEFAULT_PLACE_TYPES) {
        await database.execute(
          "INSERT INTO place_types (id, name, key) VALUES (?, ?, ?)",
          [uuidv4(), placeType.name, placeType.key],
        );
      }
      console.log(`Seeded ${DEFAULT_PLACE_TYPES.length} default place types`);
    }

    // Check if event types already exist
    const existingEventTypes = await database.select<Array<{ count: number }>>(
      "SELECT COUNT(*) as count FROM event_types",
    );

    const existingEventTypesCount = existingEventTypes[0]?.count || 0;

    // Insert default event types if they don't exist
    if (existingEventTypesCount === 0) {
      for (const eventType of DEFAULT_EVENT_TYPES) {
        await database.execute(
          "INSERT INTO event_types (id, name, key) VALUES (?, ?, ?)",
          [uuidv4(), eventType.name, eventType.key],
        );
      }
      console.log(`Seeded ${DEFAULT_EVENT_TYPES.length} default event types`);
    }

    // Check if event roles already exist
    const existingEventRoles = await database.select<Array<{ count: number }>>(
      "SELECT COUNT(*) as count FROM event_roles",
    );

    const existingEventRolesCount = existingEventRoles[0]?.count || 0;

    // Insert default event roles if they don't exist
    if (existingEventRolesCount === 0) {
      for (const eventRole of DEFAULT_EVENT_ROLES) {
        await database.execute(
          "INSERT INTO event_roles (id, name, key) VALUES (?, ?, ?)",
          [uuidv4(), eventRole.name, eventRole.key],
        );
      }
      console.log(`Seeded ${DEFAULT_EVENT_ROLES.length} default event roles`);
    }

    console.log(`Database initialized for tree: ${treeName}`);
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
