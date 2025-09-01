import { supabase } from "@/lib/supabase";
import { select } from "./utils";

interface Params {
  eventParticipantId: string;
}

/**
 * Fetches a single event participant by its ID
 *
 * @param eventParticipantId - The unique identifier of the event participant
 * @returns Promise that resolves to the event participant data or null if not found
 * @throws {Error} When the database query fails
 */
export async function fetchEventParticipantById(params: Params) {
  const { eventParticipantId } = params;

  const { data: eventParticipant, error } = await supabase
    .from("event_participants")
    .select(select)
    .eq("id", eventParticipantId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows returned
    throw error;
  }

  return eventParticipant;
}
