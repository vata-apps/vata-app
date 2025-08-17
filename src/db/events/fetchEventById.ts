import { supabase } from "@/lib/supabase";

interface Params {
  eventId: string;
}

/**
 * Fetches a single event by its ID
 *
 * @param eventId - The unique identifier of the event
 * @returns Promise that resolves to the event data or null if not found
 * @throws {Error} When the database query fails
 */
export async function fetchEventById(params: Params) {
  const { eventId } = params;

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows returned
    throw error;
  }

  return event;
}
