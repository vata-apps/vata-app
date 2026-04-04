import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import type { Source, CreateSourceInput, UpdateSourceInput } from '$/types/database';

// =============================================================================
// Raw database row type (snake_case as in SQLite)
// =============================================================================

interface RawSource {
  id: number;
  repository_id: number | null;
  title: string;
  author: string | null;
  publisher: string | null;
  publication_date: string | null;
  call_number: string | null;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Mapping function
// =============================================================================

function mapToSource(raw: RawSource): Source {
  return {
    id: formatEntityId('S', raw.id),
    repositoryId: raw.repository_id !== null ? formatEntityId('R', raw.repository_id) : null,
    title: raw.title,
    author: raw.author,
    publisher: raw.publisher,
    publicationDate: raw.publication_date,
    callNumber: raw.call_number,
    url: raw.url,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// =============================================================================
// Column list
// =============================================================================

const COLUMNS =
  'id, repository_id, title, author, publisher, publication_date, call_number, url, notes, created_at, updated_at';

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Get all sources ordered by title
 */
export async function getAllSources(): Promise<Source[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawSource[]>(
    `SELECT ${COLUMNS} FROM sources ORDER BY title`
  );
  return rows.map(mapToSource);
}

/**
 * Get a source by ID
 */
export async function getSourceById(id: string): Promise<Source | null> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  const rows = await db.select<RawSource[]>(
    `SELECT ${COLUMNS} FROM sources WHERE id = $1`,
    [dbId]
  );
  return rows[0] ? mapToSource(rows[0]) : null;
}

/**
 * Create a new source
 * @returns The formatted ID of the created source (e.g., "S-0001")
 */
export async function createSource(input: CreateSourceInput): Promise<string> {
  const db = await getTreeDb();
  const result = await db.execute(
    `INSERT INTO sources (repository_id, title, author, publisher, publication_date, call_number, url, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      input.repositoryId ? parseEntityId(input.repositoryId) : null,
      input.title,
      input.author ?? null,
      input.publisher ?? null,
      input.publicationDate ?? null,
      input.callNumber ?? null,
      input.url ?? null,
      input.notes ?? null,
    ]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create source: no lastInsertId returned');
  }

  return formatEntityId('S', result.lastInsertId);
}

/**
 * Update a source
 */
export async function updateSource(id: string, input: UpdateSourceInput): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);

  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  let paramIndex = 1;

  if (input.repositoryId !== undefined) {
    sets.push(`repository_id = $${paramIndex++}`);
    params.push(input.repositoryId ? parseEntityId(input.repositoryId) : null);
  }
  if (input.title !== undefined) {
    sets.push(`title = $${paramIndex++}`);
    params.push(input.title);
  }
  if (input.author !== undefined) {
    sets.push(`author = $${paramIndex++}`);
    params.push(input.author);
  }
  if (input.publisher !== undefined) {
    sets.push(`publisher = $${paramIndex++}`);
    params.push(input.publisher);
  }
  if (input.publicationDate !== undefined) {
    sets.push(`publication_date = $${paramIndex++}`);
    params.push(input.publicationDate);
  }
  if (input.callNumber !== undefined) {
    sets.push(`call_number = $${paramIndex++}`);
    params.push(input.callNumber);
  }
  if (input.url !== undefined) {
    sets.push(`url = $${paramIndex++}`);
    params.push(input.url);
  }
  if (input.notes !== undefined) {
    sets.push(`notes = $${paramIndex++}`);
    params.push(input.notes);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = datetime('now')`);
  params.push(dbId);

  await db.execute(`UPDATE sources SET ${sets.join(', ')} WHERE id = $${paramIndex}`, params);
}

/**
 * Delete a source
 */
export async function deleteSource(id: string): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  await db.execute('DELETE FROM sources WHERE id = $1', [dbId]);
}

/**
 * Search sources by title or author
 */
export async function searchSources(query: string): Promise<Source[]> {
  const db = await getTreeDb();
  const escaped = query.replace(/[%_\\]/g, '\\$&');
  const searchPattern = `%${escaped}%`;
  const rows = await db.select<RawSource[]>(
    `SELECT ${COLUMNS} FROM sources
     WHERE title LIKE $1 ESCAPE '\\' OR author LIKE $2 ESCAPE '\\'
     ORDER BY title`,
    [searchPattern, searchPattern]
  );
  return rows.map(mapToSource);
}

/**
 * Get all sources for a given repository
 */
export async function getSourcesByRepositoryId(repositoryId: string): Promise<Source[]> {
  const db = await getTreeDb();
  const dbId = parseEntityId(repositoryId);
  const rows = await db.select<RawSource[]>(
    `SELECT ${COLUMNS} FROM sources WHERE repository_id = $1 ORDER BY title`,
    [dbId]
  );
  return rows.map(mapToSource);
}

/**
 * Count total sources
 */
export async function countSources(): Promise<number> {
  const db = await getTreeDb();
  const rows = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM sources');
  return rows[0]?.count ?? 0;
}
