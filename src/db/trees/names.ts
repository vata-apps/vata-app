import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import type {
  Name,
  NameType,
  CreateNameInput,
  UpdateNameInput,
  NameDisplay,
} from '$/types/database';

// =============================================================================
// Raw database row type (snake_case as in SQLite)
// =============================================================================

interface RawName {
  id: number;
  individual_id: number;
  type: NameType;
  prefix: string | null;
  given_names: string | null;
  surname: string | null;
  suffix: string | null;
  nickname: string | null;
  is_primary: number;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Mapping function
// =============================================================================

function mapToName(raw: RawName): Name {
  return {
    id: String(raw.id),
    individualId: formatEntityId('I', raw.individual_id),
    type: raw.type,
    prefix: raw.prefix,
    givenNames: raw.given_names,
    surname: raw.surname,
    suffix: raw.suffix,
    nickname: raw.nickname,
    isPrimary: raw.is_primary === 1,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Get all names for an individual
 */
export async function getNamesByIndividualId(individualId: string): Promise<Name[]> {
  const db = await getTreeDb();
  const dbId = parseEntityId(individualId);
  const rows = await db.select<RawName[]>(
    `SELECT id, individual_id, type, prefix, given_names, surname, suffix, nickname, is_primary, created_at, updated_at
     FROM names
     WHERE individual_id = $1
     ORDER BY is_primary DESC, id`,
    [dbId]
  );
  return rows.map(mapToName);
}

/**
 * Get the primary name for every individual in the tree.
 * Single query — safe to use for batch loading list views.
 * Only returns rows where `is_primary = 1`. Individuals without a primary
 * name are simply absent from the result set.
 */
export async function getAllPrimaryNames(): Promise<Name[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawName[]>(
    `SELECT id, individual_id, type, prefix, given_names, surname, suffix, nickname, is_primary, created_at, updated_at
     FROM names
     WHERE is_primary = 1
     ORDER BY individual_id`
  );
  return rows.map(mapToName);
}

/**
 * Get every name in the tree, ordered by individual and with primary names first.
 * Single query — safe to use for batch loading list views.
 */
export async function getAllNames(): Promise<Name[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawName[]>(
    `SELECT id, individual_id, type, prefix, given_names, surname, suffix, nickname, is_primary, created_at, updated_at
     FROM names
     ORDER BY individual_id, is_primary DESC, id`
  );
  return rows.map(mapToName);
}

/**
 * Get the primary name for an individual
 */
export async function getPrimaryName(individualId: string): Promise<Name | null> {
  const db = await getTreeDb();
  const dbId = parseEntityId(individualId);
  const rows = await db.select<RawName[]>(
    `SELECT id, individual_id, type, prefix, given_names, surname, suffix, nickname, is_primary, created_at, updated_at
     FROM names
     WHERE individual_id = $1 AND is_primary = 1
     LIMIT 1`,
    [dbId]
  );

  if (rows.length > 0) {
    return mapToName(rows[0]);
  }

  // Fall back to first name if no primary is set
  const fallbackRows = await db.select<RawName[]>(
    `SELECT id, individual_id, type, prefix, given_names, surname, suffix, nickname, is_primary, created_at, updated_at
     FROM names
     WHERE individual_id = $1
     ORDER BY id
     LIMIT 1`,
    [dbId]
  );

  return fallbackRows[0] ? mapToName(fallbackRows[0]) : null;
}

/**
 * Get a name by ID
 */
export async function getNameById(id: string): Promise<Name | null> {
  const db = await getTreeDb();
  const rows = await db.select<RawName[]>(
    `SELECT id, individual_id, type, prefix, given_names, surname, suffix, nickname, is_primary, created_at, updated_at
     FROM names
     WHERE id = $1`,
    [parseInt(id, 10)]
  );
  return rows[0] ? mapToName(rows[0]) : null;
}

/**
 * Create a new name for an individual
 * @returns The ID of the created name
 */
export async function createName(input: CreateNameInput): Promise<string> {
  const db = await getTreeDb();
  const individualDbId = parseEntityId(input.individualId);

  if (input.isPrimary) {
    await db.execute('BEGIN TRANSACTION');
    try {
      await db.execute('UPDATE names SET is_primary = 0 WHERE individual_id = $1', [
        individualDbId,
      ]);

      const result = await db.execute(
        `INSERT INTO names (individual_id, type, prefix, given_names, surname, suffix, nickname, is_primary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          individualDbId,
          input.type ?? 'birth',
          input.prefix ?? null,
          input.givenNames ?? null,
          input.surname ?? null,
          input.suffix ?? null,
          input.nickname ?? null,
          1,
        ]
      );

      if (result.lastInsertId === undefined) {
        throw new Error('Failed to create name: no lastInsertId returned');
      }

      await db.execute('COMMIT');
      return String(result.lastInsertId);
    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }
  }

  const result = await db.execute(
    `INSERT INTO names (individual_id, type, prefix, given_names, surname, suffix, nickname, is_primary)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      individualDbId,
      input.type ?? 'birth',
      input.prefix ?? null,
      input.givenNames ?? null,
      input.surname ?? null,
      input.suffix ?? null,
      input.nickname ?? null,
      0,
    ]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create name: no lastInsertId returned');
  }

  return String(result.lastInsertId);
}

/**
 * Update a name
 */
export async function updateName(id: string, input: UpdateNameInput): Promise<void> {
  const db = await getTreeDb();
  const nameId = parseInt(id, 10);

  const buildUpdate = () => {
    const sets: string[] = [];
    const params: (string | number | null)[] = [];
    let paramIndex = 1;

    if (input.type !== undefined) {
      sets.push(`type = $${paramIndex++}`);
      params.push(input.type);
    }
    if (input.prefix !== undefined) {
      sets.push(`prefix = $${paramIndex++}`);
      params.push(input.prefix);
    }
    if (input.givenNames !== undefined) {
      sets.push(`given_names = $${paramIndex++}`);
      params.push(input.givenNames);
    }
    if (input.surname !== undefined) {
      sets.push(`surname = $${paramIndex++}`);
      params.push(input.surname);
    }
    if (input.suffix !== undefined) {
      sets.push(`suffix = $${paramIndex++}`);
      params.push(input.suffix);
    }
    if (input.nickname !== undefined) {
      sets.push(`nickname = $${paramIndex++}`);
      params.push(input.nickname);
    }
    if (input.isPrimary !== undefined) {
      sets.push(`is_primary = $${paramIndex++}`);
      params.push(input.isPrimary ? 1 : 0);
    }

    return { sets, params, paramIndex };
  };

  const { sets, params, paramIndex } = buildUpdate();
  if (sets.length === 0) return;

  sets.push(`updated_at = datetime('now')`);
  params.push(nameId);

  if (input.isPrimary) {
    const existingName = await getNameById(id);
    if (existingName) {
      const individualDbId = parseEntityId(existingName.individualId);
      await db.execute('BEGIN TRANSACTION');
      try {
        await db.execute('UPDATE names SET is_primary = 0 WHERE individual_id = $1', [
          individualDbId,
        ]);
        await db.execute(`UPDATE names SET ${sets.join(', ')} WHERE id = $${paramIndex}`, params);
        await db.execute('COMMIT');
      } catch (error) {
        await db.execute('ROLLBACK');
        throw error;
      }
      return;
    }
  }

  await db.execute(`UPDATE names SET ${sets.join(', ')} WHERE id = $${paramIndex}`, params);
}

/**
 * Delete a name
 */
export async function deleteName(id: string): Promise<void> {
  const db = await getTreeDb();
  await db.execute('DELETE FROM names WHERE id = $1', [parseInt(id, 10)]);
}

/**
 * Set a name as the primary name for an individual
 * Unsets any other primary names for the same individual
 */
export async function setPrimaryName(individualId: string, nameId: string): Promise<void> {
  const db = await getTreeDb();
  const individualDbId = parseEntityId(individualId);
  const nameDbId = parseInt(nameId, 10);

  // Begin transaction
  await db.execute('BEGIN TRANSACTION');

  try {
    // Unset all primary names for this individual
    await db.execute('UPDATE names SET is_primary = 0 WHERE individual_id = $1', [individualDbId]);

    // Set the specified name as primary
    await db.execute(
      "UPDATE names SET is_primary = 1, updated_at = datetime('now') WHERE id = $1",
      [nameDbId]
    );

    await db.execute('COMMIT');
  } catch (error) {
    await db.execute('ROLLBACK');
    throw error;
  }
}

/**
 * Count names for an individual
 */
export async function countNamesForIndividual(individualId: string): Promise<number> {
  const db = await getTreeDb();
  const dbId = parseEntityId(individualId);
  const rows = await db.select<{ count: number }[]>(
    'SELECT COUNT(*) as count FROM names WHERE individual_id = $1',
    [dbId]
  );
  return rows[0]?.count ?? 0;
}

// =============================================================================
// Formatting Functions
// =============================================================================

/**
 * Format a name for display
 * Returns full, short, and sortable versions
 */
export function formatName(name: Name | null): NameDisplay {
  if (!name) {
    return {
      full: '(Unknown)',
      short: '(Unknown)',
      sortable: '',
    };
  }

  const { prefix, givenNames, surname, suffix, nickname } = name;

  // Build parts arrays
  const fullParts: string[] = [];
  if (prefix) fullParts.push(prefix);
  if (givenNames) fullParts.push(givenNames);
  if (surname) fullParts.push(surname);
  if (suffix) fullParts.push(suffix);

  const shortParts: string[] = [];
  if (givenNames) {
    // Use only the first given name for short version
    const firstGiven = givenNames.split(' ')[0];
    shortParts.push(firstGiven);
  }
  if (surname) shortParts.push(surname);

  // Sortable: "Surname, Given Names" format
  const sortableParts: string[] = [];
  if (surname) sortableParts.push(surname);
  if (givenNames) {
    if (surname) {
      sortableParts.push(', ');
      sortableParts.push(givenNames);
    } else {
      sortableParts.push(givenNames);
    }
  }

  const full = fullParts.length > 0 ? fullParts.join(' ') : (nickname ?? '(Unknown)');
  const short = shortParts.length > 0 ? shortParts.join(' ') : (nickname ?? '(Unknown)');
  const sortable = sortableParts.join('');

  return { full, short, sortable };
}

/**
 * Format a name as a simple display string
 * Convenience function for common use case
 */
export function formatNameSimple(name: Name | null): string {
  return formatName(name).short;
}
