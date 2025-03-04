import { supabase } from "@/lib/supabase";
import { fetchFamiliesByMemberName } from "./fetchFamiliesByMemberName";
import { getPageRange } from "./getPageRange";

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
}) {
  const { start, end } = getPageRange(page);

  if (query) return await fetchFamiliesByMemberName({ page, query });

  const { count, data, error } = await supabase
    .from("families")
    .select(
      `
        id,
        husband:individuals!families_husband_id_fkey(
          id,
          names(first_name, last_name, is_primary)
        ),
        wife:individuals!families_wife_id_fkey(
          id,
          names(first_name, last_name, is_primary)
        ),
        children:family_children!family_children_family_id_fkey(
          id,
          individual:individuals(
            id,
            names(first_name, last_name, is_primary)
          )
        )
      `,
      {
        count: "exact",
      },
    )
    .range(start, end);

  console.log(data);

  if (error) throw error;

  return { data, total: count };
}
