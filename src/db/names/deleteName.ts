import { supabase } from "@/lib/supabase";

interface Params {
  nameId: string;
}

/**
 * Deletes a name from the database
 *
 * @param nameId - The unique identifier of the name to delete
 * @throws {Error} When the database deletion fails
 */
export async function deleteName(params: Params) {
  const { nameId } = params;

  const { error } = await supabase.from("names").delete().eq("id", nameId);

  if (error) throw error;
}
