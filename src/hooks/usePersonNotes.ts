import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { queryKeys } from '$/lib/query-keys';
import {
  countNotesForEvent,
  countNotesForFamilyMember,
  createNote,
  deleteNote,
  getNotesForIndividual,
  updateNote,
} from '$db-tree/notes';
import type { CreateNoteInput, NoteScope, UpdateNoteInput } from '$types/database';

/**
 * A note's target count never changes on edit (scope/target are fixed at
 * creation, see `note-detail.tsx`'s doc comment) — only create/delete need
 * this. Invalidates the whole `eventNoteCount`/`relationNoteCount` id-keyed
 * family rather than one specific id: at most one such query is ever mounted
 * at a time (the currently-selected Events/Relations row's delete
 * confirmation), so the broader invalidation costs nothing extra in
 * practice and avoids threading the target id through every call site.
 */
function invalidateNoteCount(queryClient: QueryClient, scope: NoteScope): void {
  if (scope === 'event') {
    queryClient.invalidateQueries({ queryKey: queryKeys.eventNoteCounts });
  }
  if (scope === 'relation') {
    queryClient.invalidateQueries({ queryKey: queryKeys.relationNoteCounts });
  }
}

/**
 * Load every note surfaced on one person's Notes tab: their own, plus notes
 * on their events and relations (all share this person's `individualId`, see
 * `db/trees/notes.ts`'s doc comment).
 */
export function usePersonNotes(individualId: string) {
  return useQuery({
    queryKey: queryKeys.personNotes(individualId),
    queryFn: () => getNotesForIndividual(individualId),
  });
}

export function useCreateNote(individualId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateNoteInput, 'individualId'>) =>
      createNote({ ...input, individualId }),
    onSuccess: (_result, input) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personNotes(individualId) });
      invalidateNoteCount(queryClient, input.scope);
    },
  });
}

export function useUpdateNote(individualId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) => updateNote(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.personNotes(individualId) }),
  });
}

export function useDeleteNote(individualId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; scope: NoteScope }) => deleteNote(id),
    onSuccess: (_result, { scope }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personNotes(individualId) });
      invalidateNoteCount(queryClient, scope);
    },
  });
}

/**
 * How many notes are attached to one event — feeds the "this will also
 * delete N notes" warning on the Events tab's delete confirmation
 * (`notes.event_id` is `ON DELETE CASCADE`). `eventId` is `null` while
 * nothing removable is selected.
 */
export function useEventNoteCount(eventId: string | null) {
  return useQuery({
    queryKey: queryKeys.eventNoteCount(eventId ?? ''),
    queryFn: () => countNotesForEvent(eventId as string),
    enabled: eventId !== null,
  });
}

/**
 * How many notes are attached to one relation (a `family_members` row) —
 * feeds the same warning on the Relations tab. `familyMemberId` is `null`
 * while nothing removable is selected, and callers must also pass `null`
 * for a father/mother row: `removeParent` deletes that parent's own
 * husband/wife-role row, never the subject's `parentMembership.memberId`
 * that relation notes are actually attached to (see `PersonNotesPage`'s
 * `flattenRelationTargets`), so no note is ever at risk there.
 */
export function useRelationNoteCount(familyMemberId: string | null) {
  return useQuery({
    queryKey: queryKeys.relationNoteCount(familyMemberId ?? ''),
    queryFn: () => countNotesForFamilyMember(familyMemberId as string),
    enabled: familyMemberId !== null,
  });
}
