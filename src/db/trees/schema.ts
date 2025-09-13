/**
 * Default place types to seed new tree databases
 */
export const DEFAULT_PLACE_TYPES = [
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

/**
 * Default event types to seed new tree databases
 */
export const DEFAULT_EVENT_TYPES = [
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

/**
 * Default event roles to seed new tree databases
 */
export const DEFAULT_EVENT_ROLES = [
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

/**
 * SQL schema for individual tree databases
 */
export const TREE_SCHEMA_SQL = `
-- Place types table
CREATE TABLE IF NOT EXISTS place_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  key TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS place_types_key_unique ON place_types (key);

-- Places table
CREATE TABLE IF NOT EXISTS places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  type_id INTEGER NOT NULL,
  parent_id INTEGER,
  latitude REAL,
  longitude REAL,
  FOREIGN KEY (type_id) REFERENCES place_types(id) ON UPDATE NO ACTION ON DELETE RESTRICT,
  FOREIGN KEY (parent_id) REFERENCES places(id) ON UPDATE NO ACTION ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS places_type_id_index ON places (type_id);
CREATE INDEX IF NOT EXISTS places_parent_id_index ON places (parent_id);

-- Event types table
CREATE TABLE IF NOT EXISTS event_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  key TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS event_types_key_unique ON event_types (key);

-- Event roles table
CREATE TABLE IF NOT EXISTS event_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  key TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS event_roles_key_unique ON event_roles (key);

-- Individuals table
CREATE TABLE IF NOT EXISTS individuals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'unknown'))
);

-- Names table
CREATE TABLE IF NOT EXISTS names (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  individual_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('birth', 'marriage', 'nickname', 'unknown')),
  first_name TEXT,
  last_name TEXT,
  is_primary INTEGER DEFAULT 0 NOT NULL CHECK (is_primary IN (0, 1)),
  FOREIGN KEY (individual_id) REFERENCES individuals(id) ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS names_individual_id_index ON names (individual_id);
CREATE INDEX IF NOT EXISTS names_is_primary_index ON names (is_primary);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  type_id INTEGER NOT NULL,
  date TEXT,
  description TEXT,
  place_id INTEGER,
  FOREIGN KEY (type_id) REFERENCES event_types(id) ON UPDATE NO ACTION ON DELETE RESTRICT,
  FOREIGN KEY (place_id) REFERENCES places(id) ON UPDATE NO ACTION ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS events_type_id_index ON events (type_id);
CREATE INDEX IF NOT EXISTS events_place_id_index ON events (place_id);

-- Event participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  event_id INTEGER NOT NULL,
  individual_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON UPDATE NO ACTION ON DELETE CASCADE,
  FOREIGN KEY (individual_id) REFERENCES individuals(id) ON UPDATE NO ACTION ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES event_roles(id) ON UPDATE NO ACTION ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS event_participants_event_id_index ON event_participants (event_id);
CREATE INDEX IF NOT EXISTS event_participants_individual_id_index ON event_participants (individual_id);
CREATE INDEX IF NOT EXISTS event_participants_role_id_index ON event_participants (role_id);
CREATE UNIQUE INDEX IF NOT EXISTS event_participants_unique ON event_participants (event_id, individual_id, role_id);
`;
