import { supabase } from "@/lib/supabase";

interface Params {
  eventParticipantId: string;
}

/**
 * Deletes an event participant from the database
 *
 * @param eventParticipantId - The unique identifier of the event participant to delete
 * @throws {Error} When the database deletion fails
 */
export async function deleteEventParticipant(params: Params) {
  const { eventParticipantId } = params;

  const { error } = await supabase
    .from("event_participants")
    .delete()
    .eq("id", eventParticipantId);

  if (error) throw error;
}
