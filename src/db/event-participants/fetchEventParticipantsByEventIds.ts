import { supabase } from "@/lib/supabase";
import { select } from "./utils";

interface Params {
  eventIds: string[];
}

/**
 * Fetches all event participants for a specific events
 *
 * @param eventIds - The unique identifiers of the events
 * @returns Promise that resolves to an array of all event participants for the event
 * @throws {Error} When the database query fails
 */
export async function fetchEventParticipantsByEventIds(params: Params) {
  const { eventIds } = params;

  const { data: eventParticipants, error } = await supabase
    .from("event_participants")
    .select(select)
    .in("event_id", eventIds)
    .order("created_at");

  if (error) throw error;

  return eventParticipants;
}
