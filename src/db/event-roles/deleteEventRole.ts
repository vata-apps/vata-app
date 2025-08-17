import { supabase } from "@/lib/supabase";

interface Params {
  eventRoleId: string;
}

/**
 * Deletes an event role from the database
 *
 * @param eventRoleId - The unique identifier of the event role to delete
 * @throws {Error} When the database deletion fails
 */
export async function deleteEventRole(params: Params) {
  const { eventRoleId } = params;

  const { error } = await supabase
    .from("event_roles")
    .delete()
    .eq("id", eventRoleId);

  if (error) throw error;
}
