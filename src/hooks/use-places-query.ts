import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { places } from "../lib/places";
import { Place, PlaceType, CreatePlaceInput, UpdatePlaceInput, CreatePlaceTypeInput } from "../lib/db/types";

// Query keys
const placesKeys = {
  all: ['places'] as const,
  tree: (treeId: string) => [...placesKeys.all, treeId] as const,
  places: (treeId: string) => [...placesKeys.tree(treeId), 'places'] as const,
  placeTypes: (treeId: string) => [...placesKeys.tree(treeId), 'place-types'] as const,
  place: (treeId: string, placeId: string) => [...placesKeys.places(treeId), placeId] as const,
  placesWithTypes: (treeId: string) => [...placesKeys.tree(treeId), 'places-with-types'] as const,
  children: (treeId: string, parentId: string) => [...placesKeys.tree(treeId), 'children', parentId] as const,
  childrenCount: (treeId: string, parentId: string) => [...placesKeys.tree(treeId), 'children-count', parentId] as const,
};

// Place Types Queries
export function usePlaceTypes(treeId: string) {
  return useQuery({
    queryKey: placesKeys.placeTypes(treeId),
    queryFn: () => places.getPlaceTypes(treeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePlaceType(treeId: string, placeTypeId: string) {
  return useQuery({
    queryKey: [...placesKeys.placeTypes(treeId), placeTypeId],
    queryFn: () => places.getPlaceType(treeId, placeTypeId),
    enabled: !!placeTypeId,
  });
}

export function useCreatePlaceType(treeId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (placeType: CreatePlaceTypeInput) => 
      places.createPlaceType(treeId, placeType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placesKeys.placeTypes(treeId) });
    },
  });
}

// Places Queries
export function usePlaces(treeId: string) {
  return useQuery({
    queryKey: placesKeys.places(treeId),
    queryFn: () => places.getAll(treeId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePlace(treeId: string, placeId: string) {
  return useQuery({
    queryKey: placesKeys.place(treeId, placeId),
    queryFn: () => places.getById(treeId, placeId),
    enabled: !!placeId,
  });
}

export function usePlacesWithTypes(treeId: string) {
  return useQuery({
    queryKey: placesKeys.placesWithTypes(treeId),
    queryFn: () => places.getAllWithTypes(treeId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useChildren(treeId: string, parentId: string) {
  return useQuery({
    queryKey: placesKeys.children(treeId, parentId),
    queryFn: () => places.getChildren(treeId, parentId),
    enabled: !!parentId,
  });
}

export function useChildrenCount(treeId: string, parentId: string) {
  return useQuery({
    queryKey: placesKeys.childrenCount(treeId, parentId),
    queryFn: () => places.getChildrenCount(treeId, parentId),
    enabled: !!parentId,
  });
}

// Places Mutations
export function useCreatePlace(treeId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (place: CreatePlaceInput) => 
      places.create(treeId, place),
    onSuccess: (newPlace) => {
      // Invalidate and refetch places list
      queryClient.invalidateQueries({ queryKey: placesKeys.places(treeId) });
      queryClient.invalidateQueries({ queryKey: placesKeys.placesWithTypes(treeId) });
      
      // If the place has a parent, invalidate children queries
      if (newPlace.parentId) {
        queryClient.invalidateQueries({ 
          queryKey: placesKeys.children(treeId, newPlace.parentId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: placesKeys.childrenCount(treeId, newPlace.parentId) 
        });
      }
    },
  });
}

export function useUpdatePlace(treeId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ placeId, updates }: { placeId: string; updates: UpdatePlaceInput }) => 
      places.update(treeId, placeId, updates),
    onSuccess: (updatedPlace, { placeId }) => {
      // Update the specific place in cache
      queryClient.setQueryData(placesKeys.place(treeId, placeId), updatedPlace);
      
      // Invalidate lists that might contain this place
      queryClient.invalidateQueries({ queryKey: placesKeys.places(treeId) });
      queryClient.invalidateQueries({ queryKey: placesKeys.placesWithTypes(treeId) });
      
      // If the place has a parent, invalidate children queries
      if (updatedPlace.parentId) {
        queryClient.invalidateQueries({ 
          queryKey: placesKeys.children(treeId, updatedPlace.parentId) 
        });
      }
    },
  });
}

export function useDeletePlace(treeId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (placeId: string) => places.delete(treeId, placeId),
    onSuccess: (_, placeId) => {
      // Remove the place from cache
      queryClient.removeQueries({ queryKey: placesKeys.place(treeId, placeId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: placesKeys.places(treeId) });
      queryClient.invalidateQueries({ queryKey: placesKeys.placesWithTypes(treeId) });
      
      // Invalidate all children queries since we don't know which place was the parent
      queryClient.invalidateQueries({ 
        queryKey: placesKeys.tree(treeId),
        predicate: (query) => {
          const key = query.queryKey;
          return key.includes('children') || key.includes('children-count');
        }
      });
    },
  });
}

// Initialize database
export function useInitializePlacesDb(treeId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => places.initDatabase(treeId),
    onSuccess: () => {
      // Invalidate all queries for this tree to refetch fresh data
      queryClient.invalidateQueries({ queryKey: placesKeys.tree(treeId) });
    },
  });
}