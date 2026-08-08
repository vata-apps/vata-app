import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '$/lib/query-keys';
import { countCitationsForEntities } from '$db-tree/citations';
import {
  createName,
  deleteName,
  getNamesByIndividualId,
  setPrimaryName,
  updateName,
} from '$db-tree/names';
import type { CreateNameInput, Name, UpdateNameInput } from '$types/database';

/** A person's name records, each with how many sources back it. */
export interface PersonName extends Name {
  sourceCount: number;
}

/**
 * Load every name of one individual, together with its citation count in a
 * single extra query rather than one per row (see
 * {@link countCitationsForEntities}). The count feeds the per-row
 * sourced/unsourced indicator.
 */
export function usePersonNames(individualId: string) {
  return useQuery({
    queryKey: queryKeys.personNames(individualId),
    queryFn: async (): Promise<PersonName[]> => {
      const names = await getNamesByIndividualId(individualId);
      const counts = await countCitationsForEntities(
        'name',
        names.map((name) => name.id)
      );
      return names.map((name) => ({ ...name, sourceCount: counts.get(name.id) ?? 0 }));
    },
  });
}

/**
 * Everything that changes when a name changes: always this person's own cached
 * views, and — only when the person's *primary* name moved — the tree-wide
 * lists that display it.
 *
 * The split matters because the Names tab persists each field on blur rather
 * than behind a save button, and the people rail keeps `individuals` mounted
 * beside the tab. Invalidating an observed query refetches it immediately, so
 * invalidating the tree-wide keys unconditionally would reload every
 * individual and every family once per field the user tabs through.
 */
function useInvalidateNames(individualId: string): (affectsPrimaryName: boolean) => void {
  const queryClient = useQueryClient();

  return (affectsPrimaryName: boolean) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.personNames(individualId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.personOverview(individualId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.individual(individualId) });

    if (affectsPrimaryName) {
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
      queryClient.invalidateQueries({ queryKey: queryKeys.families });
    }
  };
}

export function useCreateName(individualId: string) {
  const invalidate = useInvalidateNames(individualId);
  return useMutation({
    mutationFn: (input: Omit<CreateNameInput, 'individualId'>) =>
      createName({ ...input, individualId }),
    onSuccess: (_id, input) => invalidate(input.isPrimary === true),
  });
}

export function useUpdateName(individualId: string) {
  const invalidate = useInvalidateNames(individualId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNameInput; isPrimary: boolean }) =>
      updateName(id, input),
    onSuccess: (_result, { isPrimary }) => invalidate(isPrimary),
  });
}

export function useDeleteName(individualId: string) {
  const invalidate = useInvalidateNames(individualId);
  return useMutation({
    mutationFn: ({ id }: { id: string; isPrimary: boolean }) => deleteName(id),
    onSuccess: (_result, { isPrimary }) => invalidate(isPrimary),
  });
}

export function useSetPrimaryName(individualId: string) {
  const invalidate = useInvalidateNames(individualId);
  return useMutation({
    mutationFn: (nameId: string) => setPrimaryName(individualId, nameId),
    // Promoting a name always changes what the tree-wide lists display.
    onSuccess: () => invalidate(true),
  });
}
