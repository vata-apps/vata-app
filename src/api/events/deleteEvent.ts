import { supabase } from "@/lib/supabase";

/**
 * Deletes an event and all associated data
 *
 * This function handles event deletion with the following logic:
 * 1. All event_subjects will be automatically deleted (CASCADE constraint)
 * 2. All event_participants will be automatically deleted (CASCADE constraint)
 * 3. The event itself is deleted
 * 4. Event types are preserved (RESTRICT constraint)
 */
export async function deleteEvent(treeId: string, eventId: string) {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("tree_id", treeId);

  if (error) throw error;

  return { success: true };
}

export type DeleteEventResult = Awaited<ReturnType<typeof deleteEvent>>;
