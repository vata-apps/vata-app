import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import type {
  Family,
  CreateFamilyInput,
  UpdateFamilyInput,
  FamilyMember,
  CreateFamilyMemberInput,
  FamilyRole,
  Pedigree,
  FamilyWithMembers,
  IndividualWithDetails,
} from '$/types/database';
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
 * Get all members of a family
 */
export async function getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
  const db = await getTreeDb();
  const dbId = parseEntityId(familyId);
  const rows = await db.select<RawFamilyMember[]>(
    `SELECT id, family_id, individual_id, role, pedigree, sort_order, created_at
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
    `INSERT INTO family_members (family_id, individual_id, role, pedigree, sort_order)
     VALUES ($1, $2, $3, $4, $5)`,
    [familyDbId, individualDbId, input.role, input.pedigree ?? null, input.sortOrder ?? 0]
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
  input: { role?: FamilyRole; pedigree?: Pedigree | null; sortOrder?: number }
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
    `SELECT id, family_id, individual_id, role, pedigree, sort_order, created_at
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
      birthEvent: null, // Events not loaded yet (MVP3 Phase 2.5)
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
    marriageEvent: null, // Events not loaded yet (MVP3 Phase 2.5)
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
