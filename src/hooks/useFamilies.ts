import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { FamilyManager } from '$/managers/FamilyManager';
import type { CreateFamilyInput, UpdateFamilyInput, Pedigree } from '$/types/database';

export function useFamilies() {
  return useQuery({
    queryKey: queryKeys.families,
    queryFn: () => FamilyManager.getAll(),
  });
}

export function useFamily(id: string) {
  return useQuery({
    queryKey: queryKeys.family(id),
    queryFn: () => FamilyManager.getById(id),
  });
}

export function useCreateFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      husbandId,
      wifeId,
    }: {
      input: CreateFamilyInput;
      husbandId?: string;
      wifeId?: string;
    }) => FamilyManager.create(input, husbandId, wifeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.families });
    },
  });
}

export function useUpdateFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFamilyInput }) =>
      FamilyManager.update(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.families });
      queryClient.invalidateQueries({ queryKey: queryKeys.family(id) });
    },
  });
}

export function useDeleteFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => FamilyManager.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.families });
      queryClient.invalidateQueries({ queryKey: queryKeys.family(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
    },
  });
}

export function useAddChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      familyId,
      individualId,
      pedigree,
    }: {
      familyId: string;
      individualId: string;
      pedigree?: Pedigree;
    }) => FamilyManager.addChild(familyId, individualId, pedigree),
    onSuccess: (_data, { familyId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.family(familyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.families });
    },
  });
}

export function useRemoveChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ familyId, individualId }: { familyId: string; individualId: string }) =>
      FamilyManager.removeChild(familyId, individualId),
    onSuccess: (_data, { familyId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.family(familyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.families });
    },
  });
}
