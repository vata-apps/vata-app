import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import type {
  Individual,
  Gender,
  CreateIndividualInput,
  UpdateIndividualInput,
} from '$/types/database';

// =============================================================================
// Raw database row type (snake_case as in SQLite)
// =============================================================================

interface RawIndividual {
  id: number;
  gender: Gender;
  is_living: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Mapping function
// =============================================================================

function mapToIndividual(raw: RawIndividual): Individual {
  return {
    id: formatEntityId('I', raw.id),
    gender: raw.gender,
    isLiving: raw.is_living === 1,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Get all individuals ordered by ID
 */
export async function getAllIndividuals(): Promise<Individual[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawIndividual[]>(
    'SELECT id, gender, is_living, notes, created_at, updated_at FROM individuals ORDER BY id'
  );
  return rows.map(mapToIndividual);
}

/**
 * Get an individual by ID
 */
export async function getIndividualById(id: string): Promise<Individual | null> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  const rows = await db.select<RawIndividual[]>(
    'SELECT id, gender, is_living, notes, created_at, updated_at FROM individuals WHERE id = $1',
    [dbId]
  );
  return rows[0] ? mapToIndividual(rows[0]) : null;
}

/**
 * Create a new individual
 * @returns The formatted ID of the created individual (e.g., "I-0001")
 */
export async function createIndividual(input: CreateIndividualInput): Promise<string> {
  const db = await getTreeDb();
  const result = await db.execute(
    `INSERT INTO individuals (gender, is_living, notes)
     VALUES ($1, $2, $3)`,
    [input.gender ?? 'U', input.isLiving !== false ? 1 : 0, input.notes ?? null]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create individual: no lastInsertId returned');
  }

  return formatEntityId('I', result.lastInsertId);
}

/**
 * Update an individual
 */
export async function updateIndividual(id: string, input: UpdateIndividualInput): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);

  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  let paramIndex = 1;

  if (input.gender !== undefined) {
    sets.push(`gender = $${paramIndex++}`);
    params.push(input.gender);
  }
  if (input.isLiving !== undefined) {
    sets.push(`is_living = $${paramIndex++}`);
    params.push(input.isLiving ? 1 : 0);
  }
  if (input.notes !== undefined) {
    sets.push(`notes = $${paramIndex++}`);
    params.push(input.notes);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = datetime('now')`);
  params.push(dbId);

  await db.execute(`UPDATE individuals SET ${sets.join(', ')} WHERE id = $${paramIndex}`, params);
}

/**
 * Delete an individual
 */
export async function deleteIndividual(id: string): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  await db.execute('DELETE FROM individuals WHERE id = $1', [dbId]);
}

/**
 * Count total individuals
 */
export async function countIndividuals(): Promise<number> {
  const db = await getTreeDb();
  const rows = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM individuals');
  return rows[0]?.count ?? 0;
}

/**
 * Search individuals by name (requires names table join)
 * Note: This searches across given_names and surname in the names table
 */
export async function searchIndividuals(query: string): Promise<Individual[]> {
  const db = await getTreeDb();
  const searchPattern = `%${query}%`;
  const rows = await db.select<RawIndividual[]>(
    `SELECT DISTINCT i.id, i.gender, i.is_living, i.notes, i.created_at, i.updated_at
     FROM individuals i
     JOIN names n ON n.individual_id = i.id
     WHERE n.given_names LIKE $1 OR n.surname LIKE $2
     ORDER BY i.id`,
    [searchPattern, searchPattern]
  );
  return rows.map(mapToIndividual);
}

/**
 * Count families for an individual (as spouse or child)
 */
export async function countFamiliesForIndividual(id: string): Promise<number> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  const rows = await db.select<{ count: number }[]>(
    'SELECT COUNT(*) as count FROM family_members WHERE individual_id = $1',
    [dbId]
  );
  return rows[0]?.count ?? 0;
}
