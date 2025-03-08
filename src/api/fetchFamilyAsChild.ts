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

type FamilyResponse = PostgrestSingleResponse<FamilyWithRelations>;

/**
 * Fetches the family where an individual is a child
 * @param individualId - The ID of the individual
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchFamilyAsChild(
  individualId: string,
): Promise<FamilyWithRelations | null> {
  // First, find the family where this individual is a child
  const { data: familyChildData, error: familyChildError } = await supabase
    .from("family_children")
    .select("family_id")
    .eq("individual_id", individualId)
    .single();

  if (familyChildError) {
    if (familyChildError.code === "PGRST116") {
      // No family found where this individual is a child
      return null;
    }
    throw familyChildError;
  }

  // Now fetch the complete family data with parents and siblings
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
    .eq("id", familyChildData.family_id)
    .single()) as FamilyResponse;

  const { data, error: familyError } = response;

  if (familyError) throw familyError;

  return data;
}
