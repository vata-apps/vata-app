import BetterSqlite3 from 'better-sqlite3';

// =============================================================================
// System Database Schema (system.db)
// =============================================================================

const SYSTEM_SCHEMA = `
  CREATE TABLE IF NOT EXISTS trees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    description TEXT,
    individual_count INTEGER NOT NULL DEFAULT 0,
    family_count INTEGER NOT NULL DEFAULT 0,
    last_opened_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_trees_last_opened
    ON trees (last_opened_at DESC);

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

// =============================================================================
// Tree Database Schema (tree.db)
// =============================================================================

const TREE_SCHEMA = `
  -- individuals
  CREATE TABLE IF NOT EXISTS individuals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gender TEXT CHECK(gender IN ('M', 'F', 'U')) DEFAULT 'U',
    is_living INTEGER DEFAULT 1,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_individuals_gender ON individuals(gender);
  CREATE INDEX IF NOT EXISTS idx_individuals_is_living ON individuals(is_living);

  -- names
  CREATE TABLE IF NOT EXISTS names (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    individual_id INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'birth',
    prefix TEXT,
    given_names TEXT,
    surname TEXT,
    suffix TEXT,
    nickname TEXT,
    is_primary INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (individual_id) REFERENCES individuals(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_names_individual ON names(individual_id);
  CREATE INDEX IF NOT EXISTS idx_names_surname ON names(surname);
  CREATE INDEX IF NOT EXISTS idx_names_given ON names(given_names);
  CREATE INDEX IF NOT EXISTS idx_names_primary ON names(individual_id, is_primary);

  -- families
  CREATE TABLE IF NOT EXISTS families (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- family_members
  CREATE TABLE IF NOT EXISTS family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER NOT NULL,
    individual_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('husband', 'wife', 'child')),
    pedigree TEXT CHECK(pedigree IN ('birth', 'adopted', 'foster', 'sealing', 'step')),
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
    FOREIGN KEY (individual_id) REFERENCES individuals(id) ON DELETE CASCADE,
    UNIQUE(family_id, individual_id, role)
  );
  CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(family_id);
  CREATE INDEX IF NOT EXISTS idx_family_members_individual ON family_members(individual_id);

  -- place_types
  CREATE TABLE IF NOT EXISTS place_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag TEXT UNIQUE,
    is_system INTEGER DEFAULT 0,
    custom_name TEXT,
    sort_order INTEGER DEFAULT 0,
    CHECK (
      (is_system = 1 AND tag IS NOT NULL AND custom_name IS NULL) OR
      (is_system = 0 AND custom_name IS NOT NULL)
    )
  );

  -- places
  CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    place_type_id INTEGER,
    parent_id INTEGER,
    latitude REAL,
    longitude REAL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (place_type_id) REFERENCES place_types(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES places(id) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_places_name ON places(name);
  CREATE INDEX IF NOT EXISTS idx_places_full_name ON places(full_name);
  CREATE INDEX IF NOT EXISTS idx_places_place_type ON places(place_type_id);
  CREATE INDEX IF NOT EXISTS idx_places_parent ON places(parent_id);

  -- event_types
  CREATE TABLE IF NOT EXISTS event_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag TEXT UNIQUE,
    category TEXT NOT NULL CHECK(category IN ('individual', 'family')),
    is_system INTEGER DEFAULT 0,
    custom_name TEXT,
    sort_order INTEGER DEFAULT 0,
    CHECK (
      (is_system = 1 AND tag IS NOT NULL AND custom_name IS NULL) OR
      (is_system = 0 AND custom_name IS NOT NULL)
    )
  );

  -- system event types
  INSERT OR IGNORE INTO event_types (tag, category, is_system, sort_order) VALUES ('BIRT', 'individual', 1, 1);
  INSERT OR IGNORE INTO event_types (tag, category, is_system, sort_order) VALUES ('CHR', 'individual', 1, 2);
  INSERT OR IGNORE INTO event_types (tag, category, is_system, sort_order) VALUES ('DEAT', 'individual', 1, 3);
  INSERT OR IGNORE INTO event_types (tag, category, is_system, sort_order) VALUES ('BURI', 'individual', 1, 4);
  INSERT OR IGNORE INTO event_types (tag, category, is_system, sort_order) VALUES ('MARR', 'family', 1, 1);
  INSERT OR IGNORE INTO event_types (tag, category, is_system, sort_order) VALUES ('DIV', 'family', 1, 7);

  -- events
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type_id INTEGER NOT NULL,
    date_original TEXT,
    date_sort TEXT,
    place_id INTEGER,
    description TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_type_id) REFERENCES event_types(id),
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type_id);
  CREATE INDEX IF NOT EXISTS idx_events_date_sort ON events(date_sort);
  CREATE INDEX IF NOT EXISTS idx_events_place ON events(place_id);

  -- event_participants
  CREATE TABLE IF NOT EXISTS event_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    individual_id INTEGER,
    family_id INTEGER,
    role TEXT NOT NULL DEFAULT 'principal',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (individual_id) REFERENCES individuals(id) ON DELETE CASCADE,
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
    CHECK ((individual_id IS NOT NULL AND family_id IS NULL) OR
           (individual_id IS NULL AND family_id IS NOT NULL))
  );
  CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
  CREATE INDEX IF NOT EXISTS idx_event_participants_individual ON event_participants(individual_id);
  CREATE INDEX IF NOT EXISTS idx_event_participants_family ON event_participants(family_id);

  -- tree_meta
  CREATE TABLE IF NOT EXISTS tree_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- repositories
  CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    country TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_repositories_name ON repositories(name);

  -- sources
  CREATE TABLE IF NOT EXISTS sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id INTEGER,
    title TEXT NOT NULL,
    author TEXT,
    publisher TEXT,
    publication_date TEXT,
    call_number TEXT,
    url TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sources_title ON sources(title);
  CREATE INDEX IF NOT EXISTS idx_sources_repository ON sources(repository_id);

  -- source_citations
  CREATE TABLE IF NOT EXISTS source_citations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER NOT NULL,
    page TEXT,
    quality TEXT CHECK(quality IN ('primary', 'secondary', 'questionable', 'unreliable')),
    date_accessed TEXT,
    text TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_citations_source ON source_citations(source_id);

  -- citation_links
  CREATE TABLE IF NOT EXISTS citation_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    citation_id INTEGER NOT NULL,
    entity_type TEXT NOT NULL CHECK(entity_type IN ('individual', 'name', 'event', 'family', 'place')),
    entity_id INTEGER NOT NULL,
    field_name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (citation_id) REFERENCES source_citations(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_citation_links_citation ON citation_links(citation_id);
  CREATE INDEX IF NOT EXISTS idx_citation_links_entity ON citation_links(entity_type, entity_id);

  -- files
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_filename TEXT NOT NULL,
    relative_path TEXT NOT NULL UNIQUE,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    thumbnail_path TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_files_mime_type ON files(mime_type);

  -- source_files
  CREATE TABLE IF NOT EXISTS source_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER NOT NULL,
    file_id INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    UNIQUE(source_id, file_id)
  );
  CREATE INDEX IF NOT EXISTS idx_source_files_source ON source_files(source_id);
  CREATE INDEX IF NOT EXISTS idx_source_files_file ON source_files(file_id);
`;

// =============================================================================
// Database wrapper factory
// =============================================================================

function createDbWrapper(schema: string) {
  const sqlite = new BetterSqlite3(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  sqlite.exec(schema);

  return {
    path: ':memory:',

    /**
     * Executes a write statement. Returns { lastInsertId, rowsAffected }.
     * Positional params use $1, $2, ... (plugin-sql style) — converted
     * internally to ?, ?, ... for better-sqlite3.
     */
    execute: async (sql: string, params: unknown[] = []) => {
      const normalized = normalizePlaceholders(sql);
      const stmt = sqlite.prepare(normalized);
      const result = stmt.run(...params);
      return {
        lastInsertId: result.lastInsertRowid as number,
        rowsAffected: result.changes,
      };
    },

    /**
     * Executes a SELECT and returns rows as an array of objects.
     */
    select: async <T = unknown>(sql: string, params: unknown[] = []): Promise<T> => {
      const normalized = normalizePlaceholders(sql);
      const stmt = sqlite.prepare(normalized);
      return stmt.all(...params) as T;
    },

    async close(): Promise<boolean> {
      sqlite.close();
      return true;
    },

    /** Exposes the raw sqlite instance for direct use in test setup/teardown. */
    _raw: sqlite,
  };
}

/**
 * Creates a thin async wrapper around a better-sqlite3 in-memory database
 * for system.db that matches the subset of the @tauri-apps/plugin-sql Database
 * interface used by the DB layer functions.
 */
export function createInMemoryDb() {
  return createDbWrapper(SYSTEM_SCHEMA);
}

/**
 * Creates an in-memory database for tree.db testing.
 * Includes all tables: individuals, names, families, places, events, etc.
 */
export function createTreeInMemoryDb() {
  return createDbWrapper(TREE_SCHEMA);
}

/** Converts $1, $2, ... placeholders to ?, ?, ... for better-sqlite3. */
function normalizePlaceholders(sql: string): string {
  return sql.replace(/\$\d+/g, '?');
}
