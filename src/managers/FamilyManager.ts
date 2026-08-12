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
  updateFamilyMember,
  getParentFamilies,
  getSpouseFamilies,
} from '$db-tree/families';
import {
  deleteEvent,
  getAllMarriageEvents,
  getEventsByFamilyId,
  getFamilyEventByType,
} from '$db-tree/events';
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
  UpdateFamilyMemberDetailsInput,
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

/**
 * The individual's own parent family, creating one (with them as its `child`
 * member) if they don't have one yet. Shared by every write path that needs
 * a guaranteed parent family: `setParent`, `addSibling`, and the father/mother
 * reconciliation in `saveRelations`.
 */
async function ensureParentFamily(individualId: string): Promise<string> {
  const existing = (await getParentFamilies(individualId))[0]?.id;
  if (existing) return existing;
  const familyId = await createFamily({});
  await addFamilyMember({ familyId, individualId, role: 'child' });
  return familyId;
}

/** Which family_members slot (husband/wife) an individual of this gender fills as a spouse — unknown defaults to husband. */
export function spouseRoleFor(gender: Gender): FamilyRole {
  return gender === 'F' ? 'wife' : 'husband';
}

export class FamilyManager {
  /**
   * Create a family with optional husband and wife.
   *
   * Not wrapped in a DB transaction — see the note on
   * {@link IndividualManager.create}. Each write below commits on its own,
   * so a failure adding either spouse is caught and the just-created
   * family deleted — otherwise it would sit permanently in the Families
   * list as a blank, member-less row with no trace of what happened.
   * @returns The formatted ID of the created family
   */
  static async create(
    input: CreateFamilyInput,
    husbandId?: string,
    wifeId?: string
  ): Promise<string> {
    const familyId = await createFamily(input);

    try {
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
    } catch (err) {
      await deleteFamily(familyId);
      throw err;
    }

    return familyId;
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
   * Delete a family and all cascading records — including any event
   * attached to it (e.g. a marriage). The schema's cascade alone doesn't
   * reach this: `event_participants.family_id` cascades away with the
   * family, but the `events` row itself has no FK back to `families` and
   * would otherwise survive with no participant, unattributable and
   * unreachable from anywhere in the app.
   */
  static async delete(id: string): Promise<void> {
    for (const event of await getEventsByFamilyId(id)) {
      await deleteEvent(event.id);
    }
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
    const familyId = await ensureParentFamily(individualId);
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
   * Add a sibling: a new child of the individual's own parent family,
   * creating that family first if the individual has none yet — same
   * bootstrap `setParent` uses for the father/mother slots.
   */
  static async addSibling(individualId: string, siblingId: string): Promise<string> {
    const familyId = await ensureParentFamily(individualId);
    await FamilyManager.addChild(familyId, siblingId);
    return familyId;
  }

  /**
   * Fill a union's empty spouse slot — the "second parent" of a family whose
   * other husband/wife slot is unset (e.g. children recorded before their
   * other parent was known). Requires the family to already have one spouse
   * — every caller reaches this through a `spouseUnions` entry, which by
   * construction always has the subject in a husband/wife slot; the new
   * spouse takes whichever slot that isn't.
   */
  static async setSecondParent(familyId: string, spouseId: string): Promise<void> {
    const members = await getFamilyMembers(familyId);
    const existingSpouseRole = members.find((m) => m.role === 'husband' || m.role === 'wife')?.role;
    if (!existingSpouseRole) {
      throw new Error(`setSecondParent: family ${familyId} has no existing spouse to pair against`);
    }
    const slot: FamilyRole = existingSpouseRole === 'husband' ? 'wife' : 'husband';
    await replaceRoleMember(familyId, slot, spouseId);
  }

  /**
   * Remove any member (spouse or child) from a family by individual id —
   * the general form `removeChild`/`removeParent` specialize for their roles.
   */
  static async removeMember(familyId: string, individualId: string): Promise<void> {
    await removeFamilyMember(familyId, individualId);
  }

  /**
   * Update the Relations tab's per-membership metadata (nature, certainty,
   * note) on one `family_members` row. `memberId` is that row's own id —
   * for a father/mother row this is the *subject's* row in the parent
   * family (shared between both parent rows), for a sibling/spouse/child
   * row it is that person's own row.
   */
  static async updateRelationDetails(
    memberId: string,
    input: UpdateFamilyMemberDetailsInput
  ): Promise<void> {
    await updateFamilyMember(memberId, input);
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
      async function applyParent(
        memberRole: 'husband' | 'wife',
        value: RelationPersonInput | null | undefined
      ): Promise<void> {
        if (value === undefined) return;
        if (value === null) {
          const familyId = (await getParentFamilies(individualId))[0]?.id;
          if (familyId) await replaceRoleMember(familyId, memberRole, null);
          return;
        }
        await replaceRoleMember(
          await ensureParentFamily(individualId),
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
    const individualRole: FamilyRole = spouseRoleFor(individualGender);
    const spouseRole: FamilyRole = individualRole === 'husband' ? 'wife' : 'husband';

    // Snapshot pre-existing spouse families before the loop can create new ones,
    // so removal reconciliation only targets unions the caller dropped.
    const priorSpouseFamilyIds = (await getSpouseFamilies(individualId)).map((family) => family.id);
    const keptFamilyIds = new Set(
      input.families.map((family) => family.id).filter((id): id is string => id !== undefined)
    );

    for (const familyInput of input.families) {
      await saveSpouseFamily(individualId, individualRole, spouseRole, familyInput);
    }

    // A pre-existing spouse family no longer listed was removed in the
    // editor: delete the union (cascades to its member links and any
    // attached event; the individuals remain).
    for (const familyId of priorSpouseFamilyIds) {
      if (!keptFamilyIds.has(familyId)) await FamilyManager.delete(familyId);
    }
  }
}

/** Create a brand-new individual for a "create new person" pick, or reuse an existing id. */
export async function resolvePersonId(ref: RelationPersonInput): Promise<string> {
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
