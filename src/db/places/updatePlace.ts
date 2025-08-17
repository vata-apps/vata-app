import { TablesUpdate } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  placeId: string;
  name?: string;
  parentId?: string | null;
  typeId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Updates an existing place in the database
 *
 * @param placeId - The unique identifier of the place to update
 * @param name - The name of the place
 * @param parentId - The unique identifier of the parent place
 * @param typeId - The unique identifier of the place type
 * @param latitude - The latitude coordinate of the place
 * @param longitude - The longitude coordinate of the place
 * @throws {Error} When the database update fails
 */
export async function updatePlace(params: Params) {
  const { placeId, name, parentId, typeId, latitude, longitude } = params;

  const update: TablesUpdate<"places"> = {};
  if (name !== undefined) update.name = name;
  if (parentId !== undefined) update.parent_id = parentId;
  if (typeId !== undefined) update.type_id = typeId;
  if (latitude !== undefined) update.latitude = latitude;
  if (longitude !== undefined) update.longitude = longitude;

  const { error } = await supabase
    .from("places")
    .update(update)
    .eq("id", placeId);

  if (error) throw error;
}
