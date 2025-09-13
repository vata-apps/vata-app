/**
 * SQL schema for the system database
 */
export const SYSTEM_SCHEMA_SQL = `
-- Trees table: stores metadata about all family trees
CREATE TABLE IF NOT EXISTS trees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  file_path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- App settings table: stores global application settings
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS trees_name_index ON trees (name);
CREATE INDEX IF NOT EXISTS app_settings_key_index ON app_settings (key);
`;
