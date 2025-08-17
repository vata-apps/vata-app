import { TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  treeId: string;
  typeId: string;
  date?: string | null;
  description?: string | null;
  placeId?: string | null;
}

/**
 * Inserts a new event into the database
 *
 * @param treeId - The unique identifier of the family tree
 * @param typeId - The unique identifier of the event type
 * @param date - The date of the event
 * @param description - The description of the event
 * @param placeId - The unique identifier of the place where the event occurred
 * @returns Promise that resolves to the ID of the newly created event
 * @throws {Error} When the database insertion fails
 */
export async function insertEvent(params: Params) {
  const { treeId, typeId, date, description, placeId } = params;

  const insert = {
    tree_id: treeId,
    type_id: typeId,
    date,
    description,
    place_id: placeId,
  } satisfies TablesInsert<"events">;

  const { data: newEvent, error } = await supabase
    .from("events")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw error;

  return newEvent.id;
}
