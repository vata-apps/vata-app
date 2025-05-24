import { Enums, Tables } from "@/database.types";
import { supabase } from "@/lib/supabase";

type Individual = Tables<"individuals"> & {
  names: Tables<"names">[];
  family_as_child: {
    family: {
      husband: {
        id: string;
        gender: Enums<"gender">;
        names: Tables<"names">[];
      } | null;
      wife: {
        id: string;
        gender: Enums<"gender">;
        names: Tables<"names">[];
      } | null;
      children: {
        individual: {
          id: string;
        };
      }[];
    } | null;
  }[];
  families_as_spouse: {
    children: {
      individual: {
        id: string;
      };
    }[];
  }[];
};

/**
 * Fetch individual data with their names and family relationships
 */
export async function fetchIndividual(
  individualId: string,
): Promise<Individual> {
  // First, fetch the individual with their names
  const { data: individual, error: individualError } = await supabase
    .from("individuals")
    .select("*, names (*)")
    .eq("id", individualId)
    .single();

  if (individualError) {
    throw individualError;
  }

  // Then, fetch their family as child
  const { data: familyAsChildData, error: familyAsChildError } = await supabase
    .from("family_children")
    .select("family_id")
    .eq("individual_id", individualId);

  if (familyAsChildError) {
    throw familyAsChildError;
  }

  let family = null;
  if (familyAsChildData && familyAsChildData.length > 0) {
    const { data: familyData, error: familyError } = await supabase
      .from("families")
      .select(
        `
        husband:husband_id (
          id,
          gender,
          names (*)
        ),
        wife:wife_id (
          id,
          gender,
          names (*)
        ),
        children:family_children (
          individual:individual_id (
            id
          )
        )
      `,
      )
      .eq("id", familyAsChildData[0].family_id)
      .single();

    if (familyError) {
      throw familyError;
    }

    family = familyData;
  }

  // Finally, fetch their families as spouse
  const { data: familiesAsSpouse, error: familiesAsSpouseError } =
    await supabase
      .from("families")
      .select(
        `
      children:family_children (
        individual:individual_id (
          id
        )
      )
    `,
      )
      .or(`husband_id.eq.${individualId},wife_id.eq.${individualId}`);

  if (familiesAsSpouseError) {
    throw familiesAsSpouseError;
  }

  return {
    ...individual,
    family_as_child: family ? [{ family }] : [],
    families_as_spouse: familiesAsSpouse || [],
  };
}
