import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import {
  getAllEvents,
  getEventWithDetails,
  getEventTypes,
  createEvent,
  updateEvent,
  deleteEvent,
} from '$db-tree/events';
import type { CreateEventInput, UpdateEventInput, EventCategory } from '$/types/database';

export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: getAllEvents,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.event(id),
    queryFn: () => getEventWithDetails(id),
  });
}

export function useEventTypes(category?: EventCategory) {
  return useQuery({
    queryKey: category ? ([...queryKeys.eventTypes, category] as const) : queryKeys.eventTypes,
    queryFn: () => getEventTypes(category),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
      queryClient.invalidateQueries({ queryKey: queryKeys.families });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEventInput }) =>
      updateEvent(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.event(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
      queryClient.invalidateQueries({ queryKey: queryKeys.families });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.event(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
      queryClient.invalidateQueries({ queryKey: queryKeys.families });
    },
  });
}
