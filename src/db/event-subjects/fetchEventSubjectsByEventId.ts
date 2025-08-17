import { supabase } from "@/lib/supabase";

interface Params {
  eventId: string;
}

/**
 * Fetches all event subjects for a specific event
 *
 * @param eventId - The unique identifier of the event
 * @returns Promise that resolves to an array of all event subjects for the event
 * @throws {Error} When the database query fails
 */
export async function fetchEventSubjectsByEventId(params: Params) {
  const { eventId } = params;

  const { data: eventSubjects, error } = await supabase
    .from("event_subjects")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at");

  if (error) throw error;

  return eventSubjects;
}
