import { TablesUpdate } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  eventParticipantId: string;
  eventId?: string;
  individualId?: string;
  roleId?: string;
}

/**
 * Updates an existing event participant in the database
 *
 * @param eventParticipantId - The unique identifier of the event participant to update
 * @param eventId - The unique identifier of the event
 * @param individualId - The unique identifier of the individual participating
 * @param roleId - The unique identifier of the role the individual has in the event
 * @throws {Error} When the database update fails
 */
export async function updateEventParticipant(params: Params) {
  const { eventParticipantId, eventId, individualId, roleId } = params;

  const update: TablesUpdate<"event_participants"> = {};
  if (eventId !== undefined) update.event_id = eventId;
  if (individualId !== undefined) update.individual_id = individualId;
  if (roleId !== undefined) update.role_id = roleId;

  const { error } = await supabase
    .from("event_participants")
    .update(update)
    .eq("id", eventParticipantId);

  if (error) throw error;
}
