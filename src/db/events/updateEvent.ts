import { TablesUpdate } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  eventId: string;
  typeId?: string;
  date?: string | null;
  description?: string | null;
  placeId?: string | null;
}

/**
 * Updates an existing event in the database
 *
 * @param eventId - The unique identifier of the event to update
 * @param typeId - The unique identifier of the event type
 * @param date - The date of the event
 * @param description - The description of the event
 * @param placeId - The unique identifier of the place where the event occurred
 * @throws {Error} When the database update fails
 */
export async function updateEvent(params: Params) {
  const { eventId, typeId, date, description, placeId } = params;

  const update: TablesUpdate<"events"> = {};
  if (typeId !== undefined) update.type_id = typeId;
  if (date !== undefined) update.date = date;
  if (description !== undefined) update.description = description;
  if (placeId !== undefined) update.place_id = placeId;

  const { error } = await supabase
    .from("events")
    .update(update)
    .eq("id", eventId);

  if (error) throw error;
}
