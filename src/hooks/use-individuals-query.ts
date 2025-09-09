import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { individuals } from "../lib/individuals";
import {
  CreateIndividualInput,
  UpdateIndividualInput,
  CreateNameInput,
  UpdateNameInput,
} from "../lib/db/types";

// Query keys
const individualsKeys = {
  all: ["individuals"] as const,
  tree: (treeId: string) => [...individualsKeys.all, treeId] as const,
  individuals: (treeId: string) =>
    [...individualsKeys.tree(treeId), "individuals"] as const,
  individual: (treeId: string, individualId: string) =>
    [...individualsKeys.individuals(treeId), individualId] as const,
  individualsWithNames: (treeId: string) =>
    [...individualsKeys.tree(treeId), "individuals-with-names"] as const,
  individualWithNames: (treeId: string, individualId: string) =>
    [
      ...individualsKeys.tree(treeId),
      "individual-with-names",
      individualId,
    ] as const,
  names: (treeId: string, individualId: string) =>
    [...individualsKeys.tree(treeId), "names", individualId] as const,
  primaryName: (treeId: string, individualId: string) =>
    [...individualsKeys.tree(treeId), "primary-name", individualId] as const,
};

// Individuals Queries
export function useIndividuals(treeId: string) {
  return useQuery({
    queryKey: individualsKeys.individuals(treeId),
    queryFn: () => individuals.getAll(treeId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useIndividual(treeId: string, individualId: string) {
  return useQuery({
    queryKey: individualsKeys.individual(treeId, individualId),
    queryFn: () => individuals.getById(treeId, individualId),
    enabled: !!individualId,
  });
}

export function useIndividualsWithNames(treeId: string) {
  return useQuery({
    queryKey: individualsKeys.individualsWithNames(treeId),
    queryFn: () => individuals.getAllWithNames(treeId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useIndividualWithNames(treeId: string, individualId: string) {
  return useQuery({
    queryKey: individualsKeys.individualWithNames(treeId, individualId),
    queryFn: () => individuals.getByIdWithNames(treeId, individualId),
    enabled: !!individualId,
  });
}

// Names Queries
export function useNames(treeId: string, individualId: string) {
  return useQuery({
    queryKey: individualsKeys.names(treeId, individualId),
    queryFn: () => individuals.getNames(treeId, individualId),
    enabled: !!individualId,
  });
}

export function usePrimaryName(treeId: string, individualId: string) {
  return useQuery({
    queryKey: individualsKeys.primaryName(treeId, individualId),
    queryFn: () => individuals.getPrimaryName(treeId, individualId),
    enabled: !!individualId,
  });
}

// Individuals Mutations
export function useCreateIndividual(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (individual: CreateIndividualInput) =>
      individuals.create(treeId, individual),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: individualsKeys.individuals(treeId),
      });
      queryClient.invalidateQueries({
        queryKey: individualsKeys.individualsWithNames(treeId),
      });
    },
  });
}

export function useUpdateIndividual(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      individualId,
      updates,
    }: {
      individualId: string;
      updates: UpdateIndividualInput;
    }) => individuals.update(treeId, individualId, updates),
    onSuccess: (updatedIndividual, { individualId }) => {
      queryClient.setQueryData(
        individualsKeys.individual(treeId, individualId),
        updatedIndividual,
      );
      queryClient.invalidateQueries({
        queryKey: individualsKeys.individuals(treeId),
      });
      queryClient.invalidateQueries({
        queryKey: individualsKeys.individualsWithNames(treeId),
      });
      queryClient.invalidateQueries({
        queryKey: individualsKeys.individualWithNames(treeId, individualId),
      });
    },
  });
}

export function useDeleteIndividual(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (individualId: string) =>
      individuals.delete(treeId, individualId),
    onSuccess: (_, individualId) => {
      queryClient.removeQueries({
        queryKey: individualsKeys.individual(treeId, individualId),
      });
      queryClient.removeQueries({
        queryKey: individualsKeys.individualWithNames(treeId, individualId),
      });
      queryClient.removeQueries({
        queryKey: individualsKeys.names(treeId, individualId),
      });
      queryClient.removeQueries({
        queryKey: individualsKeys.primaryName(treeId, individualId),
      });

      queryClient.invalidateQueries({
        queryKey: individualsKeys.individuals(treeId),
      });
      queryClient.invalidateQueries({
        queryKey: individualsKeys.individualsWithNames(treeId),
      });
    },
  });
}

// Names Mutations
export function useCreateName(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: CreateNameInput) => individuals.createName(treeId, name),
    onSuccess: (newName) => {
      const individualId = newName.individual_id;

      queryClient.invalidateQueries({
        queryKey: individualsKeys.names(treeId, individualId),
      });
      queryClient.invalidateQueries({
        queryKey: individualsKeys.primaryName(treeId, individualId),
      });
      queryClient.invalidateQueries({
        queryKey: individualsKeys.individualWithNames(treeId, individualId),
      });
      queryClient.invalidateQueries({
        queryKey: individualsKeys.individualsWithNames(treeId),
      });
    },
  });
}

export function useUpdateName(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      nameId,
      updates,
    }: {
      nameId: string;
      updates: UpdateNameInput;
    }) => individuals.updateName(treeId, nameId, updates),
    onSuccess: (updatedName) => {
      const individualId = updatedName.individual_id;

      queryClient.invalidateQueries({
        queryKey: individualsKeys.names(treeId, individualId),
      });
      queryClient.invalidateQueries({
        queryKey: individualsKeys.primaryName(treeId, individualId),
      });
      queryClient.invalidateQueries({
        queryKey: individualsKeys.individualWithNames(treeId, individualId),
      });
      queryClient.invalidateQueries({
        queryKey: individualsKeys.individualsWithNames(treeId),
      });
    },
  });
}

export function useDeleteName(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nameId }: { nameId: string; individualId: string }) =>
      individuals.deleteName(treeId, nameId),
    onSuccess: (_, { individualId }) => {
      queryClient.invalidateQueries({
        queryKey: individualsKeys.names(treeId, individualId),
      });
      queryClient.invalidateQueries({
        queryKey: individualsKeys.primaryName(treeId, individualId),
      });
      queryClient.invalidateQueries({
        queryKey: individualsKeys.individualWithNames(treeId, individualId),
      });
      queryClient.invalidateQueries({
        queryKey: individualsKeys.individualsWithNames(treeId),
      });
    },
  });
}
