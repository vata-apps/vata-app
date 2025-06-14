import { supabase } from "@/lib/supabase";

export const fetchTrees = async () => {
  const { data, error } = await supabase
    .from("trees")
    .select("id, name, is_default")
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch trees: ${error.message}`);
  }

  return data || [];
};
