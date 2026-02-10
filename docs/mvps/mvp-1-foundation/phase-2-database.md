# Phase 2: Database

## Objective

Set up database connection management, initialize the system database schema, and implement tree CRUD operations.

## Step 2.1: Database Layer - Connection

### src/db/connection.ts

```typescript
import Database from "@tauri-apps/plugin-sql";

let systemDb: Database | null = null;
let treeDb: Database | null = null;
let currentTreeFilename: string | null = null;

/**
 * Get the system database connection
 * Creates it if it doesn't exist
 */
export async function getSystemDb(): Promise<Database> {
  if (!systemDb) {
    systemDb = await Database.load("sqlite:system.db");
    await initializeSystemDb(systemDb);
  }
  return systemDb;
}

/**
 * Open a tree database
 * Closes any previously open tree database
 */
export async function openTreeDb(filename: string): Promise<Database> {
  if (treeDb && currentTreeFilename !== filename) {
    await treeDb.close();
    treeDb = null;
  }

  if (!treeDb) {
    treeDb = await Database.load(`sqlite:trees/${filename}`);
    currentTreeFilename = filename;
  }

  return treeDb;
}

/**
 * Get the currently open tree database
 * Throws if no tree is open
 */
export async function getTreeDb(): Promise<Database> {
  if (!treeDb) {
    throw new Error("No tree database is currently open");
  }
  return treeDb;
}

/**
 * Close the current tree database
 */
export async function closeTreeDb(): Promise<void> {
  if (treeDb) {
    await treeDb.close();
    treeDb = null;
    currentTreeFilename = null;
  }
}

/**
 * Check if a tree database is currently open
 */
export function isTreeDbOpen(): boolean {
  return treeDb !== null;
}

/**
 * Get the filename of the currently open tree
 */
export function getCurrentTreeFilename(): string | null {
  return currentTreeFilename;
}

/**
 * Initialize the system database schema
 */
async function initializeSystemDb(db: Database): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS trees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      filename TEXT NOT NULL UNIQUE,
      description TEXT,
      individual_count INTEGER DEFAULT 0,
      family_count INTEGER DEFAULT 0,
      last_opened_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_trees_last_opened 
    ON trees(last_opened_at DESC)
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}
```

### Validation Criteria

- [ ] Connection to system.db works
- [ ] Schema created automatically
- [ ] Multi-tree management works

---

## Step 2.2: Database Layer - System

### src/db/system/trees.ts

```typescript
import { getSystemDb } from "../connection";
import type { Tree } from "$/types/database";

interface RawTree {
  id: number;
  name: string;
  filename: string;
  description: string | null;
  individual_count: number;
  family_count: number;
  last_opened_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Convert raw database row to Tree type
 */
function mapToTree(raw: RawTree): Tree {
  return {
    id: String(raw.id),
    name: raw.name,
    filename: raw.filename,
    description: raw.description,
    individualCount: raw.individual_count,
    familyCount: raw.family_count,
    lastOpenedAt: raw.last_opened_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Get all trees
 */
export async function getAllTrees(): Promise<Tree[]> {
  const db = await getSystemDb();
  const rows = await db.select<RawTree[]>(
    "SELECT * FROM trees ORDER BY last_opened_at DESC NULLS LAST, created_at DESC",
  );
  return rows.map(mapToTree);
}

/**
 * Get a tree by ID
 */
export async function getTreeById(id: string): Promise<Tree | null> {
  const db = await getSystemDb();
  const rows = await db.select<RawTree[]>("SELECT * FROM trees WHERE id = $1", [
    parseInt(id),
  ]);
  return rows[0] ? mapToTree(rows[0]) : null;
}

/**
 * Create a new tree
 */
export async function createTree(data: {
  name: string;
  filename: string;
  description?: string;
}): Promise<string> {
  const db = await getSystemDb();
  const result = await db.execute(
    `INSERT INTO trees (name, filename, description) 
     VALUES ($1, $2, $3)`,
    [data.name, data.filename, data.description || null],
  );
  return String(result.lastInsertId);
}

/**
 * Update a tree
 */
export async function updateTree(
  id: string,
  data: { name?: string; description?: string },
): Promise<void> {
  const db = await getSystemDb();
  const sets: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    sets.push(`name = $${paramIndex++}`);
    params.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push(`description = $${paramIndex++}`);
    params.push(data.description);
  }

  sets.push(`updated_at = datetime('now')`);
  params.push(parseInt(id));

  await db.execute(
    `UPDATE trees SET ${sets.join(", ")} WHERE id = $${paramIndex}`,
    params,
  );
}

/**
 * Delete a tree
 */
export async function deleteTree(id: string): Promise<void> {
  const db = await getSystemDb();
  await db.execute("DELETE FROM trees WHERE id = $1", [parseInt(id)]);
}

/**
 * Update tree stats
 */
export async function updateTreeStats(
  id: string,
  stats: { individualCount?: number; familyCount?: number },
): Promise<void> {
  const db = await getSystemDb();
  const sets: string[] = [];
  const params: number[] = [];
  let paramIndex = 1;

  if (stats.individualCount !== undefined) {
    sets.push(`individual_count = $${paramIndex++}`);
    params.push(stats.individualCount);
  }
  if (stats.familyCount !== undefined) {
    sets.push(`family_count = $${paramIndex++}`);
    params.push(stats.familyCount);
  }

  sets.push(`updated_at = datetime('now')`);
  params.push(parseInt(id));

  await db.execute(
    `UPDATE trees SET ${sets.join(", ")} WHERE id = $${paramIndex}`,
    params,
  );
}

/**
 * Mark tree as opened
 */
export async function markTreeOpened(id: string): Promise<void> {
  const db = await getSystemDb();
  await db.execute(
    `UPDATE trees SET last_opened_at = datetime('now'), updated_at = datetime('now') 
     WHERE id = $1`,
    [parseInt(id)],
  );
}
```

### Validation Criteria

- [ ] CRUD trees works
- [ ] ID string/int conversion OK
- [ ] Stats update works

---

## Phase 2 Deliverables

### Files Created

```
src/db/
├── connection.ts
└── system/
    └── trees.ts
```

### Final Checklist

- [ ] Database connection management works
- [ ] system.db schema created automatically
- [ ] Tree CRUD operations functional
- [ ] ID conversion (string ↔ integer) works correctly
- [ ] Tree stats update works
