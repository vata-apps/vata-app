import { supabase } from "@/lib/supabase";
import { select } from "./utils";

interface Params {
  eventRoleId: string;
}

/**
 * Fetches a single event role by its ID
 *
 * @param eventRoleId - The unique identifier of the event role
 * @returns Promise that resolves to the event role data or null if not found
 * @throws {Error} When the database query fails
 */
export async function fetchEventRoleById(params: Params) {
  const { eventRoleId } = params;

  const { data: eventRole, error } = await supabase
    .from("event_roles")
    .select(select)
    .eq("id", eventRoleId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows returned
    throw error;
  }

  return eventRole;
}
