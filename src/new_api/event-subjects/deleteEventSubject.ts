import { supabase } from "@/lib/supabase";

interface Params {
  eventSubjectId: string;
}

/**
 * Deletes an event subject from the database
 *
 * @param eventSubjectId - The unique identifier of the event subject to delete
 * @throws {Error} When the database deletion fails
 */
export async function deleteEventSubject(params: Params) {
  const { eventSubjectId } = params;

  const { error } = await supabase
    .from("event_subjects")
    .delete()
    .eq("id", eventSubjectId);

  if (error) throw error;
}
