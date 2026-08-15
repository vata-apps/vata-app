import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '$/lib/query-keys';
import { countCitationsForEntities, getCitationsForFamily } from '$db-tree/citations';
import { getFamilyMembers } from '$db-tree/families';
import { getPersonRelations, type PersonRelationsData } from '$db-tree/person-relations';
import {
  FamilyManager,
  resolvePersonId,
  resolveSpouseRoles,
  type RelationPersonInput,
} from '$managers/FamilyManager';
import type { Gender, UpdateFamilyMemberDetailsInput } from '$types/database';

export type { RelationPersonInput };

export interface PersonRelationsResult extends PersonRelationsData {
  /** How many sources back each family a row belongs to — sources are scoped at the family (union) level, see `person-relations.ts`. */
  sourceCountByFamilyId: Record<string, number>;
}

/**
 * Load one person's relations for the Relations tab, together with how many
 * sources back each family involved (fathers/mothers/full-siblings share the
 * parent family's count; each union's spouse/children share that union's
 * count; a half-sibling carries their own other-family's count).
 */
export function usePersonRelations(individualId: string) {
  return useQuery({
    queryKey: queryKeys.personRelations(individualId),
    queryFn: async (): Promise<PersonRelationsResult> => {
      const relations = await getPersonRelations(individualId);
      const familyIds = [
        ...(relations.parentFamilyId ? [relations.parentFamilyId] : []),
        ...relations.siblings.map((sibling) => sibling.familyId),
        ...relations.spouseUnions.map((union) => union.familyId),
      ];
      const counts = await countCitationsForEntities('family', [...new Set(familyIds)]);
      return { ...relations, sourceCountByFamilyId: Object.fromEntries(counts) };
    },
  });
}

/**
 * The sources backing one relation's family, for the detail panel's
 * read-only Sources section. `familyId` is `null` while a draft is
 * selected — nothing can cite a family that does not exist yet.
 */
export function useRelationCitations(familyId: string | null) {
  return useQuery({
    queryKey: queryKeys.relationCitations(familyId ?? ''),
    queryFn: () => getCitationsForFamily(familyId as string),
    enabled: familyId !== null,
  });
}

interface AffectsOptions {
  affectsOverview?: boolean;
  affectsAncestors?: boolean;
}

/**
 * Invalidation shared by every relation mutation, split into `self` (the
 * acting individual, called exactly once per mutation) and `other` (any
 * other individual whose own cached views the same `family_members` write
 * also touches — a counterparty, a displaced parent, or any further current
 * family member per {@link invalidateOtherFamilyMembers}).
 *
 * `families` and the subject's own `personRelations` always change (a
 * `family_members` row was added, removed, or moved) — that's `self`'s
 * unconditional part. `personOverview` and `ancestors` are narrower for
 * both `self` and `other`: only a parent or spouse/child change can move
 * what they display — a sibling edit, or a pure nature/certainty/note edit,
 * never does. `ancestors` in particular is directional (only the *child*
 * side of a parent-child edge gains/loses an ancestor), so `self` and
 * `other` each take their own `affectsAncestors` rather than assuming
 * symmetry.
 */
function useInvalidateRelations(individualId: string) {
  const queryClient = useQueryClient();

  const self = (options: AffectsOptions & { createNew?: boolean } = {}) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.personRelations(individualId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.families });

    if (options.affectsOverview) {
      queryClient.invalidateQueries({ queryKey: queryKeys.personOverview(individualId) });
    }
    if (options.affectsAncestors) {
      queryClient.invalidateQueries({ queryKey: queryKeys.ancestors(individualId) });
    }
    if (options.createNew) {
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
    }
  };

  const other = (id: string | null | undefined, options: AffectsOptions = {}) => {
    if (!id) return;
    queryClient.invalidateQueries({ queryKey: queryKeys.personRelations(id) });
    if (options.affectsOverview) {
      queryClient.invalidateQueries({ queryKey: queryKeys.personOverview(id) });
    }
    if (options.affectsAncestors) {
      queryClient.invalidateQueries({ queryKey: queryKeys.ancestors(id) });
    }
  };

  return { self, other };
}

/**
 * A family's current husband/wife and child individualIds, excluding
 * `excludeIds` (the acting individual and whichever counterparty the caller
 * already invalidates directly). `family_members` rows are one-to-many, so a
 * mutation naming only its immediate counterparty leaves every *other*
 * current member's cache stale — see issue #263. `familyId` is `null` when
 * the mutation had no family to begin with (e.g. removing a parent that was
 * never set). Read after the mutation commits so it reflects who is
 * actually still a member.
 */
async function otherFamilyMembers(
  familyId: string | null,
  excludeIds: (string | null | undefined)[]
): Promise<{ spouses: string[]; children: string[] }> {
  if (!familyId) return { spouses: [], children: [] };

  const members = await getFamilyMembers(familyId);
  const excluded = new Set(excludeIds.filter((id): id is string => !!id));
  const spouses: string[] = [];
  const children: string[] = [];
  for (const member of members) {
    if (excluded.has(member.individualId)) continue;
    (member.role === 'child' ? children : spouses).push(member.individualId);
  }
  return { spouses, children };
}

/**
 * Invalidate every other current member of a mutated family. The family's
 * other spouse (if any) always has their own `spouseUnions`/overview go
 * stale, since that shared row is exactly what their view reads back. A
 * child only needs the same treatment when the mutation changed a
 * husband/wife slot (`childrenAffectsParent`) — their own father/mother and
 * ancestors move with it. A pure child-list change (add/remove sibling or
 * union child) leaves an existing child's own father/mother untouched; only
 * their sibling/children list does, which `personRelations` alone covers.
 */
function invalidateOtherFamilyMembers(
  invalidateOther: (id: string, options?: AffectsOptions) => void,
  { spouses, children }: { spouses: string[]; children: string[] },
  { childrenAffectsParent = false }: { childrenAffectsParent?: boolean } = {}
): void {
  for (const id of spouses) {
    invalidateOther(id, { affectsOverview: true });
  }
  for (const id of children) {
    invalidateOther(id, {
      affectsOverview: childrenAffectsParent,
      affectsAncestors: childrenAffectsParent,
    });
  }
}

/** Editing nature/certainty/note never moves what any tree-wide list or the Overview tab displays. */
export function useUpdateRelationDetails(individualId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      input,
    }: {
      memberId: string;
      input: UpdateFamilyMemberDetailsInput;
    }) => FamilyManager.updateRelationDetails(memberId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personRelations(individualId) });
    },
  });
}

export function useSetParent(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: async ({
      role,
      person,
    }: {
      role: 'father' | 'mother';
      person: RelationPersonInput;
    }) => {
      const personId = await resolvePersonId(person);
      const { familyId, displacedParentId } = await FamilyManager.setParent(
        individualId,
        role,
        personId
      );
      const others = await otherFamilyMembers(familyId, [
        individualId,
        personId,
        displacedParentId,
      ]);
      return { personId, displacedParentId, others };
    },
    onSuccess: ({ personId, displacedParentId, others }, { person }) => {
      invalidate.self({
        createNew: !!person.createNew,
        affectsOverview: true,
        affectsAncestors: true,
      });
      invalidate.other(personId, { affectsOverview: true });
      // Setting a slot that already had someone in it displaces them —
      // their own cached views need the same refresh removeParent gives
      // an explicitly-removed parent.
      if (displacedParentId && displacedParentId !== personId) {
        invalidate.other(displacedParentId, { affectsOverview: true });
      }
      // Full siblings and the other parent share this same family row —
      // see #263.
      invalidateOtherFamilyMembers(invalidate.other, others, { childrenAffectsParent: true });
    },
  });
}

export function useRemoveParent(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: async (role: 'father' | 'mother') => {
      const result = await FamilyManager.removeParent(individualId, role);
      const others = await otherFamilyMembers(result?.familyId ?? null, [
        individualId,
        result?.removedParentId,
      ]);
      return { removedParentId: result?.removedParentId ?? null, others };
    },
    onSuccess: ({ removedParentId, others }) => {
      invalidate.self({ affectsOverview: true, affectsAncestors: true });
      invalidate.other(removedParentId, { affectsOverview: true });
      // Full siblings and the other parent share this same family row —
      // see #263.
      invalidateOtherFamilyMembers(invalidate.other, others, { childrenAffectsParent: true });
    },
  });
}

/**
 * Adding/removing a sibling never moves Overview or ancestors for the
 * subject or the sibling themselves — see {@link useInvalidateRelations}'s
 * doc comment. The shared parent family's own husband/wife *do* have their
 * Overview's children list move, via {@link invalidateOtherFamilyMembers}.
 */
export function useAddSibling(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: async (person: RelationPersonInput) => {
      const siblingId = await resolvePersonId(person);
      const familyId = await FamilyManager.addSibling(individualId, siblingId);
      const others = await otherFamilyMembers(familyId, [individualId, siblingId]);
      return { siblingId, others };
    },
    onSuccess: ({ siblingId, others }, person) => {
      invalidate.self({ createNew: !!person.createNew });
      invalidate.other(siblingId);
      // The parents and any other pre-existing sibling share this family
      // row — see #263.
      invalidateOtherFamilyMembers(invalidate.other, others);
    },
  });
}

export function useRemoveSibling(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: async ({ familyId, siblingId }: { familyId: string; siblingId: string }) => {
      await FamilyManager.removeMember(familyId, siblingId);
      return otherFamilyMembers(familyId, [individualId, siblingId]);
    },
    onSuccess: (others, { siblingId }) => {
      invalidate.self();
      invalidate.other(siblingId);
      invalidateOtherFamilyMembers(invalidate.other, others);
    },
  });
}

/** Starts a brand-new union: a new family with the subject and the picked/created spouse. */
export function useCreateUnion(individualId: string, individualGender: Gender) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: async (person: RelationPersonInput) => {
      const spouseId = await resolvePersonId(person);
      const { individualRole } = resolveSpouseRoles(individualGender, person.gender ?? 'U');
      const husbandId = individualRole === 'husband' ? individualId : spouseId;
      const wifeId = individualRole === 'husband' ? spouseId : individualId;
      await FamilyManager.create({}, husbandId, wifeId);
      return spouseId;
    },
    onSuccess: (spouseId, person) => {
      invalidate.self({ createNew: !!person.createNew, affectsOverview: true });
      invalidate.other(spouseId, { affectsOverview: true });
    },
  });
}

/** Fills an existing union's empty spouse slot — the "Ajouter le second parent" case. */
export function useSetSecondParent(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: async ({ familyId, person }: { familyId: string; person: RelationPersonInput }) => {
      const spouseId = await resolvePersonId(person);
      await FamilyManager.setSecondParent(familyId, spouseId);
      const others = await otherFamilyMembers(familyId, [individualId, spouseId]);
      return { spouseId, others };
    },
    onSuccess: ({ spouseId, others }, { person }) => {
      invalidate.self({ createNew: !!person.createNew, affectsOverview: true });
      invalidate.other(spouseId, { affectsOverview: true });
      // Children recorded before this second parent was known gain a new
      // parent (and ancestor branch) from this same family row — see #263.
      invalidateOtherFamilyMembers(invalidate.other, others, { childrenAffectsParent: true });
    },
  });
}

export function useRemoveSpouse(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: async ({ familyId, spouseId }: { familyId: string; spouseId: string }) => {
      await FamilyManager.removeMember(familyId, spouseId);
      return otherFamilyMembers(familyId, [individualId, spouseId]);
    },
    onSuccess: (others, { spouseId }) => {
      invalidate.self({ affectsOverview: true });
      invalidate.other(spouseId, { affectsOverview: true });
      // Mirror image of useSetSecondParent — the union's children lose a
      // parent from this same family row — see #263.
      invalidateOtherFamilyMembers(invalidate.other, others, { childrenAffectsParent: true });
    },
  });
}

export function useAddChildToUnion(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: async ({ familyId, person }: { familyId: string; person: RelationPersonInput }) => {
      const childId = await resolvePersonId(person);
      await FamilyManager.addChild(familyId, childId);
      const others = await otherFamilyMembers(familyId, [individualId, childId]);
      return { childId, others };
    },
    onSuccess: ({ childId, others }, { person }) => {
      invalidate.self({ createNew: !!person.createNew, affectsOverview: true });
      invalidate.other(childId, { affectsOverview: true, affectsAncestors: true });
      // The other spouse and any pre-existing sibling share this union's
      // family row — see #263.
      invalidateOtherFamilyMembers(invalidate.other, others);
    },
  });
}

export function useRemoveChildFromUnion(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: async ({ familyId, childId }: { familyId: string; childId: string }) => {
      await FamilyManager.removeChild(familyId, childId);
      return otherFamilyMembers(familyId, [individualId, childId]);
    },
    onSuccess: (others, { childId }) => {
      invalidate.self({ affectsOverview: true });
      invalidate.other(childId, { affectsOverview: true, affectsAncestors: true });
      invalidateOtherFamilyMembers(invalidate.other, others);
    },
  });
}
