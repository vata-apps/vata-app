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
  const { data, error: familyError } = (await supabase
    .from("families")
    .select(
      `
      id,
      husband:husband_id(
        id, 
        gender,
        names(first_name, last_name, is_primary)
      ),
      wife:wife_id(
        id, 
        gender,
        names(first_name, last_name, is_primary)
      ),
      children:family_children(
        individual:individual_id(
          id,
          gender,
          names(first_name, last_name, is_primary)
        )
      )
      `,
    )
    .eq("id", familyChildData.family_id)
    .single()) as PostgrestSingleResponse<FamilyWithRelations>;

  if (familyError) throw familyError;

  return data;
}
