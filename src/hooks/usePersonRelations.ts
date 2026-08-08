import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '$/lib/query-keys';
import { countCitationsForEntities, getCitationsForFamily } from '$db-tree/citations';
import { getPersonRelations, type PersonRelationsData } from '$db-tree/person-relations';
import {
  FamilyManager,
  resolvePersonId,
  spouseRoleFor,
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

/**
 * Invalidation shared by every relation mutation. `families` always changes
 * (a family_members row was added, removed, or moved). `personOverview` and
 * `ancestors` are narrower: only a parent or spouse/child change can move
 * what they display — a sibling edit, or a pure nature/certainty/note edit,
 * never does.
 */
function useInvalidateRelations(
  individualId: string
): (options?: {
  createNew?: boolean;
  affectsOverview?: boolean;
  affectsAncestors?: boolean;
}) => void {
  const queryClient = useQueryClient();

  return (options = {}) => {
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
      await FamilyManager.setParent(individualId, role, personId);
      return personId;
    },
    onSuccess: (_result, { person }) =>
      invalidate({ createNew: !!person.createNew, affectsOverview: true, affectsAncestors: true }),
  });
}

export function useRemoveParent(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: (role: 'father' | 'mother') => FamilyManager.removeParent(individualId, role),
    onSuccess: () => invalidate({ affectsOverview: true, affectsAncestors: true }),
  });
}

export function useAddSibling(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: async (person: RelationPersonInput) => {
      const siblingId = await resolvePersonId(person);
      await FamilyManager.addSibling(individualId, siblingId);
      return siblingId;
    },
    onSuccess: (_result, person) => invalidate({ createNew: !!person.createNew }),
  });
}

export function useRemoveSibling(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: ({ familyId, siblingId }: { familyId: string; siblingId: string }) =>
      FamilyManager.removeMember(familyId, siblingId),
    onSuccess: () => invalidate(),
  });
}

/** Starts a brand-new union: a new family with the subject and the picked/created spouse. */
export function useCreateUnion(individualId: string, individualGender: Gender) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: async (person: RelationPersonInput) => {
      const spouseId = await resolvePersonId(person);
      const individualRole = spouseRoleFor(individualGender);
      const husbandId = individualRole === 'husband' ? individualId : spouseId;
      const wifeId = individualRole === 'husband' ? spouseId : individualId;
      return FamilyManager.create({}, husbandId, wifeId);
    },
    onSuccess: (_result, person) =>
      invalidate({ createNew: !!person.createNew, affectsOverview: true }),
  });
}

/** Fills an existing union's empty spouse slot — the "Ajouter le second parent" case. */
export function useSetSecondParent(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: async ({ familyId, person }: { familyId: string; person: RelationPersonInput }) => {
      const spouseId = await resolvePersonId(person);
      await FamilyManager.setSecondParent(familyId, spouseId);
      return spouseId;
    },
    onSuccess: (_result, { person }) =>
      invalidate({ createNew: !!person.createNew, affectsOverview: true }),
  });
}

export function useRemoveSpouse(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: ({ familyId, spouseId }: { familyId: string; spouseId: string }) =>
      FamilyManager.removeMember(familyId, spouseId),
    onSuccess: () => invalidate({ affectsOverview: true }),
  });
}

export function useAddChildToUnion(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: async ({ familyId, person }: { familyId: string; person: RelationPersonInput }) => {
      const childId = await resolvePersonId(person);
      await FamilyManager.addChild(familyId, childId);
      return childId;
    },
    onSuccess: (_result, { person }) =>
      invalidate({ createNew: !!person.createNew, affectsOverview: true }),
  });
}

export function useRemoveChildFromUnion(individualId: string) {
  const invalidate = useInvalidateRelations(individualId);
  return useMutation({
    mutationFn: ({ familyId, childId }: { familyId: string; childId: string }) =>
      FamilyManager.removeChild(familyId, childId),
    onSuccess: () => invalidate({ affectsOverview: true }),
  });
}
