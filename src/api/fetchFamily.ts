import { Tables } from "@/database.types";
import { supabase } from "@/lib/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

type IndividualWithNames = {
  id: string;
  gender: Tables<"individuals">["gender"];
  names: Tables<"names">[];
};

type FamilyWithRelations = {
  id: string;
  type: Tables<"families">["type"];
  husband: IndividualWithNames | null;
  wife: IndividualWithNames | null;
  children: {
    individual: IndividualWithNames;
  }[];
};

/**
 * Fetches a family with all its relations (husband, wife, children)
 * @param familyId - The ID of the family to fetch
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchFamily(
  familyId: string,
): Promise<FamilyWithRelations> {
  console.log("Fetching family:", familyId);

  const { data, error } = (await supabase
    .from("families")
    .select(
      `
      id,
      type,
      husband:individuals!families_husband_id_fkey(
        id, 
        gender,
        created_at,
        gedcom_id,
        names(*)
      ),
      wife:individuals!families_wife_id_fkey(
        id, 
        gender,
        created_at,
        gedcom_id,
        names(*)
      ),
      children:family_children(
        individual:individuals(
          id,
          gender,
          created_at,
          gedcom_id,
          names(*)
        )
      )
      `,
    )
    .eq("id", familyId)
    .single()) as PostgrestSingleResponse<FamilyWithRelations>;

  if (error) {
    console.error("Error fetching family:", error);
    throw error;
  }

  console.log("Fetched family:", data);

  if (!data) {
    throw new Error(`Family with ID ${familyId} not found`);
  }

  return data;
}
