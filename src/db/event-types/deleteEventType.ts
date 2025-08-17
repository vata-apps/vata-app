import { supabase } from "@/lib/supabase";

interface Params {
  eventTypeId: string;
}

/**
 * Deletes an event type from the database
 *
 * @param eventTypeId - The unique identifier of the event type to delete
 * @throws {Error} When the database deletion fails
 */
export async function deleteEventType(params: Params) {
  const { eventTypeId } = params;

  const { error } = await supabase
    .from("event_types")
    .delete()
    .eq("id", eventTypeId);

  if (error) throw error;
}
