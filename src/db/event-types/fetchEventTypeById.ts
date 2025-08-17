import { supabase } from "@/lib/supabase";

interface Params {
  eventTypeId: string;
}

/**
 * Fetches a single event type by its ID
 *
 * @param eventTypeId - The unique identifier of the event type
 * @returns Promise that resolves to the event type data or null if not found
 * @throws {Error} When the database query fails
 */
export async function fetchEventTypeById(params: Params) {
  const { eventTypeId } = params;

  const { data: eventType, error } = await supabase
    .from("event_types")
    .select("*")
    .eq("id", eventTypeId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows returned
    throw error;
  }

  return eventType;
}
