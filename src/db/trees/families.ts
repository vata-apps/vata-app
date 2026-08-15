import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import { SQLITE_IN_CLAUSE_LIMIT, buildInClausePlaceholders, chunkArray } from '../sql-chunk';
import type {
  Family,
  CreateFamilyInput,
  UpdateFamilyInput,
  FamilyMember,
  CreateFamilyMemberInput,
  FamilyRole,
  Pedigree,
  RelationNature,
  RelationCertainty,
  UpdateFamilyMemberDetailsInput,
  FamilyWithMembers,
  IndividualWithDetails,
} from '$types/database';
import { getIndividualById } from './individuals';
import { getPrimaryName, getNamesByIndividualId } from './names';

// =============================================================================
// Raw database row types (snake_case as in SQLite)
// =============================================================================

interface RawFamily {
  id: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface RawFamilyMember {
  id: number;
  family_id: number;
  individual_id: number;
  role: FamilyRole;
  pedigree: Pedigree | null;
  nature: RelationNature | null;
  certainty: RelationCertainty | null;
  note: string | null;
  sort_order: number;
  created_at: string;
}

// =============================================================================
// Mapping functions
// =============================================================================

function mapToFamily(raw: RawFamily): Family {
  return {
    id: formatEntityId('F', raw.id),
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapToFamilyMember(raw: RawFamilyMember): FamilyMember {
  return {
    id: String(raw.id),
    familyId: formatEntityId('F', raw.family_id),
    individualId: formatEntityId('I', raw.individual_id),
    role: raw.role,
    pedigree: raw.pedigree,
    nature: raw.nature,
    certainty: raw.certainty,
    note: raw.note,
    sortOrder: raw.sort_order,
    createdAt: raw.created_at,
  };
}

// =============================================================================
// Family CRUD Operations
// =============================================================================

/**
 * Get all families ordered by ID
 */
export async function getAllFamilies(): Promise<Family[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawFamily[]>(
    'SELECT id, notes, created_at, updated_at FROM families ORDER BY id'
  );
  return rows.map(mapToFamily);
}

/**
 * Get a family by ID
 */
export async function getFamilyById(id: string): Promise<Family | null> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  const rows = await db.select<RawFamily[]>(
    'SELECT id, notes, created_at, updated_at FROM families WHERE id = $1',
    [dbId]
  );
  return rows[0] ? mapToFamily(rows[0]) : null;
}

/**
 * Get the families matching a set of IDs. Uses a chunked `IN (...)` clause
 * so the number of SQL statements is constant regardless of the number of
 * ids. Mirrors `getIndividualsByIds`: the returned array is in `id` order
 * and missing ids are silently omitted.
 */
export async function getFamiliesByIds(ids: string[]): Promise<Family[]> {
  if (ids.length === 0) return [];
  const db = await getTreeDb();
  const dbIds = ids.map(parseEntityId);

  const rows: RawFamily[] = [];
  for (const idsChunk of chunkArray(dbIds, SQLITE_IN_CLAUSE_LIMIT)) {
    const placeholders = buildInClausePlaceholders(idsChunk.length);
    const chunkRows = await db.select<RawFamily[]>(
      `SELECT id, notes, created_at, updated_at
       FROM families
       WHERE id IN (${placeholders})
       ORDER BY id`,
      idsChunk
    );
    rows.push(...chunkRows);
  }
  return rows.map(mapToFamily);
}

/**
 * Create a new family
 * @returns The formatted ID of the created family (e.g., "F-0001")
 */
export async function createFamily(input: CreateFamilyInput): Promise<string> {
  const db = await getTreeDb();
  const result = await db.execute('INSERT INTO families (notes) VALUES ($1)', [
    input.notes ?? null,
  ]);

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create family: no lastInsertId returned');
  }

  return formatEntityId('F', result.lastInsertId);
}

/**
 * Update a family
 */
export async function updateFamily(id: string, input: UpdateFamilyInput): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);

  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  let paramIndex = 1;

  if (input.notes !== undefined) {
    sets.push(`notes = $${paramIndex++}`);
    params.push(input.notes);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = datetime('now')`);
  params.push(dbId);

  await db.execute(`UPDATE families SET ${sets.join(', ')} WHERE id = $${paramIndex}`, params);
}

/**
 * Delete a family
 * Note: This will cascade delete all family_members for this family
 */
export async function deleteFamily(id: string): Promise<void> {
  const db = await getTreeDb();
  const dbId = parseEntityId(id);
  await db.execute('DELETE FROM families WHERE id = $1', [dbId]);
}

/**
 * Count total families
 */
export async function countFamilies(): Promise<number> {
  const db = await getTreeDb();
  const rows = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM families');
  return rows[0]?.count ?? 0;
}

// =============================================================================
// Family Member Operations
// =============================================================================

/**
 * Get every family_member row in the tree.
 * Single query — safe to use for batch loading list views.
 * Results are ordered by family, then role (husband, wife, child), then sort_order.
 */
export async function getAllFamilyMembers(): Promise<FamilyMember[]> {
  const db = await getTreeDb();
  const rows = await db.select<RawFamilyMember[]>(
    `SELECT id, family_id, individual_id, role, pedigree, nature, certainty, note, sort_order, created_at
     FROM family_members
     ORDER BY
       family_id,
       CASE role
         WHEN 'husband' THEN 1
         WHEN 'wife' THEN 2
         WHEN 'child' THEN 3
       END,
       sort_order,
       id`
  );
  return rows.map(mapToFamilyMember);
}

/**
 * Get every family_member row for a specific set of families, in the same
 * order as `getAllFamilyMembers`. Mirrors the `...ForIndividuals` bulk
 * pattern used elsewhere (e.g. `getPrimaryNamesForIndividuals`), chunked so
 * the number of SQL statements stays constant regardless of family count.
 */
export async function getFamilyMembersForFamilies(familyIds: string[]): Promise<FamilyMember[]> {
  if (familyIds.length === 0) return [];
  const db = await getTreeDb();
  const dbIds = familyIds.map(parseEntityId);

  const rows: RawFamilyMember[] = [];
  for (const idsChunk of chunkArray(dbIds, SQLITE_IN_CLAUSE_LIMIT)) {
    const placeholders = buildInClausePlaceholders(idsChunk.length);
    const chunkRows = await db.select<RawFamilyMember[]>(
      `SELECT id, family_id, individual_id, role, pedigree, nature, certainty, note, sort_order, created_at
       FROM family_members
       WHERE family_id IN (${placeholders})
       ORDER BY
         family_id,
         CASE role
           WHEN 'husband' THEN 1
           WHEN 'wife' THEN 2
           WHEN 'child' THEN 3
         END,
         sort_order,
         id`,
      idsChunk
    );
    rows.push(...chunkRows);
  }
  return rows.map(mapToFamilyMember);
}

/**
 * Get all members of a family
 */
export async function getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
  const db = await getTreeDb();
  const dbId = parseEntityId(familyId);
  const rows = await db.select<RawFamilyMember[]>(
    `SELECT id, family_id, individual_id, role, pedigree, nature, certainty, note, sort_order, created_at
     FROM family_members
     WHERE family_id = $1
     ORDER BY 
       CASE role 
         WHEN 'husband' THEN 1 
         WHEN 'wife' THEN 2 
         WHEN 'child' THEN 3 
       END,
       sort_order,
       id`,
    [dbId]
  );
  return rows.map(mapToFamilyMember);
}

/**
 * Add a member to a family
 * @returns The ID of the created family_member record
 */
export async function addFamilyMember(input: CreateFamilyMemberInput): Promise<string> {
  const db = await getTreeDb();
  const familyDbId = parseEntityId(input.familyId);
  const individualDbId = parseEntityId(input.individualId);

  const result = await db.execute(
    `INSERT INTO family_members (family_id, individual_id, role, pedigree, nature, certainty, note, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      familyDbId,
      individualDbId,
      input.role,
      input.pedigree ?? null,
      input.nature ?? null,
      input.certainty ?? null,
      input.note ?? null,
      input.sortOrder ?? 0,
    ]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to add family member: no lastInsertId returned');
  }

  return String(result.lastInsertId);
}

/**
 * Remove a member from a family
 */
export async function removeFamilyMember(familyId: string, individualId: string): Promise<void> {
  const db = await getTreeDb();
  const familyDbId = parseEntityId(familyId);
  const individualDbId = parseEntityId(individualId);

  await db.execute('DELETE FROM family_members WHERE family_id = $1 AND individual_id = $2', [
    familyDbId,
    individualDbId,
  ]);
}

/**
 * Remove a family member by its ID
 */
export async function removeFamilyMemberById(memberId: string): Promise<void> {
  const db = await getTreeDb();
  await db.execute('DELETE FROM family_members WHERE id = $1', [parseInt(memberId, 10)]);
}

/**
 * Update a family member's role or pedigree
 */
export async function updateFamilyMember(
  memberId: string,
  input: {
    role?: FamilyRole;
    pedigree?: Pedigree | null;
    sortOrder?: number;
  } & UpdateFamilyMemberDetailsInput
): Promise<void> {
  const db = await getTreeDb();
  const memberDbId = parseInt(memberId, 10);

  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  let paramIndex = 1;

  if (input.role !== undefined) {
    sets.push(`role = $${paramIndex++}`);
    params.push(input.role);
  }
  if (input.pedigree !== undefined) {
    sets.push(`pedigree = $${paramIndex++}`);
    params.push(input.pedigree);
  }
  if (input.nature !== undefined) {
    sets.push(`nature = $${paramIndex++}`);
    params.push(input.nature);
  }
  if (input.certainty !== undefined) {
    sets.push(`certainty = $${paramIndex++}`);
    params.push(input.certainty);
  }
  if (input.note !== undefined) {
    sets.push(`note = $${paramIndex++}`);
    params.push(input.note);
  }
  if (input.sortOrder !== undefined) {
    sets.push(`sort_order = $${paramIndex++}`);
    params.push(input.sortOrder);
  }

  if (sets.length === 0) return;

  params.push(memberDbId);

  await db.execute(
    `UPDATE family_members SET ${sets.join(', ')} WHERE id = $${paramIndex}`,
    params
  );
}

/**
 * Get a family member by ID
 */
export async function getFamilyMemberById(memberId: string): Promise<FamilyMember | null> {
  const db = await getTreeDb();
  const rows = await db.select<RawFamilyMember[]>(
    `SELECT id, family_id, individual_id, role, pedigree, nature, certainty, note, sort_order, created_at
     FROM family_members
     WHERE id = $1`,
    [parseInt(memberId, 10)]
  );
  return rows[0] ? mapToFamilyMember(rows[0]) : null;
}

// =============================================================================
// Relationship Queries
// =============================================================================

/**
 * Get all families that an individual belongs to
 * @param role Optional filter by role ('husband', 'wife', 'child')
 */
export async function getFamiliesOfIndividual(
  individualId: string,
  role?: FamilyRole
): Promise<Family[]> {
  const db = await getTreeDb();
  const individualDbId = parseEntityId(individualId);

  let query = `
    SELECT f.id, f.notes, f.created_at, f.updated_at
    FROM families f
    JOIN family_members fm ON fm.family_id = f.id
    WHERE fm.individual_id = $1
  `;
  const params: (number | string)[] = [individualDbId];

  if (role) {
    query += ' AND fm.role = $2';
    params.push(role);
  }

  query += ' ORDER BY f.id';

  const rows = await db.select<RawFamily[]>(query, params);
  return rows.map(mapToFamily);
}

/**
 * Get families where an individual is a spouse (husband or wife)
 */
export async function getSpouseFamilies(individualId: string): Promise<Family[]> {
  const db = await getTreeDb();
  const individualDbId = parseEntityId(individualId);

  const rows = await db.select<RawFamily[]>(
    `SELECT f.id, f.notes, f.created_at, f.updated_at
     FROM families f
     JOIN family_members fm ON fm.family_id = f.id
     WHERE fm.individual_id = $1 AND fm.role IN ('husband', 'wife')
     ORDER BY f.id`,
    [individualDbId]
  );
  return rows.map(mapToFamily);
}

/**
 * Get families where an individual is a child
 */
export async function getParentFamilies(individualId: string): Promise<Family[]> {
  const db = await getTreeDb();
  const individualDbId = parseEntityId(individualId);

  const rows = await db.select<RawFamily[]>(
    `SELECT f.id, f.notes, f.created_at, f.updated_at
     FROM families f
     JOIN family_members fm ON fm.family_id = f.id
     WHERE fm.individual_id = $1 AND fm.role = 'child'
     ORDER BY f.id`,
    [individualDbId]
  );
  return rows.map(mapToFamily);
}

/**
 * Check if an individual is already a member of a family with a specific role
 */
export async function isMemberOfFamily(
  familyId: string,
  individualId: string,
  role?: FamilyRole
): Promise<boolean> {
  const db = await getTreeDb();
  const familyDbId = parseEntityId(familyId);
  const individualDbId = parseEntityId(individualId);

  let query = 'SELECT 1 FROM family_members WHERE family_id = $1 AND individual_id = $2';
  const params: (number | string)[] = [familyDbId, individualDbId];

  if (role) {
    query += ' AND role = $3';
    params.push(role);
  }

  query += ' LIMIT 1';

  const rows = await db.select<{ 1: number }[]>(query, params);
  return rows.length > 0;
}

// =============================================================================
// Enriched Queries
// =============================================================================

/**
 * Get a family with all its members enriched with individual details
 */
export async function getFamilyWithMembers(familyId: string): Promise<FamilyWithMembers | null> {
  const family = await getFamilyById(familyId);
  if (!family) return null;

  const members = await getFamilyMembers(familyId);

  let husband: IndividualWithDetails | null = null;
  let wife: IndividualWithDetails | null = null;
  const children: IndividualWithDetails[] = [];

  for (const member of members) {
    const individual = await getIndividualById(member.individualId);
    if (!individual) continue;

    const primaryName = await getPrimaryName(member.individualId);
    const names = await getNamesByIndividualId(member.individualId);

    const enrichedIndividual: IndividualWithDetails = {
      ...individual,
      primaryName,
      names,
      birthEvent: null, // TODO: Events not loaded yet
      deathEvent: null,
    };

    switch (member.role) {
      case 'husband':
        husband = enrichedIndividual;
        break;
      case 'wife':
        wife = enrichedIndividual;
        break;
      case 'child':
        children.push(enrichedIndividual);
        break;
    }
  }

  return {
    ...family,
    husband,
    wife,
    children,
    marriageEvent: null, // TODO: Events not loaded yet
  };
}

/**
 * Get the spouse of an individual within a specific family
 */
export async function getSpouseInFamily(
  familyId: string,
  individualId: string
): Promise<string | null> {
  const db = await getTreeDb();
  const familyDbId = parseEntityId(familyId);
  const individualDbId = parseEntityId(individualId);

  // First, get the role of the given individual
  const memberRows = await db.select<{ role: FamilyRole }[]>(
    'SELECT role FROM family_members WHERE family_id = $1 AND individual_id = $2 LIMIT 1',
    [familyDbId, individualDbId]
  );

  if (memberRows.length === 0) return null;

  const role = memberRows[0].role;
  if (role === 'child') return null; // Children don't have spouses in this context

  // Find the spouse (opposite role)
  const spouseRole = role === 'husband' ? 'wife' : 'husband';

  const spouseRows = await db.select<{ individual_id: number }[]>(
    'SELECT individual_id FROM family_members WHERE family_id = $1 AND role = $2 LIMIT 1',
    [familyDbId, spouseRole]
  );

  return spouseRows[0] ? formatEntityId('I', spouseRows[0].individual_id) : null;
}

/**
 * Get all children IDs in a family
 */
export async function getChildrenInFamily(familyId: string): Promise<string[]> {
  const db = await getTreeDb();
  const familyDbId = parseEntityId(familyId);

  const rows = await db.select<{ individual_id: number }[]>(
    `SELECT individual_id 
     FROM family_members 
     WHERE family_id = $1 AND role = 'child' 
     ORDER BY sort_order, id`,
    [familyDbId]
  );

  return rows.map((row) => formatEntityId('I', row.individual_id));
}

/**
 * Return the husband and wife individual IDs for a batch of family IDs.
 * A single query per chunk (chunked to stay under the SQLite host-parameter
 * limit). Intended for EventManager.getAll so it can resolve family principals
 * without loading the entire family graph.
 */
export async function getSpousesForFamilies(
  familyIds: string[]
): Promise<{ familyId: string; husbandId: string | null; wifeId: string | null }[]> {
  if (familyIds.length === 0) return [];
  const db = await getTreeDb();
  const dbIds = familyIds.map(parseEntityId);

  interface RawSpouseRow {
    family_id: number;
    individual_id: number;
    role: 'husband' | 'wife';
  }

  const rows: RawSpouseRow[] = [];
  for (const idsChunk of chunkArray(dbIds, SQLITE_IN_CLAUSE_LIMIT)) {
    const placeholders = buildInClausePlaceholders(idsChunk.length);
    const chunkRows = await db.select<RawSpouseRow[]>(
      `SELECT family_id, individual_id, role
       FROM family_members
       WHERE family_id IN (${placeholders})
         AND role IN ('husband', 'wife')
       ORDER BY family_id, role`,
      idsChunk
    );
    rows.push(...chunkRows);
  }

  const byFamily = new Map<string, { husbandId: string | null; wifeId: string | null }>();
  for (const familyId of familyIds) {
    byFamily.set(familyId, { husbandId: null, wifeId: null });
  }
  for (const row of rows) {
    const familyId = formatEntityId('F', row.family_id);
    const entry = byFamily.get(familyId) ?? { husbandId: null, wifeId: null };
    const individualId = formatEntityId('I', row.individual_id);
    if (row.role === 'husband') entry.husbandId = individualId;
    if (row.role === 'wife') entry.wifeId = individualId;
    byFamily.set(familyId, entry);
  }

  return Array.from(byFamily.entries()).map(([familyId, { husbandId, wifeId }]) => ({
    familyId,
    husbandId,
    wifeId,
  }));
}

/**
 * Count children in a family
 */
export async function countChildrenInFamily(familyId: string): Promise<number> {
  const db = await getTreeDb();
  const familyDbId = parseEntityId(familyId);

  const rows = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM family_members WHERE family_id = $1 AND role = 'child'",
    [familyDbId]
  );

  return rows[0]?.count ?? 0;
}

// =============================================================================
// Paginated List Query (Families list screen)
// =============================================================================

/** Filters applied to a windowed page of the Families list, all AND-ed. */
export interface FamiliesPageFilters {
  /** Free-text query matched against either spouse's primary name only (given + surname); empty means no restriction. */
  nameQuery: string;
  /** Restrict by which spouse slots are filled, or `'all'` for no restriction. */
  spouses: 'all' | 'both' | 'missingHusband' | 'missingWife' | 'none';
  /** Restrict by whether the family has children, or `'all'` for no restriction. */
  children: 'all' | 'with' | 'without';
}

/** Which spouse's primary name (or the child count) a page is ordered by. */
export type FamiliesSortColumn = 'husband' | 'wife' | 'children';

export interface FamiliesPageParams {
  filters: FamiliesPageFilters;
  sortColumn: FamiliesSortColumn;
  sortDirection: 'asc' | 'desc';
  limit: number;
  offset: number;
}

export interface FamiliesPageResult {
  /** Family ids for this page, already in the requested sort order. */
  ids: string[];
  /** Whether a further page exists past this one. */
  hasMore: boolean;
}

/**
 * Get one windowed, filtered, sorted page of family ids — the SQL-side
 * counterpart to the Families list's filter toolbar and sortable
 * Husband/Wife/Children columns (see issue #266). A `family_info` CTE joins
 * each family to its husband's and wife's `family_members` row and primary
 * name, and precomputes its child count once, so the outer query can filter
 * and order on those derived columns without recomputing them.
 *
 * As with `getIndividualsPage`, spouse name filtering and sorting reads only
 * the primary name — alternate names are not considered.
 *
 * Enrichment (member individuals, marriage event) is the caller's job — this
 * only resolves which ids belong on the page, in order. Fetches `limit + 1`
 * rows to derive `hasMore` without a separate `COUNT(*)`.
 */
export async function getFamiliesPage(params: FamiliesPageParams): Promise<FamiliesPageResult> {
  const { filters, sortColumn, sortDirection, limit, offset } = params;
  const db = await getTreeDb();

  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  const spouseCondition: Record<FamiliesPageFilters['spouses'], string | null> = {
    all: null,
    both: 'husband_id IS NOT NULL AND wife_id IS NOT NULL',
    missingHusband: 'husband_id IS NULL AND wife_id IS NOT NULL',
    missingWife: 'husband_id IS NOT NULL AND wife_id IS NULL',
    none: 'husband_id IS NULL AND wife_id IS NULL',
  };
  const spouseClause = spouseCondition[filters.spouses];
  if (spouseClause) conditions.push(spouseClause);

  if (filters.children === 'with') conditions.push('children_count > 0');
  if (filters.children === 'without') conditions.push('children_count = 0');

  const trimmedQuery = filters.nameQuery.trim();
  if (trimmedQuery) {
    const escaped = trimmedQuery.replace(/[%_\\]/g, '\\$&');
    const husbandParam = paramIndex++;
    const wifeParam = paramIndex++;
    conditions.push(
      `((COALESCE(husband_given, '') || ' ' || COALESCE(husband_surname, '')) LIKE $${husbandParam} ESCAPE '\\'` +
        ` OR (COALESCE(wife_given, '') || ' ' || COALESCE(wife_surname, '')) LIKE $${wifeParam} ESCAPE '\\')`
    );
    const pattern = `%${escaped}%`;
    values.push(pattern, pattern);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const dir = sortDirection === 'desc' ? 'DESC' : 'ASC';
  let orderBy: string;
  if (sortColumn === 'children') {
    orderBy = `children_count ${dir}, id ${dir}`;
  } else {
    const prefix = sortColumn === 'husband' ? 'husband' : 'wife';
    const primaryKey = `COALESCE(NULLIF(TRIM(${prefix}_surname), ''), NULLIF(TRIM(${prefix}_given), ''))`;
    orderBy = `${primaryKey} COLLATE NOCASE ${dir} NULLS LAST, ${prefix}_given COLLATE NOCASE ${dir}, id ${dir}`;
  }

  const rows = await db.select<{ id: number }[]>(
    `WITH family_info AS (
       SELECT f.id,
              h.individual_id AS husband_id, hn.surname AS husband_surname, hn.given_names AS husband_given,
              w.individual_id AS wife_id, wn.surname AS wife_surname, wn.given_names AS wife_given,
              (SELECT COUNT(*) FROM family_members c WHERE c.family_id = f.id AND c.role = 'child') AS children_count
       FROM families f
       LEFT JOIN family_members h ON h.family_id = f.id AND h.role = 'husband'
       LEFT JOIN names hn ON hn.individual_id = h.individual_id AND hn.is_primary = 1
       LEFT JOIN family_members w ON w.family_id = f.id AND w.role = 'wife'
       LEFT JOIN names wn ON wn.individual_id = w.individual_id AND wn.is_primary = 1
     )
     SELECT id FROM family_info
     ${where}
     ORDER BY ${orderBy}
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    [...values, limit + 1, offset]
  );

  const hasMore = rows.length > limit;
  return {
    ids: rows.slice(0, limit).map((row) => formatEntityId('F', row.id)),
    hasMore,
  };
}
