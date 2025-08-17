import { supabase } from "@/lib/supabase";

interface Params {
  individualId: string;
}

/**
 * Fetches all names for a specific individual
 *
 * @param individualId - The unique identifier of the individual
 * @returns Promise that resolves to an array of all names for the individual
 * @throws {Error} When the database query fails
 */
export async function fetchNames(params: Params) {
  const { individualId } = params;

  const { data: names, error } = await supabase
    .from("names")
    .select("*")
    .eq("individual_id", individualId)
    .order("is_primary", { ascending: false })
    .order("created_at");

  if (error) throw error;

  return names;
}
