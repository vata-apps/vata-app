import { TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  eventId: string;
  individualId: string;
  treeId: string;
}

/**
 * Inserts a new event subject into the database
 *
 * @param eventId - The unique identifier of the event
 * @param individualId - The unique identifier of the individual who is the subject of the event
 * @param treeId - The unique identifier of the family tree
 * @returns Promise that resolves to the ID of the newly created event subject
 * @throws {Error} When the database insertion fails
 */
export async function insertEventSubject(params: Params) {
  const { eventId, individualId, treeId } = params;

  const insert = {
    event_id: eventId,
    individual_id: individualId,
    tree_id: treeId,
  } satisfies TablesInsert<"event_subjects">;

  const { data: newEventSubject, error } = await supabase
    .from("event_subjects")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw error;

  return newEventSubject.id;
}
