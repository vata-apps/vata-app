import { supabase } from "@/lib/supabase";
import { formatGedcomId } from "@/utils/formatGedcomId";
import { TablePlaces } from "./types";

export async function fetchPlaces(treeId: string): Promise<TablePlaces> {
  const { data: places, error } = await supabase
    .from("places")
    .select(
      `
        id,
        gedcom_id,
        name,
        type:place_types(id, name, key)
      `,
    )
    .eq("tree_id", treeId);

  if (error) throw error;

  return places.map(({ id, gedcom_id, name, type }) => ({
    id,
    gedcomId: formatGedcomId("places", gedcom_id ?? 0),
    name: name,
    type: type,
  }));
}
