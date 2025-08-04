import { supabase } from "@/lib/supabase";

export async function fetchEventRoles(treeId: string) {
  const { data, error } = await supabase
    .from("event_roles")
    .select("id, name, key, is_system")
    .eq("tree_id", treeId)
    .order("name");

  if (error) throw error;

  return data;
}
