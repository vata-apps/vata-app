import { TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  treeId: string;
  name: string;
  parentId?: string | null;
  typeId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Inserts a new place into the database
 *
 * @param treeId - The unique identifier of the family tree
 * @param name - The name of the place
 * @param parentId - The unique identifier of the parent place
 * @param typeId - The unique identifier of the place type
 * @param latitude - The latitude coordinate of the place
 * @param longitude - The longitude coordinate of the place
 * @returns Promise that resolves to the ID of the newly created place
 * @throws {Error} When the database insertion fails
 */
export async function insertPlace(params: Params) {
  const { treeId, name, parentId, typeId, latitude, longitude } = params;

  const insert: TablesInsert<"places"> = {
    tree_id: treeId,
    name,
    parent_id: parentId,
    type_id: typeId,
    latitude,
    longitude,
  };

  const { data: newPlace, error } = await supabase
    .from("places")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw error;

  return newPlace.id;
}
