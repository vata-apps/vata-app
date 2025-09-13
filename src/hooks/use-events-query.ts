import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { events } from "../lib/events";
import {
  Event,
  EventParticipant,
  CreateEventInput,
  UpdateEventInput,
  CreateEventParticipantInput,
  UpdateEventParticipantInput,
} from "../lib/db/types";

export function useEventsQuery(treeName: string) {
  return useQuery({
    queryKey: ["events", treeName],
    queryFn: () => events.getAllWithDetails(treeName),
    enabled: !!treeName,
  });
}

export function useEventQuery(treeName: string, eventId: string) {
  return useQuery({
    queryKey: ["events", treeName, eventId],
    queryFn: () => events.getByIdWithParticipants(treeName, eventId),
    enabled: !!treeName && !!eventId,
  });
}

export function useCreateEventMutation(treeName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventInput) => events.create(treeName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", treeName] });
    },
  });
}

export function useCreateEventWithSubjectMutation(treeName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      event: CreateEventInput;
      subjectIndividualId: string;
      subjectRoleId: string;
    }) =>
      events.createWithSubject(
        treeName,
        data.event,
        data.subjectIndividualId,
        data.subjectRoleId,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", treeName] });
    },
  });
}

export function useCreateMarriageEventMutation(treeName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      event: CreateEventInput;
      husbandId: string;
      wifeId: string;
      husbandRoleId: string;
      wifeRoleId: string;
    }) =>
      events.createMarriage(
        treeName,
        data.event,
        data.husbandId,
        data.wifeId,
        data.husbandRoleId,
        data.wifeRoleId,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", treeName] });
    },
  });
}

export function useValidateEventParticipantsQuery(
  treeName: string,
  eventId: string,
) {
  return useQuery({
    queryKey: ["event-validation", treeName, eventId],
    queryFn: () => events.validateEventParticipants(treeName, eventId),
    enabled: !!treeName && !!eventId,
  });
}

export function useIsMarriageEventTypeQuery(treeName: string, typeId: string) {
  return useQuery({
    queryKey: ["event-type-marriage", treeName, typeId],
    queryFn: () => events.isMarriageEventType(treeName, typeId),
    enabled: !!treeName && !!typeId,
  });
}

export function useUpdateEventMutation(treeName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; updates: UpdateEventInput }) =>
      events.update(treeName, data.id, data.updates),
    onSuccess: (updatedEvent: Event) => {
      queryClient.invalidateQueries({ queryKey: ["events", treeName] });
      queryClient.invalidateQueries({
        queryKey: ["events", treeName, updatedEvent.id],
      });
    },
  });
}

export function useDeleteEventMutation(treeName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => events.delete(treeName, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", treeName] });
    },
  });
}

// Event Participants hooks
export function useEventParticipantsQuery(treeName: string, eventId: string) {
  return useQuery({
    queryKey: ["event-participants", treeName, eventId],
    queryFn: () => events.getParticipants(treeName, eventId),
    enabled: !!treeName && !!eventId,
  });
}

export function useAddEventParticipantMutation(treeName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventParticipantInput) =>
      events.addParticipant(treeName, data),
    onSuccess: (participant: EventParticipant) => {
      queryClient.invalidateQueries({
        queryKey: ["event-participants", treeName, participant.event_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["events", treeName, participant.event_id],
      });
      queryClient.invalidateQueries({ queryKey: ["events", treeName] });
    },
  });
}

export function useUpdateEventParticipantMutation(treeName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; updates: UpdateEventParticipantInput }) =>
      events.updateParticipant(treeName, data.id, data.updates),
    onSuccess: (participant: EventParticipant) => {
      queryClient.invalidateQueries({
        queryKey: ["event-participants", treeName, participant.event_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["events", treeName, participant.event_id],
      });
    },
  });
}

export function useRemoveEventParticipantMutation(treeName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; eventId: string }) =>
      events.removeParticipant(treeName, data.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["event-participants", treeName, variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["events", treeName, variables.eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["events", treeName] });
    },
  });
}

export function useValidateSubjectQuery(treeName: string, eventId: string) {
  return useQuery({
    queryKey: ["event-subject-validation", treeName, eventId],
    queryFn: () => events.validateSubjectExists(treeName, eventId),
    enabled: !!treeName && !!eventId,
  });
}
