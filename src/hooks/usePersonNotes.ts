import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '$/lib/query-keys';
import { createNote, deleteNote, getNotesForIndividual, updateNote } from '$db-tree/notes';
import type { CreateNoteInput, UpdateNoteInput } from '$types/database';

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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.personNotes(individualId) }),
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
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.personNotes(individualId) }),
  });
}
