import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import { foldDiacritics } from '../sql-diacritics';
import { SQLITE_IN_CLAUSE_LIMIT, buildInClausePlaceholders, chunkArray } from '../sql-chunk';
import type {
  Individual,
  Gender,
  CreateIndividualInput,
  UpdateIndividualInput,
} from '$types/database';

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
 * Get the individuals matching a set of IDs. Uses a chunked `IN (...)`
 * clause so the number of SQL statements is constant regardless of the
 * number of ids. The returned array is in `id` order and contains one
 * entry per row found — missing ids are silently omitted.
 */
export async function getIndividualsByIds(ids: string[]): Promise<Individual[]> {
  if (ids.length === 0) return [];
  const db = await getTreeDb();
  const dbIds = ids.map(parseEntityId);

  const rows: RawIndividual[] = [];
  for (const idsChunk of chunkArray(dbIds, SQLITE_IN_CLAUSE_LIMIT)) {
    const placeholders = buildInClausePlaceholders(idsChunk.length);
    const chunkRows = await db.select<RawIndividual[]>(
      `SELECT id, gender, is_living, notes, created_at, updated_at
       FROM individuals
       WHERE id IN (${placeholders})
       ORDER BY id`,
      idsChunk
    );
    rows.push(...chunkRows);
  }
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
 * Count individuals marked living — the GEDCOM export's privacy filter
 * excludes exactly this set when `includePrivate` is false. `is_living`
 * defaults to true for anyone without a recorded death (see
 * `lib/gedcom/importer.ts`), so this count skews high on a typical
 * imported tree — surfaced to the export UI rather than left implicit.
 */
export async function countLivingIndividuals(): Promise<number> {
  const db = await getTreeDb();
  const rows = await db.select<{ count: number }[]>(
    'SELECT COUNT(*) as count FROM individuals WHERE is_living = 1'
  );
  return rows[0]?.count ?? 0;
}

/** Filters applied to a windowed page of the People list, all AND-ed. */
export interface IndividualsPageFilters {
  /** Free-text query matched against the primary name only (given + surname); empty means no restriction. */
  nameQuery: string;
  /** Restrict to a single sex, or `'all'` for no restriction. */
  sex: Gender | 'all';
  /** Restrict by living status, or `'all'` for no restriction. */
  status: 'all' | 'living' | 'deceased';
}

/** Which primary-name field a page is ordered by. */
export type IndividualsSortColumn = 'surname' | 'firstName';

export interface IndividualsPageParams {
  filters: IndividualsPageFilters;
  sortColumn: IndividualsSortColumn;
  sortDirection: 'asc' | 'desc';
  limit: number;
  offset: number;
}

export interface IndividualsPageResult {
  /** Individual ids for this page, already in the requested sort order. */
  ids: string[];
  /** Whether a further page exists past this one. */
  hasMore: boolean;
}

/**
 * Get one windowed, filtered, sorted page of individual ids — the SQL-side
 * counterpart to the People list's filter toolbar and sortable Surname/First
 * name columns (see issue #266). Joins to each individual's primary name
 * (`is_primary = 1`) for both the name filter and the sort key; unlike the
 * pre-pagination client-side filter, alternate names are not searched or
 * sorted on.
 *
 * The sort key mirrors the pre-pagination client sort exactly. For the
 * Surname column it matches `formatName(...).sortable`'s fallback: primarily
 * by surname, falling back to given names for people who have only those,
 * and pushing entirely nameless individuals to the end regardless of
 * direction. For the First name column there is no such fallback — someone
 * with a surname but no given names sorts into the same "nameless" bucket as
 * someone with neither, exactly as the old `sortValue` did. Both the sort
 * key and the name filter are passed through {@link foldDiacritics} —
 * SQLite's `COLLATE NOCASE`/`LIKE` only fold ASCII case, so an unfolded
 * comparison would sort "Côté" after every plain-ASCII surname and miss it
 * entirely in a search for "cote".
 *
 * Enrichment (names, birth/death events) is the caller's job — this only
 * resolves which ids belong on the page, in order. Fetches `limit + 1` rows
 * to derive `hasMore` without a separate `COUNT(*)`.
 */
export async function getIndividualsPage(
  params: IndividualsPageParams
): Promise<IndividualsPageResult> {
  const { filters, sortColumn, sortDirection, limit, offset } = params;
  const db = await getTreeDb();

  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (filters.sex !== 'all') {
    conditions.push(`i.gender = $${paramIndex++}`);
    values.push(filters.sex);
  }
  if (filters.status === 'living') {
    conditions.push('i.is_living = 1');
  } else if (filters.status === 'deceased') {
    conditions.push('i.is_living = 0');
  }
  const trimmedQuery = filters.nameQuery.trim();
  if (trimmedQuery) {
    const escaped = trimmedQuery.replace(/[%_\\]/g, '\\$&');
    const namesExpr = foldDiacritics(
      `(COALESCE(n.given_names, '') || ' ' || COALESCE(n.surname, ''))`
    );
    conditions.push(`${namesExpr} LIKE ${foldDiacritics(`$${paramIndex++}`)} ESCAPE '\\'`);
    values.push(`%${escaped}%`);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const dir = sortDirection === 'desc' ? 'DESC' : 'ASC';
  const primaryKey = foldDiacritics(
    sortColumn === 'firstName'
      ? `NULLIF(TRIM(n.given_names), '')`
      : `COALESCE(NULLIF(TRIM(n.surname), ''), NULLIF(TRIM(n.given_names), ''))`
  );
  const tiebreaker = foldDiacritics(sortColumn === 'firstName' ? 'n.surname' : 'n.given_names');

  const rows = await db.select<{ id: number }[]>(
    `SELECT i.id
     FROM individuals i
     LEFT JOIN names n ON n.individual_id = i.id AND n.is_primary = 1
     ${where}
     ORDER BY ${primaryKey} COLLATE NOCASE ${dir} NULLS LAST,
              ${tiebreaker} COLLATE NOCASE ${dir},
              i.id ${dir}
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    [...values, limit + 1, offset]
  );

  const hasMore = rows.length > limit;
  return {
    ids: rows.slice(0, limit).map((row) => formatEntityId('I', row.id)),
    hasMore,
  };
}

/**
 * Search individuals by name (requires names table join)
 * Note: This searches across given_names and surname in the names table
 */
export async function searchIndividuals(query: string): Promise<Individual[]> {
  const db = await getTreeDb();
  const escaped = query.replace(/[%_\\]/g, '\\$&');
  const searchPattern = `%${escaped}%`;
  const rows = await db.select<RawIndividual[]>(
    `SELECT DISTINCT i.id, i.gender, i.is_living, i.notes, i.created_at, i.updated_at
     FROM individuals i
     JOIN names n ON n.individual_id = i.id
     WHERE n.given_names LIKE $1 ESCAPE '\\' OR n.surname LIKE $2 ESCAPE '\\'
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
