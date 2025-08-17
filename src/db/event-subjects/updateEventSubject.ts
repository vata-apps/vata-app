import { TablesUpdate } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  eventSubjectId: string;
  eventId?: string;
  individualId?: string;
}

/**
 * Updates an existing event subject in the database
 *
 * @param eventSubjectId - The unique identifier of the event subject to update
 * @param eventId - The unique identifier of the event
 * @param individualId - The unique identifier of the individual who is the subject of the event
 * @throws {Error} When the database update fails
 */
export async function updateEventSubject(params: Params) {
  const { eventSubjectId, eventId, individualId } = params;

  const update: TablesUpdate<"event_subjects"> = {};
  if (eventId !== undefined) update.event_id = eventId;
  if (individualId !== undefined) update.individual_id = individualId;

  const { error } = await supabase
    .from("event_subjects")
    .update(update)
    .eq("id", eventSubjectId);

  if (error) throw error;
}
