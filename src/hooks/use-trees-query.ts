import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trees } from "../lib/trees";

// Query keys
const treesKeys = {
  all: ["trees"] as const,
  list: () => [...treesKeys.all, "list"] as const,
};

// Trees Queries
export function useTrees() {
  return useQuery({
    queryKey: treesKeys.list(),
    queryFn: () => trees.list(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 3,
  });
}

// Trees Mutations
export function useCreateTree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => trees.create(name, description),
    onSuccess: () => {
      // Invalidate and refetch trees list
      queryClient.invalidateQueries({ queryKey: treesKeys.list() });
    },
  });
}

export function useDeleteTree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => trees.delete(name),
    onSuccess: () => {
      // Invalidate and refetch trees list
      queryClient.invalidateQueries({ queryKey: treesKeys.list() });
    },
  });
}

export function useUpdateLastOpened() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => trees.updateLastOpened(name),
    onSuccess: () => {
      // Invalidate trees list to reflect updated lastOpened timestamp
      queryClient.invalidateQueries({ queryKey: treesKeys.list() });
    },
  });
}

// Initialize trees metadata database
export function useInitializeTrees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => trees.initialize(),
    onSuccess: () => {
      // Invalidate trees list in case initialization affected the data
      queryClient.invalidateQueries({ queryKey: treesKeys.list() });
    },
  });
}

export function useRebuildDbEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => trees.rebuildDbEntry(name),
    onSuccess: () => {
      // Invalidate and refetch trees list
      queryClient.invalidateQueries({ queryKey: treesKeys.list() });
    },
  });
}
