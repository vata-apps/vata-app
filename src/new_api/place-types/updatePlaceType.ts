import { TablesUpdate } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  placeTypeId: string;
  name?: string;
}

/**
 * Updates an existing place type in the database
 *
 * @param placeTypeId - The unique identifier of the place type to update
 * @param name - The name of the place type
 * @param key - The key identifier for the place type
 * @param isSystem - Whether this is a system-defined place type
 * @throws {Error} When the database update fails
 */
export async function updatePlaceType(params: Params) {
  const { placeTypeId, name } = params;

  const update: TablesUpdate<"place_types"> = {};
  if (name !== undefined) update.name = name;

  const { error } = await supabase
    .from("place_types")
    .update(update)
    .eq("id", placeTypeId);

  if (error) throw error;
}
