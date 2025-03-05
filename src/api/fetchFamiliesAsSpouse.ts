import { Tables } from "@/database.types";
import { supabase } from "@/lib/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

type IndividualWithNames = Tables<"individuals"> & {
  names: Pick<Tables<"names">, "first_name" | "last_name" | "is_primary">[];
};

type FamilyWithRelations = {
  id: Tables<"families">["id"];
  husband: IndividualWithNames | null;
  wife: IndividualWithNames | null;
  children: {
    individual: IndividualWithNames;
  }[];
};

/**
 * Fetches all families where an individual is a spouse (husband or wife)
 * @param individualId - The ID of the individual
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchFamiliesAsSpouse(
  individualId: string,
): Promise<FamilyWithRelations[]> {
  console.log("Fetching families for individual:", individualId);

  const { data, error } = (await supabase
    .from("families")
    .select(
      `
      id,
      husband:individuals!families_husband_id_fkey(
        id, 
        gender,
        created_at,
        gedcom_id,
        names(first_name, last_name, is_primary)
      ),
      wife:individuals!families_wife_id_fkey(
        id, 
        gender,
        created_at,
        gedcom_id,
        names(first_name, last_name, is_primary)
      ),
      children:family_children(
        individual:individuals(
          id,
          gender,
          created_at,
          gedcom_id,
          names(first_name, last_name, is_primary)
        )
      )
      `,
    )
    .or(
      `husband_id.eq.${individualId},wife_id.eq.${individualId}`,
    )) as PostgrestSingleResponse<FamilyWithRelations[]>;

  if (error) {
    console.error("Error fetching families:", error);
    throw error;
  }

  console.log("Fetched families:", data);

  return data || [];
}
