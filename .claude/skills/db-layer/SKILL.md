---
name: db-layer
description: Scaffold a new DB layer file with Raw type, mapper, and CRUD functions following project conventions. Use when creating a new entity's database operations in src/db/trees/.
---

# DB Layer Scaffolding

Use this skill when creating a new entity's database layer in `src/db/trees/`.

## File Structure

Each entity needs:

- `src/db/trees/<entity>.ts` — CRUD operations
- `src/db/trees/<entity>.test.ts` — Unit tests
- Type definitions in `src/types/database.ts`

## Required Sections

Every DB layer file must follow this exact structure:

### 1. Imports

```typescript
import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import type { Entity, CreateEntityInput, UpdateEntityInput } from '$/types/database';
```

### 2. Raw Type (snake_case, matching DB columns)

```typescript
interface RawEntity {
  id: number;
  // ... all columns, snake_case
  created_at: string;
  updated_at: string;
}
```

### 3. Column List Constant

```typescript
const ENTITY_COLUMNS = 'id, name, ..., created_at, updated_at';
```

Never use `SELECT *`. Always list columns explicitly in this constant.

### 4. Mapper Function

```typescript
function mapToEntity(raw: RawEntity): Entity {
  return {
    id: formatEntityId('X', raw.id), // Use correct prefix
    // ... camelCase fields
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}
```

Entity ID prefixes: `I` (Individual), `F` (Family), `E` (Event), `P` (Place), `S` (Source), `R` (Repository).

### 5. CRUD Functions

All functions are `async`, use `getTreeDb()`, and use parameterized queries (`$1`, `$2`).

```typescript
export async function getAllEntities(): Promise<Entity[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawEntity[]>(`SELECT ${ENTITY_COLUMNS} FROM entities ORDER BY name`);
  return rows.map(mapToEntity);
}

export async function getEntityById(id: string): Promise<Entity | null> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  const rows = await db.select<RawEntity[]>(
    `SELECT ${ENTITY_COLUMNS} FROM entities WHERE id = $1`,
    [dbId]
  );
  return rows[0] ? mapToEntity(rows[0]) : null;
}

export async function createEntity(input: CreateEntityInput): Promise<string> {
  const db = await getTreeDb();
  const result = await db.execute(`INSERT INTO entities (col1, col2) VALUES ($1, $2)`, [
    input.col1,
    input.col2 ?? null,
  ]);
  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create entity: no lastInsertId returned');
  }
  return formatEntityId('X', result.lastInsertId);
}

export async function updateEntity(id: string, input: UpdateEntityInput): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  // Build SET clause dynamically from non-undefined fields
  await db.execute(`UPDATE entities SET col1 = $1 WHERE id = $2`, [input.col1, dbId]);
}

export async function deleteEntity(id: string): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  await db.execute(`DELETE FROM entities WHERE id = $1`, [dbId]);
}
```

### 6. Types (in `src/types/database.ts`)

Add these types to the existing file:

```typescript
export interface Entity {
  id: string; // Formatted: "X-0001"
  // ... camelCase fields
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityInput {
  // Required fields only, no id/timestamps
}

export interface UpdateEntityInput {
  // All fields optional via Partial-like pattern
}
```

## Test File Pattern

Use `src/test/sqlite-memory.ts` helpers. See `src/db/trees/repositories.test.ts` for a working example.

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
// Import memory DB helpers and the functions under test
```

Tests should cover: create, get by ID, get all, update, delete, and edge cases (not found, duplicate constraints).

## Checklist

Before finishing:

- [ ] No `SELECT *` anywhere
- [ ] All queries use parameterized placeholders (`$1`, `$2`)
- [ ] `Raw*` interface matches DB columns exactly (snake_case)
- [ ] Public type uses camelCase
- [ ] Entity ID prefix is correct and registered in `entityId.ts`
- [ ] `created_at` / `updated_at` are included
- [ ] Types added to `src/types/database.ts`
- [ ] Test file created with memory DB
- [ ] Also apply the [sqlite-standards](../sqlite-standards/SKILL.md) checklist
