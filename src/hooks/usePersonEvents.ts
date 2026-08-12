import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '$/lib/query-keys';
import { countCitationsForEntities, getCitationsForEvent } from '$db-tree/citations';
import {
  addEventParticipant,
  createEventWithParticipant,
  deleteEvent,
  getEventParticipantsWithNames,
  removeEventParticipant,
  updateEvent,
  updateEventParticipant,
} from '$db-tree/events';
import {
  getPersonEvents,
  type PersonEventEntry,
  type PersonEventScope,
} from '$db-tree/person-events';
import { IndividualManager } from '$managers/IndividualManager';
import type { CreateEventInput, ParticipantRole, UpdateEventInput } from '$types/database';

/** A person's event, with how many sources back it. */
export interface PersonEventRow extends PersonEventEntry {
  sourceCount: number;
}

/**
 * Load every event connected to one individual for their Events tab, tagged by
 * scope (principal / union / secondary) so the view can filter by scope level,
 * together with each event's citation count in a single extra query rather
 * than one per row (see {@link countCitationsForEntities}).
 */
export function usePersonEvents(individualId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.personEvents(individualId),
    queryFn: async (): Promise<PersonEventRow[]> => {
      const events = await getPersonEvents(individualId);
      const counts = await countCitationsForEntities(
        'event',
        events.map((event) => event.id)
      );
      return events.map((event) => ({ ...event, sourceCount: counts.get(event.id) ?? 0 }));
    },
    enabled: options?.enabled ?? true,
  });
}

/**
 * Everything that changes when an event changes: always this person's own
 * events list and event timeline; the Overview tab's summary only when the
 * event is `principal` or `union` (a `secondary` event — this person as
 * witness/informant/godparent on someone else's record — can never appear in
 * the Overview's own-events/marriages, which are filtered to those two
 * scopes); and the tree-wide lists that display a birth/death date only when
 * the edit could move one of those.
 *
 * The split matters for the same reason as `usePersonNames`'s
 * `useInvalidateNames`: the tab persists each field on blur, and the people
 * rail keeps `individuals` mounted beside it, so invalidating tree-wide keys
 * unconditionally would reload every individual and every family per
 * keystroke-blur. The caller decides `affectsTreeWideDisplay` from the
 * event's own type tag, which it already has loaded for the type Select.
 */
function useInvalidateEvents(
  individualId: string
): (options: { scope: PersonEventScope; affectsTreeWideDisplay: boolean }) => void {
  const queryClient = useQueryClient();

  return ({ scope, affectsTreeWideDisplay }) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.personEvents(individualId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.eventTimeline(individualId) });

    if (scope !== 'secondary') {
      queryClient.invalidateQueries({ queryKey: queryKeys.personOverview(individualId) });
    }

    if (affectsTreeWideDisplay) {
      queryClient.invalidateQueries({ queryKey: queryKeys.individual(individualId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
      queryClient.invalidateQueries({ queryKey: queryKeys.families });
    }
  };
}

export function useCreateEvent(individualId: string) {
  const invalidate = useInvalidateEvents(individualId);
  return useMutation({
    mutationFn: ({ input }: { input: CreateEventInput; affectsTreeWideDisplay: boolean }) =>
      createEventWithParticipant(input, { individualId, role: 'principal' }),
    // A draft always adds this person as `principal` — see the `mutationFn` above.
    onSuccess: (_result, { affectsTreeWideDisplay }) =>
      invalidate({ scope: 'principal', affectsTreeWideDisplay }),
  });
}

export function useUpdateEvent(individualId: string) {
  const invalidate = useInvalidateEvents(individualId);
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateEventInput;
      scope: PersonEventScope;
      affectsTreeWideDisplay: boolean;
    }) => updateEvent(id, input),
    onSuccess: (_result, { scope, affectsTreeWideDisplay }) =>
      invalidate({ scope, affectsTreeWideDisplay }),
  });
}

export function useDeleteEvent(individualId: string) {
  const invalidate = useInvalidateEvents(individualId);
  return useMutation({
    mutationFn: ({
      id,
    }: {
      id: string;
      scope: PersonEventScope;
      affectsTreeWideDisplay: boolean;
    }) => deleteEvent(id),
    onSuccess: (_result, { scope, affectsTreeWideDisplay }) =>
      invalidate({ scope, affectsTreeWideDisplay }),
  });
}

/**
 * The sources backing one saved event, for the detail panel's read-only
 * Sources section. `eventId` is `null` while a draft is selected.
 */
export function useEventCitations(eventId: string | null) {
  return useQuery({
    queryKey: queryKeys.eventCitations(eventId ?? ''),
    queryFn: () => getCitationsForEvent(eventId as string),
    enabled: eventId !== null,
  });
}

/**
 * An event's individual participants (family-linked rows, e.g. the couple on
 * a union event, are left out — see `getEventParticipantsWithNames`),
 * resolved to display names. The caller filters out the tab's own person to
 * get the detail panel's "other participants" list. `eventId` is `null`
 * while a draft is selected — nothing can have participants added to a
 * record that does not exist yet.
 */
export function useEventParticipants(eventId: string | null) {
  return useQuery({
    queryKey: queryKeys.eventParticipants(eventId ?? ''),
    queryFn: () => getEventParticipantsWithNames(eventId as string),
    enabled: eventId !== null,
  });
}

/**
 * Invalidation shared by every participant mutation: this event's own
 * participants and this tab's list. `otherIndividualId` also refreshes the
 * added/removed participant's own Events tab — without it, a person just
 * added as a witness never sees the event under "other roles" until reload.
 */
function useInvalidateParticipants(
  individualId: string
): (eventId: string, otherIndividualId?: string) => void {
  const queryClient = useQueryClient();
  return (eventId: string, otherIndividualId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.eventParticipants(eventId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.personEvents(individualId) });
    if (otherIndividualId && otherIndividualId !== individualId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.personEvents(otherIndividualId) });
    }
  };
}

/** An existing person picked from the entity picker, or the seed fields for a person to create on the fly. */
export interface AddEventParticipantInput {
  eventId: string;
  role: ParticipantRole;
  individualId?: string;
  createNew?: { givenNames?: string; surname?: string };
}

export function useAddEventParticipant(individualId: string) {
  const invalidate = useInvalidateParticipants(individualId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddEventParticipantInput) => {
      const participantIndividualId =
        input.individualId ?? (await IndividualManager.create({ name: input.createNew }));
      const participantId = await addEventParticipant({
        eventId: input.eventId,
        individualId: participantIndividualId,
        role: input.role,
      });
      return { participantId, individualId: participantIndividualId };
    },
    onSuccess: (result, input) => {
      invalidate(input.eventId, result.individualId);
      // A brand-new person must show up in every tree-wide list that reads `individuals`.
      if (input.createNew) queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
    },
  });
}

export function useRemoveEventParticipant(individualId: string) {
  const invalidate = useInvalidateParticipants(individualId);
  return useMutation({
    mutationFn: ({
      eventId,
      participantId,
    }: {
      eventId: string;
      participantId: string;
      /** The removed row's own individual — the caller already has it loaded (it's what's rendered), so this only refreshes their Events tab. */
      participantIndividualId?: string;
    }) => removeEventParticipant(eventId, participantId),
    onSuccess: (_result, { eventId, participantIndividualId }) =>
      invalidate(eventId, participantIndividualId),
  });
}

export function useUpdateParticipantRole(individualId: string) {
  const invalidate = useInvalidateParticipants(individualId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      participantId,
      role,
    }: {
      eventId: string;
      participantId: string;
      role: ParticipantRole;
      /** Set when this is the tab's own person's participant row — changing it can move their `scope` classification (principal ↔ secondary), which the Overview tab's own-events/marriages summary is filtered on. Omit for another participant's role, which never affects this person's own scope. */
      isOwnParticipant?: boolean;
      /** The edited row's own individual, when it isn't the tab's own person — the caller already has it loaded, so this only refreshes their Events tab. */
      participantIndividualId?: string;
    }) => updateEventParticipant(participantId, { role }),
    onSuccess: (_result, { eventId, isOwnParticipant, participantIndividualId }) => {
      invalidate(eventId, participantIndividualId);
      if (isOwnParticipant) {
        queryClient.invalidateQueries({ queryKey: queryKeys.personOverview(individualId) });
      }
    },
  });
}
