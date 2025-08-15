import { supabase } from "@/lib/supabase";

interface Params {
  eventSubjectId: string;
}

/**
 * Fetches a single event subject by its ID
 *
 * @param eventSubjectId - The unique identifier of the event subject
 * @returns Promise that resolves to the event subject data or null if not found
 * @throws {Error} When the database query fails
 */
export async function fetchEventSubjectById(params: Params) {
  const { eventSubjectId } = params;

  const { data: eventSubject, error } = await supabase
    .from("event_subjects")
    .select("*")
    .eq("id", eventSubjectId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows returned
    throw error;
  }

  return eventSubject;
}
