import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import {
  IndividualManager,
  type CreateIndividualWithNameInput,
} from '$/managers/IndividualManager';
import type { UpdateIndividualInput } from '$/types/database';

export function useIndividuals() {
  return useQuery({
    queryKey: queryKeys.individuals,
    queryFn: () => IndividualManager.getAll(),
  });
}

export function useIndividual(id: string) {
  return useQuery({
    queryKey: queryKeys.individual(id),
    queryFn: () => IndividualManager.getById(id),
  });
}

export function useCreateIndividual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateIndividualWithNameInput) => IndividualManager.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
    },
  });
}

export function useUpdateIndividual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateIndividualInput }) =>
      IndividualManager.update(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
      queryClient.invalidateQueries({ queryKey: queryKeys.individual(id) });
    },
  });
}

export function useDeleteIndividual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => IndividualManager.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
      queryClient.invalidateQueries({ queryKey: queryKeys.individual(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.families });
    },
  });
}
