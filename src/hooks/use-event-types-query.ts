import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventTypes } from "../lib/event-types";
import { CreateEventTypeInput, UpdateEventTypeInput } from "../lib/db/types";

// Query keys
const eventTypesKeys = {
  all: ["event-types"] as const,
  tree: (treeId: string) => [...eventTypesKeys.all, treeId] as const,
  eventTypes: (treeId: string) =>
    [...eventTypesKeys.tree(treeId), "event-types"] as const,
  eventType: (treeId: string, eventTypeId: string) =>
    [...eventTypesKeys.eventTypes(treeId), eventTypeId] as const,
};

// Queries
export function useEventTypes(treeId: string) {
  return useQuery({
    queryKey: eventTypesKeys.eventTypes(treeId),
    queryFn: () => eventTypes.getAll(treeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEventType(treeId: string, eventTypeId: string) {
  return useQuery({
    queryKey: eventTypesKeys.eventType(treeId, eventTypeId),
    queryFn: () => eventTypes.getById(treeId, eventTypeId),
    enabled: !!eventTypeId,
  });
}

// Mutations
export function useCreateEventType(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventType: CreateEventTypeInput) =>
      eventTypes.create(treeId, eventType),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventTypesKeys.eventTypes(treeId),
      });
    },
  });
}

export function useUpdateEventType(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventTypeId,
      updates,
    }: {
      eventTypeId: string;
      updates: UpdateEventTypeInput;
    }) => eventTypes.update(treeId, eventTypeId, updates),
    onSuccess: (updatedEventType, { eventTypeId }) => {
      // Update specific event type in cache
      queryClient.setQueryData(
        eventTypesKeys.eventType(treeId, eventTypeId),
        updatedEventType,
      );

      // Invalidate list to refresh
      queryClient.invalidateQueries({
        queryKey: eventTypesKeys.eventTypes(treeId),
      });
    },
  });
}

export function useDeleteEventType(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventTypeId: string) => eventTypes.delete(treeId, eventTypeId),
    onSuccess: (_, eventTypeId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: eventTypesKeys.eventType(treeId, eventTypeId),
      });

      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: eventTypesKeys.eventTypes(treeId),
      });
    },
  });
}
