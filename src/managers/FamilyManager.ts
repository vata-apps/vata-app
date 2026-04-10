import { getTreeDb } from '$/db/connection';
import {
  getAllFamilies,
  getAllFamilyMembers,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
  getFamilyMembers,
  addFamilyMember,
  removeFamilyMember,
} from '$db-tree/families';
import { getAllMarriageEvents, getFamilyEventByType } from '$db-tree/events';
import { IndividualManager } from './IndividualManager';
import type {
  CreateFamilyInput,
  EventWithDetails,
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
   * Uses a constant number of SQL queries (families, family members, all
   * individuals via IndividualManager.getAll, marriage events) and assembles
   * the result in JS, so loading is independent of the number of families.
   */
  static async getAll(): Promise<FamilyWithMembers[]> {
    const [families, members, individuals, marriageEvents] = await Promise.all([
      getAllFamilies(),
      getAllFamilyMembers(),
      IndividualManager.getAll(),
      getAllMarriageEvents(),
    ]);

    const individualById = new Map<string, IndividualWithDetails>();
    for (const individual of individuals) {
      individualById.set(individual.id, individual);
    }

    const marriageEventByFamily = new Map<string, EventWithDetails>();
    for (const event of marriageEvents) {
      if (event.eventType.tag !== 'MARR') continue;
      for (const participant of event.participants) {
        if (participant.role !== 'principal' || participant.familyId === null) continue;
        if (!marriageEventByFamily.has(participant.familyId)) {
          marriageEventByFamily.set(participant.familyId, event);
        }
      }
    }

    const membersByFamily = new Map<
      string,
      {
        husband: IndividualWithDetails | null;
        wife: IndividualWithDetails | null;
        children: IndividualWithDetails[];
      }
    >();
    for (const member of members) {
      const entry = membersByFamily.get(member.familyId) ?? {
        husband: null,
        wife: null,
        children: [] as IndividualWithDetails[],
      };
      const individual = individualById.get(member.individualId);
      if (individual) {
        switch (member.role) {
          case 'husband':
            entry.husband = individual;
            break;
          case 'wife':
            entry.wife = individual;
            break;
          case 'child':
            entry.children.push(individual);
            break;
        }
      }
      membersByFamily.set(member.familyId, entry);
    }

    return families.map((family) => {
      const entry = membersByFamily.get(family.id) ?? {
        husband: null,
        wife: null,
        children: [] as IndividualWithDetails[],
      };
      return {
        ...family,
        husband: entry.husband,
        wife: entry.wife,
        children: entry.children,
        marriageEvent: marriageEventByFamily.get(family.id) ?? null,
      };
    });
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
