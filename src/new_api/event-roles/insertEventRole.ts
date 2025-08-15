import { TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  treeId: string;
  name: string;
}

/**
 * Inserts a new event role into the database
 *
 * @param treeId - The unique identifier of the family tree
 * @param name - The name of the event role
 * @param key - The key identifier for the event role
 * @param isSystem - Whether this is a system-defined event role
 * @returns Promise that resolves to the ID of the newly created event role
 * @throws {Error} When the database insertion fails
 */
export async function insertEventRole(params: Params) {
  const { treeId, name } = params;

  const insert = {
    tree_id: treeId,
    name,
  } satisfies TablesInsert<"event_roles">;

  const { data: newEventRole, error } = await supabase
    .from("event_roles")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw error;

  return newEventRole.id;
}
