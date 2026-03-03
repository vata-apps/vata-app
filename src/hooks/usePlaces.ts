import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import {
  getAllPlaces,
  getPlaceWithHierarchy,
  searchPlaces,
  createPlace,
  updatePlace,
  deletePlace,
} from '$db-tree/places';
import type { CreatePlaceInput, UpdatePlaceInput } from '$/types/database';

export function usePlaces() {
  return useQuery({
    queryKey: queryKeys.places,
    queryFn: getAllPlaces,
  });
}

export function usePlace(id: string) {
  return useQuery({
    queryKey: queryKeys.place(id),
    queryFn: () => getPlaceWithHierarchy(id),
  });
}

export function useSearchPlaces(query: string) {
  return useQuery({
    queryKey: [...queryKeys.places, 'search', query] as const,
    queryFn: () => searchPlaces(query),
    enabled: query.length > 0,
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlaceInput) => createPlace(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.places });
    },
  });
}

export function useUpdatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePlaceInput }) => updatePlace(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.places });
      queryClient.invalidateQueries({ queryKey: queryKeys.place(id) });
    },
  });
}

export function useDeletePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlace(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.places });
      queryClient.invalidateQueries({ queryKey: queryKeys.place(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
    },
  });
}
