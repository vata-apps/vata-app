import { FamilyWithRelations } from "@/components/family/types";
import { supabase } from "@/lib/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { getPageRange } from "./getPageRange";

type FamilyResponse = PostgrestSingleResponse<FamilyWithRelations[]>;

/**
 * Fetches families by searching for members with matching names. Searches across first names and last names
 * of all family members (husband, wife, and children).
 *
 * @param params.page The page number to fetch (1-based)
 * @param params.query Search query to filter families by member name (matches against first_name or last_name)
 * @throws When there's an error fetching data from Supabase
 * @returns Paginated family data containing family members (husband, wife, children) and total count
 */
export async function fetchFamiliesByMemberName({
  page,
  query,
}: {
  page: number;
  query: string;
}): Promise<{ data: FamilyWithRelations[]; total: number }> {
  const { start, end } = getPageRange(page);

  // First find all individuals matching the search term by first name or last name
  const namesQuery = await supabase
    .from("names")
    .select("individual_id")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`);

  if (namesQuery.error) throw namesQuery.error;

  const individualIds = namesQuery.data.map((name) => name.individual_id);

  // If no individuals found, return empty result
  if (individualIds.length === 0) {
    return { data: [], total: 0 };
  }

  // First get the family IDs from family_children table
  const { data: childrenFamilies, error: childrenError } = await supabase
    .from("family_children")
    .select("family_id")
    .in("individual_id", individualIds);

  if (childrenError) throw childrenError;

  const childrenFamilyIds = childrenFamilies.map((f) => f.family_id);

  // Find all families where these individuals are either husband, wife or children
  const { data: familyData, error: familyError } = await supabase
    .from("families")
    .select("id")
    .or(
      [
        `husband_id.in.(${individualIds.join(",")})`,
        `wife_id.in.(${individualIds.join(",")})`,
        `id.in.(${childrenFamilyIds.join(",")})`,
      ].join(","),
    );

  if (familyError) throw familyError;

  // If no results, return empty
  if (!familyData || familyData.length === 0) {
    return { data: [], total: 0 };
  }

  const uniqueFamilyIds = [...new Set(familyData.map((f) => f.id))];

  // Now fetch all the family data
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
    .in("id", uniqueFamilyIds)
    .range(start, end)) as FamilyResponse;

  const { data, error } = response;

  if (error) throw error;
  if (!data) return { data: [], total: 0 };

  return { data, total: uniqueFamilyIds.length };
}
