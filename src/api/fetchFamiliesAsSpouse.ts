import { supabase } from "@/lib/supabase";
import { FamilyWithRelations } from "@/types/family";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

type FamilyResponse = PostgrestSingleResponse<FamilyWithRelations[]>;

/**
 * Fetches all families where an individual is a spouse (husband or wife)
 * @param individualId - The ID of the individual
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchFamiliesAsSpouse(
  individualId: string,
): Promise<FamilyWithRelations[]> {
  const response = (await supabase
    .from("families")
    .select(
      `
      id,
      husband:individuals!families_husband_id_fkey(
        id, 
        gender,
        names(first_name, last_name, is_primary)
      ),
      wife:individuals!families_wife_id_fkey(
        id, 
        gender,
        names(first_name, last_name, is_primary)
      ),
      children:family_children!family_children_family_id_fkey(
        individual:individuals(
          id,
          gender,
          names(first_name, last_name, is_primary)
        )
      )
      `,
    )
    .or(
      `husband_id.eq.${individualId},wife_id.eq.${individualId}`,
    )) as FamilyResponse;

  const { data, error } = response;

  if (error) throw error;

  return data || [];
}
