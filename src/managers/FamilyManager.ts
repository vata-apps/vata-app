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
  removeFamilyMemberById,
  getParentFamilies,
  getSpouseFamilies,
} from '$db-tree/families';
import { getAllMarriageEvents, getFamilyEventByType } from '$db-tree/events';
import { IndividualManager } from './IndividualManager';
import type {
  CreateFamilyInput,
  EventWithDetails,
  UpdateFamilyInput,
  FamilyRole,
  FamilyWithMembers,
  IndividualWithDetails,
  Gender,
  Pedigree,
} from '$types/database';

/** A relation slot filled by an existing individual, or a brand-new one to create on save. */
export interface RelationPersonInput {
  id?: string;
  createNew?: { givenNames?: string; surname?: string; gender?: Gender };
}

export interface FamilyRelationInput {
  /** Existing family id — omit for a family introduced in this edit session. */
  id?: string;
  /** `null` clears the spouse slot; `undefined` leaves it untouched. */
  spouse?: RelationPersonInput | null;
  /** Full desired-state list — children not represented here are unlinked. */
  children: RelationPersonInput[];
}

export interface PersonRelationsInput {
  /** `null` removes the father link; `undefined` leaves it untouched. */
  father?: RelationPersonInput | null;
  mother?: RelationPersonInput | null;
  families?: FamilyRelationInput[];
}

/**
 * Replace whichever individual currently holds `role` in `familyId` with
 * `individualId` — or clear the slot when `individualId` is `null`. Shared by
 * every place that reassigns a single husband/wife slot (`setParent`,
 * `removeParent`, and parent-relation reconciliation in `saveRelations`).
 */
async function replaceRoleMember(
  familyId: string,
  role: FamilyRole,
  individualId: string | null
): Promise<void> {
  const existing = (await getFamilyMembers(familyId)).find((m) => m.role === role);
  if (existing) await removeFamilyMemberById(existing.id);
  if (individualId) await addFamilyMember({ familyId, individualId, role });
}

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
   * Batches member lookups through `IndividualManager.getByIds` (one query
   * regardless of family size) rather than fetching each member one at a
   * time — the same pattern `getAll` uses.
   */
  static async getById(id: string): Promise<FamilyWithMembers | null> {
    const family = await getFamilyById(id);
    if (!family) return null;

    const members = await getFamilyMembers(id);
    const individuals = await IndividualManager.getByIds(members.map((m) => m.individualId));
    const individualById = new Map(individuals.map((individual) => [individual.id, individual]));

    let husband: IndividualWithDetails | null = null;
    let wife: IndividualWithDetails | null = null;
    const children: IndividualWithDetails[] = [];

    for (const member of members) {
      const enriched = individualById.get(member.individualId);
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
   * Runs three parallel batch queries — families, family_members, marriage
   * events — then fetches only the individuals actually referenced by
   * `family_members` through `IndividualManager.getByIds`, so sparse trees
   * don't pay the cost of loading people unrelated to any family.
   */
  static async getAll(): Promise<FamilyWithMembers[]> {
    const [families, members, marriageEvents] = await Promise.all([
      getAllFamilies(),
      getAllFamilyMembers(),
      getAllMarriageEvents(),
    ]);

    const referencedIndividualIds = Array.from(new Set(members.map((m) => m.individualId)));
    const individuals = await IndividualManager.getByIds(referencedIndividualIds);

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

  /**
   * Get the family in which the individual is a child, enriched with members.
   * Assumes a single parent family per individual, matching the read-side
   * Relations tab (see `getPersonRelations`).
   */
  static async getParentFamily(individualId: string): Promise<FamilyWithMembers | null> {
    const families = await getParentFamilies(individualId);
    if (families.length === 0) return null;
    return FamilyManager.getById(families[0].id);
  }

  /**
   * Get every family in which the individual is a spouse (husband or wife),
   * enriched with members.
   */
  static async getSpouseFamiliesWithMembers(individualId: string): Promise<FamilyWithMembers[]> {
    const families = await getSpouseFamilies(individualId);
    const enriched = await Promise.all(families.map((family) => FamilyManager.getById(family.id)));
    return enriched.filter((family): family is FamilyWithMembers => family !== null);
  }

  /**
   * Set (or replace) an individual's father or mother, creating their parent
   * family on first use. `role` maps to the schema's `husband`/`wife` slot —
   * see the sqlite-standards note: family-member role is a positional slot,
   * independent of the parent's own `gender` field.
   */
  static async setParent(
    individualId: string,
    role: 'father' | 'mother',
    parentId: string
  ): Promise<void> {
    const memberRole = role === 'father' ? 'husband' : 'wife';
    const families = await getParentFamilies(individualId);

    let familyId = families[0]?.id;
    if (!familyId) {
      familyId = await createFamily({});
      await addFamilyMember({ familyId, individualId, role: 'child' });
    }

    await replaceRoleMember(familyId, memberRole, parentId);
  }

  /**
   * Remove an individual's father or mother link, if a parent family exists.
   */
  static async removeParent(individualId: string, role: 'father' | 'mother'): Promise<void> {
    const memberRole = role === 'father' ? 'husband' : 'wife';
    const families = await getParentFamilies(individualId);
    if (families.length === 0) return;

    await replaceRoleMember(families[0].id, memberRole, null);
  }

  /**
   * Reconcile an individual's full relations against `input`: father, mother,
   * and every spouse family with its children. Each `RelationPersonInput`
   * without an `id` is materialized via {@link IndividualManager.create}
   * first, so "create new person" picks in the Person editor resolve to a
   * real individual before being linked.
   *
   * Not wrapped in a DB transaction — see the note on
   * {@link IndividualManager.create}. Each write commits on its own.
   */
  static async saveRelations(
    individualId: string,
    individualGender: Gender,
    input: PersonRelationsInput
  ): Promise<void> {
    if (input.father !== undefined || input.mother !== undefined) {
      let parentFamilyId = (await getParentFamilies(individualId))[0]?.id;

      async function ensureParentFamilyId(): Promise<string> {
        if (parentFamilyId) return parentFamilyId;
        parentFamilyId = await createFamily({});
        await addFamilyMember({ familyId: parentFamilyId, individualId, role: 'child' });
        return parentFamilyId;
      }

      async function applyParent(
        memberRole: 'husband' | 'wife',
        value: RelationPersonInput | null | undefined
      ): Promise<void> {
        if (value === undefined) return;
        if (value === null) {
          if (parentFamilyId) await replaceRoleMember(parentFamilyId, memberRole, null);
          return;
        }
        await replaceRoleMember(
          await ensureParentFamilyId(),
          memberRole,
          await resolvePersonId(value)
        );
      }

      await applyParent('husband', input.father);
      await applyParent('wife', input.mother);
    }

    if (!input.families) return;

    // The edited person's own slot in a *new* spouse family is guessed from
    // their gender (defaulting to husband when unknown) — unlike
    // `setParent`'s `role`, there is no explicit caller-supplied slot here,
    // and getting it right matters: their own future children resolve
    // father/mother from this same husband/wife slot (see `setParent`).
    const individualRole: FamilyRole = individualGender === 'F' ? 'wife' : 'husband';
    const spouseRole: FamilyRole = individualRole === 'husband' ? 'wife' : 'husband';

    for (const familyInput of input.families) {
      await saveSpouseFamily(individualId, individualRole, spouseRole, familyInput);
    }
  }
}

/** Create a brand-new individual for a "create new person" pick, or reuse an existing id. */
async function resolvePersonId(ref: RelationPersonInput): Promise<string> {
  if (ref.id) return ref.id;
  return IndividualManager.create({
    gender: ref.createNew?.gender,
    name: { givenNames: ref.createNew?.givenNames, surname: ref.createNew?.surname },
  });
}

/**
 * Reconcile one spouse-family row: create it if new and non-empty, replace
 * the spouse slot, and reconcile children to the exact desired set. Fetches
 * the family's members once and reuses that single result for both the
 * spouse-slot lookup and the existing-children diff.
 */
async function saveSpouseFamily(
  individualId: string,
  individualRole: FamilyRole,
  spouseRole: FamilyRole,
  familyInput: FamilyRelationInput
): Promise<void> {
  const hasContent = familyInput.spouse || familyInput.children.length > 0;
  if (!familyInput.id && !hasContent) return;

  let familyId = familyInput.id;
  if (!familyId) {
    familyId = await createFamily({});
    await addFamilyMember({ familyId, individualId, role: individualRole });
  }

  const existingMembers = await getFamilyMembers(familyId);

  if (familyInput.spouse !== undefined) {
    const existingSpouse = existingMembers.find((m) => m.role === spouseRole);
    if (existingSpouse) await removeFamilyMemberById(existingSpouse.id);
    if (familyInput.spouse) {
      await addFamilyMember({
        familyId,
        individualId: await resolvePersonId(familyInput.spouse),
        role: spouseRole,
      });
    }
  }

  const existingChildIds = existingMembers
    .filter((m) => m.role === 'child')
    .map((m) => m.individualId);
  const desiredChildIds = new Set<string>();
  for (const child of familyInput.children) {
    desiredChildIds.add(await resolvePersonId(child));
  }

  for (const childId of existingChildIds) {
    if (!desiredChildIds.has(childId)) {
      await FamilyManager.removeChild(familyId, childId);
    }
  }
  for (const childId of desiredChildIds) {
    if (!existingChildIds.includes(childId)) {
      await FamilyManager.addChild(familyId, childId);
    }
  }
}
