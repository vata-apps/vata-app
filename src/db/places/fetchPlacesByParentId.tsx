import { supabase } from "@/lib/supabase";
import { formatGedcomId } from "@/utils/formatGedcomId";
import { PLACE_SELECT } from "./constants";

export async function fetchPlacesByParentId(treeId: string, parentId: string) {
  const { data, error } = await supabase
    .from("places")
    .select(PLACE_SELECT)
    .eq("tree_id", treeId)
    .eq("parent_id", parentId);

  if (error) throw error;

  return data.map((place) => ({
    ...place,
    gedcomId: formatGedcomId("places", place.gedcomId ?? 0),
  }));
}
