import { supabase } from "@/lib/supabase";
import { select } from "./utils";

interface Params {
  treeId: string;
}

/**
 * Fetches all event types for a specific tree
 *
 * @param treeId - The unique identifier of the family tree
 * @returns Promise that resolves to an array of all event types in the tree
 * @throws {Error} When the database query fails
 */
export async function fetchEventTypes(params: Params) {
  const { treeId } = params;

  const { data: eventTypes, error } = await supabase
    .from("event_types")
    .select(select)
    .eq("tree_id", treeId)
    .order("name");

  if (error) throw error;

  return eventTypes;
}
