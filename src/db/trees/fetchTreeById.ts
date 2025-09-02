import { supabase } from "@/lib/supabase";
import { selectTree, Tree } from "./types";

export async function fetchTreeById(id: string): Promise<Tree> {
  const { data, error } = await supabase
    .from("trees")
    .select(selectTree)
    .eq("id", id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    isDefault: data.is_default,
    createdAt: data.created_at,
  };
}
