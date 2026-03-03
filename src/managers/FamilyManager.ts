import { getTreeDb } from '$/db/connection';
import {
  getAllFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
  getFamilyMembers,
  addFamilyMember,
  removeFamilyMember,
} from '$db-tree/families';
import { getFamilyEventByType } from '$db-tree/events';
import { IndividualManager } from './IndividualManager';
import type {
  CreateFamilyInput,
  UpdateFamilyInput,
  FamilyWithMembers,
  IndividualWithDetails,
  Pedigree,
} from '$/types/database';

export class FamilyManager {
  /**
   * Create a family with optional husband and wife in a single transaction.
   * @returns The formatted ID of the created family
   */
  static async create(
    input: CreateFamilyInput,
    husbandId?: string,
    wifeId?: string
  ): Promise<string> {
    const db = await getTreeDb();

    await db.execute('BEGIN TRANSACTION');
    try {
      const familyId = await createFamily(input);

      if (husbandId) {
        await addFamilyMember({
          familyId,
          individualId: husbandId,
          role: 'husband',
        });
      }

      if (wifeId) {
        await addFamilyMember({
          familyId,
          individualId: wifeId,
          role: 'wife',
        });
      }

      await db.execute('COMMIT');
      return familyId;
    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }
  }

  /**
   * Get a family with enriched members (full individual details) and marriage event.
   */
  static async getById(id: string): Promise<FamilyWithMembers | null> {
    const family = await getFamilyById(id);
    if (!family) return null;

    const members = await getFamilyMembers(id);

    let husband: IndividualWithDetails | null = null;
    let wife: IndividualWithDetails | null = null;
    const children: IndividualWithDetails[] = [];

    for (const member of members) {
      const enriched = await IndividualManager.getById(member.individualId);
      if (!enriched) continue;

      switch (member.role) {
        case 'husband':
          husband = enriched;
          break;
        case 'wife':
          wife = enriched;
          break;
        case 'child':
          children.push(enriched);
          break;
      }
    }

    const marriageEvent = await getFamilyEventByType(id, 'MARR');

    return {
      ...family,
      husband,
      wife,
      children,
      marriageEvent,
    };
  }

  /**
   * Get all families with full details.
   * Note: Calls getById per family (N+1). Acceptable for local SQLite.
   */
  static async getAll(): Promise<FamilyWithMembers[]> {
    const families = await getAllFamilies();
    const results: FamilyWithMembers[] = [];

    for (const family of families) {
      const enriched = await FamilyManager.getById(family.id);
      if (enriched) {
        results.push(enriched);
      }
    }

    return results;
  }

  /**
   * Update a family's core fields.
   */
  static async update(id: string, input: UpdateFamilyInput): Promise<void> {
    await updateFamily(id, input);
  }

  /**
   * Delete a family and all cascading records.
   */
  static async delete(id: string): Promise<void> {
    await deleteFamily(id);
  }

  /**
   * Add a child to a family.
   */
  static async addChild(
    familyId: string,
    individualId: string,
    pedigree?: Pedigree
  ): Promise<string> {
    return addFamilyMember({
      familyId,
      individualId,
      role: 'child',
      pedigree,
    });
  }

  /**
   * Remove a child from a family.
   */
  static async removeChild(familyId: string, individualId: string): Promise<void> {
    await removeFamilyMember(familyId, individualId);
  }
}
