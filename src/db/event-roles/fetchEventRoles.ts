import { supabase } from "@/lib/supabase";

interface Params {
  treeId: string;
}

/**
 * Fetches all event roles for a specific tree
 *
 * @param treeId - The unique identifier of the family tree
 * @returns Promise that resolves to an array of all event roles in the tree
 * @throws {Error} When the database query fails
 */
export async function fetchEventRoles(params: Params) {
  const { treeId } = params;

  const { data: eventRoles, error } = await supabase
    .from("event_roles")
    .select("*")
    .eq("tree_id", treeId)
    .order("name");

  if (error) throw error;

  return eventRoles;
}
