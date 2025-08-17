import { TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  treeId: string;
  name: string;
}

/**
 * Inserts a new event type into the database
 *
 * @param treeId - The unique identifier of the family tree
 * @param name - The name of the event type
 * @param key - The key identifier for the event type
 * @param isSystem - Whether this is a system-defined event type
 * @returns Promise that resolves to the ID of the newly created event type
 * @throws {Error} When the database insertion fails
 */
export async function insertEventType(params: Params) {
  const { treeId, name } = params;

  const insert: TablesInsert<"event_types"> = {
    tree_id: treeId,
    name,
  };

  const { data: newEventType, error } = await supabase
    .from("event_types")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw error;

  return newEventType.id;
}
