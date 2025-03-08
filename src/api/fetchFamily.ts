import { Tables } from "@/database.types";
import { supabase } from "@/lib/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

type IndividualWithNames = Pick<Tables<"individuals">, "id" | "gender"> & {
  names: Pick<
    Tables<"names">,
    "first_name" | "last_name" | "is_primary" | "type"
  >[];
};

type FamilyWithRelations = Pick<Tables<"families">, "id" | "type"> & {
  husband: IndividualWithNames | null;
  wife: IndividualWithNames | null;
  children: {
    individual: IndividualWithNames;
  }[];
};

type FamilyResponse = PostgrestSingleResponse<FamilyWithRelations>;

/**
 * Fetches a family with all its relations (husband, wife, children)
 * @param familyId - The ID of the family to fetch
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchFamily(
  familyId: string,
): Promise<FamilyWithRelations> {
  const response = (await supabase
    .from("families")
    .select(
      `
      id,
      type,
      husband:individuals!families_husband_id_fkey(
        id, 
        gender,
        names(first_name, last_name, is_primary, type)
      ),
      wife:individuals!families_wife_id_fkey(
        id, 
        gender,
        names(first_name, last_name, is_primary, type)
      ),
      children:family_children!family_children_family_id_fkey(
        individual:individuals(
          id,
          gender,
          names(first_name, last_name, is_primary, type)
        )
      )
      `,
    )
    .eq("id", familyId)
    .single()) as FamilyResponse;

  const { data, error } = response;

  if (error) throw error;
  if (!data) throw new Error(`Family with ID ${familyId} not found`);

  return data;
}
