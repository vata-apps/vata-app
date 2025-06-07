import { supabase } from "@/lib/supabase";

export async function fetchPlacesForTable(treeId: string) {
  const { data, error } = await supabase
    .from("places")
    .select(
      `
        id,
        name,
        latitude,
        longitude,
        place_types(id, name)
      `,
    )
    .eq("tree_id", treeId);

  if (error) throw error;

  return data;
}

export type PlaceForTable = Awaited<
  ReturnType<typeof fetchPlacesForTable>
>[number];
