import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventRoles } from "../lib/event-roles";
import { CreateEventRoleInput, UpdateEventRoleInput } from "../lib/db/types";

// Query keys
const eventRolesKeys = {
  all: ["event-roles"] as const,
  tree: (treeId: string) => [...eventRolesKeys.all, treeId] as const,
  eventRoles: (treeId: string) =>
    [...eventRolesKeys.tree(treeId), "event-roles"] as const,
  eventRole: (treeId: string, eventRoleId: string) =>
    [...eventRolesKeys.eventRoles(treeId), eventRoleId] as const,
};

// Queries
export function useEventRoles(treeId: string) {
  return useQuery({
    queryKey: eventRolesKeys.eventRoles(treeId),
    queryFn: () => eventRoles.getAll(treeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEventRole(treeId: string, eventRoleId: string) {
  return useQuery({
    queryKey: eventRolesKeys.eventRole(treeId, eventRoleId),
    queryFn: () => eventRoles.getById(treeId, eventRoleId),
    enabled: !!eventRoleId,
  });
}

// Mutations
export function useCreateEventRole(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventRole: CreateEventRoleInput) =>
      eventRoles.create(treeId, eventRole),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventRolesKeys.eventRoles(treeId),
      });
    },
  });
}

export function useUpdateEventRole(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventRoleId,
      updates,
    }: {
      eventRoleId: string;
      updates: UpdateEventRoleInput;
    }) => eventRoles.update(treeId, eventRoleId, updates),
    onSuccess: (updatedEventRole, { eventRoleId }) => {
      // Update specific event role in cache
      queryClient.setQueryData(
        eventRolesKeys.eventRole(treeId, eventRoleId),
        updatedEventRole,
      );

      // Invalidate list to refresh
      queryClient.invalidateQueries({
        queryKey: eventRolesKeys.eventRoles(treeId),
      });
    },
  });
}

export function useDeleteEventRole(treeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventRoleId: string) => eventRoles.delete(treeId, eventRoleId),
    onSuccess: (_, eventRoleId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: eventRolesKeys.eventRole(treeId, eventRoleId),
      });

      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: eventRolesKeys.eventRoles(treeId),
      });
    },
  });
}
