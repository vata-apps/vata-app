import { supabase } from "@/lib/supabase";

interface Params {
  individualId: string;
}

/**
 * Deletes an individual from the database
 *
 * @param individualId - The unique identifier of the individual to delete
 * @throws {Error} When the database deletion fails
 */
export async function deleteIndividual(params: Params) {
  const { individualId } = params;

  const { error } = await supabase
    .from("individuals")
    .delete()
    .eq("id", individualId);

  if (error) throw error;
}
