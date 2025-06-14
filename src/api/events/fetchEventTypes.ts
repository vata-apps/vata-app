import { supabase } from "@/lib/supabase";

export async function fetchEventTypes(treeId: string) {
  const { data, error } = await supabase
    .from("event_types")
    .select("id, name")
    .eq("tree_id", treeId);

  if (error) throw error;

  return data;
}
