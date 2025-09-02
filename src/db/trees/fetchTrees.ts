import { supabase } from "@/lib/supabase";
import { selectTree, Tree } from "./types";

export async function fetchTrees(): Promise<Tree[]> {
  const { data, error } = await supabase.from("trees").select(selectTree);

  if (error) throw error;

  return data.map(({ id, name, description, is_default, created_at }) => ({
    id,
    name,
    description,
    isDefault: is_default,
    createdAt: created_at,
  }));
}
