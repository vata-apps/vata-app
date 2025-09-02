import { supabase } from "@/lib/supabase";
import { PlaceType, SELECT_PLACE_TYPES } from "./types";

export async function fetchPlaceTypes(treeId: string): Promise<PlaceType[]> {
  const { data: placeTypes, error } = await supabase
    .from("place_types")
    .select(SELECT_PLACE_TYPES)
    .eq("tree_id", treeId);

  if (error) throw error;

  return placeTypes.map(({ id, name, key }) => ({
    id,
    name,
    key,
  }));
}
