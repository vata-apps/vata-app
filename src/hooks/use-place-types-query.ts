import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { placeTypes } from "../lib/place-types";
import { CreatePlaceTypeInput, UpdatePlaceTypeInput } from "../lib/db/types";

// Query keys
const placeTypesKeys = {
  all: ["place-types"] as const,
  tree: (treeId: string) => [...placeTypesKeys.all, treeId] as const,
  placeTypes: (treeId: string) =>
    [...placeTypesKeys.tree(treeId), "place-types"] as const,
  placeType: (treeId: string, placeTypeId: string) =>
    [...placeTypesKeys.placeTypes(treeId), placeTypeId] as const,
  usage: (treeId: string, placeTypeId: string) =>
    [...placeTypesKeys.tree(treeId), "usage", placeTypeId] as const,
};

// Queries
export function usePlaceTypes(treeId: string) {
  return useQuery({
    queryKey: placeTypesKeys.placeTypes(treeId),
    queryFn: () => placeTypes.getAll(treeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePlaceType(treeId: string, placeTypeId: string) {
  return useQuery({
    queryKey: placeTypesKeys.placeType(treeId, placeTypeId),
    queryFn: () => placeTypes.getById(treeId, placeTypeId),
    enabled: !!placeTypeId,
  });
}

export function usePlaceTypeUsage(treeId: string, placeTypeId: string) {
  return useQuery({
    queryKey: placeTypesKeys.usage(treeId, placeTypeId),
    queryFn: () => placeTypes.getUsageCount(treeId, placeTypeId),
    enabled: !!placeTypeId,
  });
}

// Mutations
export function useCreatePlaceType(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeType: CreatePlaceTypeInput) =>
      placeTypes.create(treeId, placeType),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: placeTypesKeys.placeTypes(treeId),
      });
      // Also invalidate the old query key used in places page
      queryClient.invalidateQueries({
        queryKey: ["places", treeId, "place-types"],
      });
    },
  });
}

export function useUpdatePlaceType(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      placeTypeId,
      updates,
    }: {
      placeTypeId: string;
      updates: UpdatePlaceTypeInput;
    }) => placeTypes.update(treeId, placeTypeId, updates),
    onSuccess: (updatedPlaceType, { placeTypeId }) => {
      // Update specific place type in cache
      queryClient.setQueryData(
        placeTypesKeys.placeType(treeId, placeTypeId),
        updatedPlaceType,
      );

      // Invalidate list to refresh
      queryClient.invalidateQueries({
        queryKey: placeTypesKeys.placeTypes(treeId),
      });

      // Also invalidate the old query key used in places page
      queryClient.invalidateQueries({
        queryKey: ["places", treeId, "place-types"],
      });

      // Invalidate places queries that might show place type names
      queryClient.invalidateQueries({
        queryKey: ["places", treeId],
      });
    },
  });
}

export function useDeletePlaceType(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeTypeId: string) => placeTypes.delete(treeId, placeTypeId),
    onSuccess: (_, placeTypeId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: placeTypesKeys.placeType(treeId, placeTypeId),
      });
      queryClient.removeQueries({
        queryKey: placeTypesKeys.usage(treeId, placeTypeId),
      });

      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: placeTypesKeys.placeTypes(treeId),
      });

      // Also invalidate the old query key used in places page
      queryClient.invalidateQueries({
        queryKey: ["places", treeId, "place-types"],
      });

      // Invalidate places queries since place types might be referenced
      queryClient.invalidateQueries({
        queryKey: ["places", treeId],
      });
    },
  });
}
