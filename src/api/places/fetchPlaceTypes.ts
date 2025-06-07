import { supabase } from "@/lib/supabase";

export async function fetchPlaceTypes(treeId: string) {
  const { data, error } = await supabase
    .from("place_types")
    .select("id, name")
    .eq("tree_id", treeId);

  if (error) throw error;

  return data;
}
