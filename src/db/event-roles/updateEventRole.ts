import { TablesUpdate } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  eventRoleId: string;
  name?: string;
}

/**
 * Updates an existing event role in the database
 *
 * @param eventRoleId - The unique identifier of the event role to update
 * @param name - The name of the event role
 * @param key - The key identifier for the event role
 * @param isSystem - Whether this is a system-defined event role
 * @throws {Error} When the database update fails
 */
export async function updateEventRole(params: Params) {
  const { eventRoleId, name } = params;

  const update: TablesUpdate<"event_roles"> = {};
  if (name !== undefined) update.name = name;

  const { error } = await supabase
    .from("event_roles")
    .update(update)
    .eq("id", eventRoleId);

  if (error) throw error;
}
