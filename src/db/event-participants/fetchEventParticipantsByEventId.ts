import { supabase } from "@/lib/supabase";

interface Params {
  eventId: string;
}

/**
 * Fetches all event participants for a specific event
 *
 * @param eventId - The unique identifier of the event
 * @returns Promise that resolves to an array of all event participants for the event
 * @throws {Error} When the database query fails
 */
export async function fetchEventParticipantsByEventId(params: Params) {
  const { eventId } = params;

  const { data: eventParticipants, error } = await supabase
    .from("event_participants")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at");

  if (error) throw error;

  return eventParticipants;
}
