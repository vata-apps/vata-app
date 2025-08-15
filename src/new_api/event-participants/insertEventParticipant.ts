import { TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  eventId: string;
  individualId: string;
  roleId: string;
  treeId: string;
}

/**
 * Inserts a new event participant into the database
 *
 * @param eventId - The unique identifier of the event
 * @param individualId - The unique identifier of the individual participating
 * @param roleId - The unique identifier of the role the individual has in the event
 * @param treeId - The unique identifier of the family tree
 * @returns Promise that resolves to the ID of the newly created event participant
 * @throws {Error} When the database insertion fails
 */
export async function insertEventParticipant(params: Params) {
  const { eventId, individualId, roleId, treeId } = params;

  const insert = {
    event_id: eventId,
    individual_id: individualId,
    role_id: roleId,
    tree_id: treeId,
  } satisfies TablesInsert<"event_participants">;

  const { data: newEventParticipant, error } = await supabase
    .from("event_participants")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw error;

  return newEventParticipant.id;
}
