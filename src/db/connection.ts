import Database from '@tauri-apps/plugin-sql';
import { mkdir, rename, exists } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';
import { getTreePathForSlug } from '$lib/tree-paths';
import { seedHarryPotterDemo } from './seed/harry-potter-demo';

let systemDb: Database | null = null;
let systemDbInitPromise: Promise<Database> | null = null;
let treeDb: Database | null = null;
let currentTreePath: string | null = null;

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

  // repositories
  await db.execute(`
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
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_repositories_name ON repositories(name)`);

  // sources
  await db.execute(`
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
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_sources_title ON sources(title)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_sources_repository ON sources(repository_id)`);

  // source_citations
  await db.execute(`
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
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_citations_source ON source_citations(source_id)`
  );

  // citation_links
  await db.execute(`
    CREATE TABLE IF NOT EXISTS citation_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citation_id INTEGER NOT NULL,
      entity_type TEXT NOT NULL CHECK(entity_type IN ('individual', 'name', 'event', 'family', 'place')),
      entity_id INTEGER NOT NULL,
      field_name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (citation_id) REFERENCES source_citations(id) ON DELETE CASCADE
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_citation_links_citation ON citation_links(citation_id)`
  );
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_citation_links_entity ON citation_links(entity_type, entity_id)`
  );

  // files
  await db.execute(`
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
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_files_mime_type ON files(mime_type)`);

  // source_files
  await db.execute(`
    CREATE TABLE IF NOT EXISTS source_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER NOT NULL,
      file_id INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
      FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
      UNIQUE(source_id, file_id)
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_source_files_source ON source_files(source_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_source_files_file ON source_files(file_id)`);
}

async function migrateSystemDbFilenameToPath(db: Database): Promise<void> {
  // Step 1: Rename column if still named 'filename'
  const cols = await db.select<{ name: string }[]>(
    "SELECT name FROM pragma_table_info('trees') WHERE name = 'filename'"
  );
  if (cols.length > 0) {
    await db.execute('ALTER TABLE trees RENAME COLUMN filename TO path');
  }

  // Step 2: Migrate any paths that are bare filenames (e.g. "tree.db") or
  // contain the wrong separator (e.g. "...genealogytrees/...")
  const baseDir = await appDataDir();
  const treesDir = `${baseDir}/trees`;
  const trees = await db.select<{ id: number; path: string }[]>(
    'SELECT id, path FROM trees'
  );

  for (const tree of trees) {
    if (tree.path.startsWith(treesDir + '/')) continue;

    // Determine the slug from the old value
    let slug: string;
    if (tree.path.endsWith('.db')) {
      // Bare filename: "harry-potter-demo.db" → "harry-potter-demo"
      slug = tree.path.replace(/\.db$/, '');
    } else {
      // Bad path from previous migration: extract last segment
      slug = tree.path.split('/').pop() ?? tree.path;
    }

    const newPath = await getTreePathForSlug(slug);
    const oldFilename = `${slug}.db`;
    const newFile = `${newPath}/${oldFilename}`;

    // The real .db file may live in one of two places depending on the bug:
    //  - ${treesDir}/${slug}.db         : bare-filename case (very old schema)
    //  - ${tree.path}/${slug}.db        : macOS bad-separator case, where
    //                                     tree.path is a malformed directory
    //                                     like "...vatatrees/${slug}"
    const candidateSources = [
      `${treesDir}/${oldFilename}`,
      tree.path.endsWith('.db') ? null : `${tree.path}/${oldFilename}`,
    ].filter((p): p is string => p !== null && p !== newFile);

    // Create the subdirectory. If this fails (permissions, disk full), skip
    // this tree — don't update the DB path to point to a nonexistent dir.
    await mkdir(newPath, { recursive: true });

    // Move the .db file from whichever old location still contains it.
    for (const sourceFile of candidateSources) {
      if (await exists(sourceFile)) {
        await rename(sourceFile, newFile);
        // WAL/SHM sidecar files may not exist — only move when present.
        if (await exists(`${sourceFile}-wal`)) {
          await rename(`${sourceFile}-wal`, `${newFile}-wal`);
        }
        if (await exists(`${sourceFile}-shm`)) {
          await rename(`${sourceFile}-shm`, `${newFile}-shm`);
        }
        break;
      }
    }

    await db.execute('UPDATE trees SET path = $1 WHERE id = $2', [newPath, tree.id]);
  }
}

async function initializeSystemDb(db: Database): Promise<void> {
  await db.execute(`
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
  if (systemDb) return systemDb;

  // Memoize the in-flight init promise so concurrent first-time callers all
  // await the same load/migrate/seed sequence instead of racing it.
  if (!systemDbInitPromise) {
    systemDbInitPromise = (async () => {
      const db = await Database.load('sqlite:system.db');
      await applyConnectionPragmas(db);
      await initializeSystemDb(db);
      await migrateSystemDbFilenameToPath(db);
      await seedHarryPotterDemo(db);
      systemDb = db;
      return db;
    })().finally(() => {
      systemDbInitPromise = null;
    });
  }

  return systemDbInitPromise;
}

export async function openTreeDb(treePath: string): Promise<Database> {
  if (treeDb && currentTreePath !== treePath) {
    await treeDb.close(treeDb.path);
    treeDb = null;
    currentTreePath = null;
  }

  if (!treeDb) {
    await mkdir(treePath, { recursive: true });
    await mkdir(`${treePath}/media`, { recursive: true });
    const dbName = treePath.split('/').pop() ?? 'tree';
    treeDb = await Database.load(`sqlite:${treePath}/${dbName}.db`);
    await applyConnectionPragmas(treeDb);
    await initializeTreeDb(treeDb);
    currentTreePath = treePath;
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
    const db = treeDb;
    treeDb = null;
    currentTreePath = null;
    await db.close(db.path);
  }
}

export function isTreeDbOpen(): boolean {
  return treeDb !== null;
}

export function getCurrentTreePath(): string | null {
  return currentTreePath;
}
