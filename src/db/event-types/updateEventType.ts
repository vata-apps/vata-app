import { TablesUpdate } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  eventTypeId: string;
  name?: string;
}

/**
 * Updates an existing event type in the database
 *
 * @param eventTypeId - The unique identifier of the event type to update
 * @param name - The name of the event type
 * @param key - The key identifier for the event type
 * @param isSystem - Whether this is a system-defined event type
 * @throws {Error} When the database update fails
 */
export async function updateEventType(params: Params) {
  const { eventTypeId, name } = params;

  const update: TablesUpdate<"event_types"> = {};
  if (name !== undefined) update.name = name;

  const { error } = await supabase
    .from("event_types")
    .update(update)
    .eq("id", eventTypeId);

  if (error) throw error;
}
