import { supabase } from "@/lib/supabase";

interface Params {
  eventId: string;
}

/**
 * Deletes an event from the database
 *
 * @param eventId - The unique identifier of the event to delete
 * @throws {Error} When the database deletion fails
 */
export async function deleteEvent(params: Params) {
  const { eventId } = params;

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) throw error;
}
