import { FamilyWithRelations } from "@/components/family/types";
import { supabase } from "@/lib/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { fetchFamiliesByMemberName } from "./fetchFamiliesByMemberName";
import { getPageRange } from "./getPageRange";

type FamilyResponse = PostgrestSingleResponse<FamilyWithRelations[]>;

/**
 * Fetches a paginated list of families from the database
 * @param params.page - The page number to fetch (1-based)
 * @param params.query - Search query to filter families by member name
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchFamilies({
  page,
  query,
}: {
  page: number;
  query: string;
}): Promise<{ data: FamilyWithRelations[]; total: number }> {
  const { start, end } = getPageRange(page);

  if (query) return await fetchFamiliesByMemberName({ page, query });

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
      {
        count: "exact",
      },
    )
    .range(start, end)) as FamilyResponse;

  const { count, data, error } = response;

  if (error) throw error;
  if (!data) return { data: [], total: 0 };

  return { data, total: count || 0 };
}
