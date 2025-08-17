import { supabase } from "@/lib/supabase";

interface Params {
  treeId: string;
}

/**
 * Fetches all events for a specific tree
 *
 * @param treeId - The unique identifier of the family tree
 * @returns Promise that resolves to an array of all events in the tree
 * @throws {Error} When the database query fails
 */
export async function fetchEvents(params: Params) {
  const { treeId } = params;

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("tree_id", treeId);

  if (error) throw error;

  return events;
}
