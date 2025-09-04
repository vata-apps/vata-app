import { supabase } from "@/lib/supabase";
import { formatGedcomId } from "@/utils/formatGedcomId";
import { PLACE_SELECT } from "./constants";
import { PlaceDetails } from "./types";

export async function fetchPlaceById(
  treeId: string,
  placeId: string,
): Promise<PlaceDetails> {
  const { data: place, error } = await supabase
    .from("places")
    .select(PLACE_SELECT)
    .eq("tree_id", treeId)
    .eq("id", placeId)
    .single();

  if (error) throw error;

  return {
    ...place,
    gedcomId: formatGedcomId("places", place.gedcomId ?? 0),
  };
}
