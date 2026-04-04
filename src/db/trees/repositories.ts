import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import type {
  Repository,
  CreateRepositoryInput,
  UpdateRepositoryInput,
} from '$/types/database';

// =============================================================================
// Raw database row type (snake_case as in SQLite)
// =============================================================================

interface RawRepository {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Column list
// =============================================================================

const REPO_COLUMNS =
  'id, name, address, city, country, phone, email, website, notes, created_at, updated_at';

// =============================================================================
// Mapping function
// =============================================================================

function mapToRepository(raw: RawRepository): Repository {
  return {
    id: formatEntityId('R', raw.id),
    name: raw.name,
    address: raw.address,
    city: raw.city,
    country: raw.country,
    phone: raw.phone,
    email: raw.email,
    website: raw.website,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Get all repositories ordered by name
 */
export async function getAllRepositories(): Promise<Repository[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawRepository[]>(
    `SELECT ${REPO_COLUMNS} FROM repositories ORDER BY name`
  );
  return rows.map(mapToRepository);
}

/**
 * Get a repository by ID
 */
export async function getRepositoryById(id: string): Promise<Repository | null> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  const rows = await db.select<RawRepository[]>(
    `SELECT ${REPO_COLUMNS} FROM repositories WHERE id = $1`,
    [dbId]
  );
  return rows[0] ? mapToRepository(rows[0]) : null;
}

/**
 * Create a new repository
 * @returns The formatted ID of the created repository (e.g., "R-0001")
 */
export async function createRepository(input: CreateRepositoryInput): Promise<string> {
  const db = await getTreeDb();
  const result = await db.execute(
    `INSERT INTO repositories (name, address, city, country, phone, email, website, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      input.name,
      input.address ?? null,
      input.city ?? null,
      input.country ?? null,
      input.phone ?? null,
      input.email ?? null,
      input.website ?? null,
      input.notes ?? null,
    ]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create repository: no lastInsertId returned');
  }

  return formatEntityId('R', result.lastInsertId);
}

/**
 * Update a repository
 */
export async function updateRepository(id: string, input: UpdateRepositoryInput): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);

  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    sets.push(`name = $${paramIndex++}`);
    params.push(input.name);
  }
  if (input.address !== undefined) {
    sets.push(`address = $${paramIndex++}`);
    params.push(input.address);
  }
  if (input.city !== undefined) {
    sets.push(`city = $${paramIndex++}`);
    params.push(input.city);
  }
  if (input.country !== undefined) {
    sets.push(`country = $${paramIndex++}`);
    params.push(input.country);
  }
  if (input.phone !== undefined) {
    sets.push(`phone = $${paramIndex++}`);
    params.push(input.phone);
  }
  if (input.email !== undefined) {
    sets.push(`email = $${paramIndex++}`);
    params.push(input.email);
  }
  if (input.website !== undefined) {
    sets.push(`website = $${paramIndex++}`);
    params.push(input.website);
  }
  if (input.notes !== undefined) {
    sets.push(`notes = $${paramIndex++}`);
    params.push(input.notes);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = datetime('now')`);
  params.push(dbId);

  await db.execute(`UPDATE repositories SET ${sets.join(', ')} WHERE id = $${paramIndex}`, params);
}

/**
 * Delete a repository
 */
export async function deleteRepository(id: string): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  await db.execute('DELETE FROM repositories WHERE id = $1', [dbId]);
}

/**
 * Search repositories by name
 */
export async function searchRepositories(query: string): Promise<Repository[]> {
  const db = await getTreeDb();
  const escaped = query.replace(/[%_\\]/g, '\\$&');
  const searchPattern = `%${escaped}%`;
  const rows = await db.select<RawRepository[]>(
    `SELECT ${REPO_COLUMNS} FROM repositories WHERE name LIKE $1 ESCAPE '\\' ORDER BY name`,
    [searchPattern]
  );
  return rows.map(mapToRepository);
}

/**
 * Count total repositories
 */
export async function countRepositories(): Promise<number> {
  const db = await getTreeDb();
  const rows = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM repositories');
  return rows[0]?.count ?? 0;
}
