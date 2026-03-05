import Database from '@tauri-apps/plugin-sql';
import { mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';
import { seedHarryPotterDemo } from './seed/harry-potter-demo';

let systemDb: Database | null = null;
let treeDb: Database | null = null;
let currentTreeFilename: string | null = null;

async function applyConnectionPragmas(db: Database): Promise<void> {
  await db.execute('PRAGMA journal_mode = WAL');
  await db.execute('PRAGMA synchronous = NORMAL');
  await db.execute('PRAGMA foreign_keys = ON');
  await db.execute('PRAGMA busy_timeout = 5000');
  await db.execute('PRAGMA cache_size = -20000');
  await db.execute('PRAGMA temp_store = MEMORY');
}

async function initializeTreeDb(db: Database): Promise<void> {
  // individuals
  await db.execute(`
    CREATE TABLE IF NOT EXISTS individuals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gender TEXT CHECK(gender IN ('M', 'F', 'U')) DEFAULT 'U',
      is_living INTEGER DEFAULT 1,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_individuals_gender ON individuals(gender)`);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_individuals_is_living ON individuals(is_living)`
  );

  // names
  await db.execute(`
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
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_names_individual ON names(individual_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_names_surname ON names(surname)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_names_given ON names(given_names)`);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_names_primary ON names(individual_id, is_primary)`
  );

  // families
  await db.execute(`
    CREATE TABLE IF NOT EXISTS families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // family_members
  await db.execute(`
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
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(family_id)`
  );
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_family_members_individual ON family_members(individual_id)`
  );

  // place_types
  await db.execute(`
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
    )
  `);

  // places
  await db.execute(`
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
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_places_name ON places(name)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_places_full_name ON places(full_name)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_places_place_type ON places(place_type_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_places_parent ON places(parent_id)`);

  // event_types
  await db.execute(`
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
    )
  `);

  // Insert system event types (only if not already present)
  const systemEventTypes = [
    ['BIRT', 'individual', 1],
    ['CHR', 'individual', 2],
    ['DEAT', 'individual', 3],
    ['BURI', 'individual', 4],
    ['CREM', 'individual', 5],
    ['ADOP', 'individual', 6],
    ['BAPM', 'individual', 7],
    ['BARM', 'individual', 8],
    ['BASM', 'individual', 9],
    ['CONF', 'individual', 10],
    ['FCOM', 'individual', 11],
    ['ORDN', 'individual', 12],
    ['NATU', 'individual', 13],
    ['EMIG', 'individual', 14],
    ['IMMI', 'individual', 15],
    ['CENS', 'individual', 16],
    ['PROB', 'individual', 17],
    ['WILL', 'individual', 18],
    ['GRAD', 'individual', 19],
    ['RETI', 'individual', 20],
    ['OCCU', 'individual', 21],
    ['RESI', 'individual', 22],
    ['EDUC', 'individual', 23],
    ['RELI', 'individual', 24],
    ['MARR', 'family', 1],
    ['MARB', 'family', 2],
    ['MARC', 'family', 3],
    ['MARL', 'family', 4],
    ['MARS', 'family', 5],
    ['ENGA', 'family', 6],
    ['DIV', 'family', 7],
    ['DIVF', 'family', 8],
    ['ANUL', 'family', 9],
  ];
  for (const [tag, category, sortOrder] of systemEventTypes) {
    await db.execute(
      `INSERT OR IGNORE INTO event_types (tag, category, is_system, sort_order) VALUES ($1, $2, 1, $3)`,
      [tag, category, sortOrder]
    );
  }

  // events
  await db.execute(`
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
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_events_date_sort ON events(date_sort)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_events_place ON events(place_id)`);

  // event_participants
  await db.execute(`
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
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id)`
  );
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_event_participants_individual ON event_participants(individual_id)`
  );
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_event_participants_family ON event_participants(family_id)`
  );

  // tree_meta
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tree_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  await db.execute(`INSERT OR IGNORE INTO tree_meta (key, value) VALUES ('schema_version', '1')`);
  await db.execute(
    `INSERT OR IGNORE INTO tree_meta (key, value) VALUES ('created_at', datetime('now'))`
  );
  await db.execute(`INSERT OR IGNORE INTO tree_meta (key, value) VALUES ('software', 'Vata')`);
  await db.execute(
    `INSERT OR IGNORE INTO tree_meta (key, value) VALUES ('software_version', '0.1.0')`
  );
}

async function initializeSystemDb(db: Database): Promise<void> {
  await db.execute(`
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
    )
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_trees_last_opened
    ON trees (last_opened_at DESC)
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

export async function getSystemDb(): Promise<Database> {
  if (!systemDb) {
    systemDb = await Database.load('sqlite:system.db');
    await applyConnectionPragmas(systemDb);
    await initializeSystemDb(systemDb);
    await seedHarryPotterDemo(systemDb);
  }
  return systemDb;
}

export async function openTreeDb(filename: string): Promise<Database> {
  if (treeDb && currentTreeFilename !== filename) {
    await treeDb.close(treeDb.path);
    treeDb = null;
    currentTreeFilename = null;
  }

  if (!treeDb) {
    await mkdir('trees', { baseDir: BaseDirectory.AppData, recursive: true });
    treeDb = await Database.load(`sqlite:trees/${filename}`);
    await applyConnectionPragmas(treeDb);
    await initializeTreeDb(treeDb);
    currentTreeFilename = filename;
  }

  return treeDb;
}

export async function getTreeDb(): Promise<Database> {
  if (!treeDb) {
    throw new Error('No tree database is currently open');
  }
  return treeDb;
}

export async function closeTreeDb(): Promise<void> {
  if (treeDb) {
    await treeDb.close(treeDb.path);
    treeDb = null;
    currentTreeFilename = null;
  }
}

export function isTreeDbOpen(): boolean {
  return treeDb !== null;
}

export function getCurrentTreeFilename(): string | null {
  return currentTreeFilename;
}
