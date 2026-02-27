import BetterSqlite3 from 'better-sqlite3';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS trees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    filename TEXT NOT NULL UNIQUE,
    description TEXT,
    individual_count INTEGER NOT NULL DEFAULT 0,
    family_count INTEGER NOT NULL DEFAULT 0,
    last_opened_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_trees_last_opened
    ON trees (last_opened_at DESC);
`;

/**
 * Creates a thin async wrapper around a better-sqlite3 in-memory database
 * that matches the subset of the @tauri-apps/plugin-sql Database interface
 * used by the DB layer functions.
 */
export function createInMemoryDb() {
  const sqlite = new BetterSqlite3(':memory:');
  sqlite.exec(SCHEMA);

  return {
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

    /** Exposes the raw sqlite instance for direct use in test setup/teardown. */
    _raw: sqlite,
  };
}

/** Converts $1, $2, ... placeholders to ?, ?, ... for better-sqlite3. */
function normalizePlaceholders(sql: string): string {
  return sql.replace(/\$\d+/g, '?');
}
