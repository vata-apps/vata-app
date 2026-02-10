# Phase 1: Tree Schema

## Objective

Initialize the tree database schema with all tables for individuals, names, families, events, and places. Create indexes and insert default event types.

## Step 1.1: Tree Database Schema

### src/db/trees/schema.ts

```typescript
import Database from "@tauri-apps/plugin-sql";

/**
 * Initialize tree database schema
 */
export async function initializeTreeSchema(db: Database): Promise<void> {
  // Individuals
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

  // Names
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

  // Families
  await db.execute(`
    CREATE TABLE IF NOT EXISTS families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Family members
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

  // Place types (tag optional for system types; custom_name for user-defined types)
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

  // Places
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

  // Event types (tag optional for system types; custom_name for user-defined types)
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

  // Events
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

  // Event participants
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

  // Tree metadata
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tree_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Create indexes
  await createIndexes(db);

  // Insert default event types
  await insertDefaultEventTypes(db);

  // Insert metadata
  await insertMetadata(db);
}

async function createIndexes(db: Database): Promise<void> {
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_names_individual ON names(individual_id)",
    "CREATE INDEX IF NOT EXISTS idx_names_surname ON names(surname)",
    "CREATE INDEX IF NOT EXISTS idx_names_primary ON names(individual_id, is_primary)",
    "CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(family_id)",
    "CREATE INDEX IF NOT EXISTS idx_family_members_individual ON family_members(individual_id)",
    "CREATE INDEX IF NOT EXISTS idx_places_name ON places(name)",
    "CREATE INDEX IF NOT EXISTS idx_places_place_type ON places(place_type_id)",
    "CREATE INDEX IF NOT EXISTS idx_places_parent ON places(parent_id)",
    "CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type_id)",
    "CREATE INDEX IF NOT EXISTS idx_events_date ON events(date_sort)",
    "CREATE INDEX IF NOT EXISTS idx_events_place ON events(place_id)",
    "CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id)",
    "CREATE INDEX IF NOT EXISTS idx_event_participants_individual ON event_participants(individual_id)",
  ];

  for (const index of indexes) {
    await db.execute(index);
  }
}

async function insertDefaultEventTypes(db: Database): Promise<void> {
  const eventTypes = [
    // Individual events (display names via i18n using tag)
    { tag: "BIRT", category: "individual", sort: 1 },
    { tag: "CHR", category: "individual", sort: 2 },
    { tag: "DEAT", category: "individual", sort: 3 },
    { tag: "BURI", category: "individual", sort: 4 },
    { tag: "OCCU", category: "individual", sort: 10 },
    { tag: "RESI", category: "individual", sort: 11 },
    { tag: "EDUC", category: "individual", sort: 12 },
    { tag: "RELI", category: "individual", sort: 13 },
    { tag: "IMMI", category: "individual", sort: 14 },
    { tag: "EMIG", category: "individual", sort: 15 },
    { tag: "NATU", category: "individual", sort: 16 },
    // Family events
    { tag: "MARR", category: "family", sort: 1 },
    { tag: "MARB", category: "family", sort: 2 },
    { tag: "MARC", category: "family", sort: 3 },
    { tag: "DIV", category: "family", sort: 4 },
    { tag: "DIVF", category: "family", sort: 5 },
    { tag: "ANUL", category: "family", sort: 6 },
  ];

  for (const et of eventTypes) {
    await db.execute(
      `INSERT OR IGNORE INTO event_types (tag, category, is_system, sort_order) 
       VALUES ($1, $2, 1, $3)`,
      [et.tag, et.category, et.sort],
    );
  }
}

async function insertMetadata(db: Database): Promise<void> {
  const meta = [
    { key: "schema_version", value: "1" },
    { key: "software", value: "Vata App" },
    { key: "software_version", value: "0.1.0" },
  ];

  for (const m of meta) {
    await db.execute(
      "INSERT OR REPLACE INTO tree_meta (key, value) VALUES ($1, $2)",
      [m.key, m.value],
    );
  }
}
```

### Update src/db/connection.ts

Add schema initialization when opening a tree database:

```typescript
import { initializeTreeSchema } from "./trees/schema";

export async function openTreeDb(filename: string): Promise<Database> {
  // ... existing code ...
  
  if (!treeDb) {
    treeDb = await Database.load(`sqlite:trees/${filename}`);
    currentTreeFilename = filename;
    await initializeTreeSchema(treeDb);
  }

  return treeDb;
}
```

### Validation Criteria

- [ ] All tables created
- [ ] Indexes created
- [ ] Default event types inserted
- [ ] Metadata inserted
- [ ] Foreign key constraints work

---

## Phase 1 Deliverables

### Files Created

```
src/db/trees/
└── schema.ts
```

### Final Checklist

- [ ] Complete tree.db schema initialized
- [ ] All indexes created
- [ ] Default event types inserted
- [ ] Schema initialization called when opening tree
