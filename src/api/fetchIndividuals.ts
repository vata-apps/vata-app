import { supabase } from "../lib/supabase";

const ITEMS_PER_PAGE = 10;

export async function fetchIndividuals({
  page,
  query,
}: {
  page: number;
  query: string;
}) {
  if (query) return await fetchIndividualsByName({ page, query });

  const { count, data, error } = await supabase
    .from("individuals")
    .select("id, gender, names(first_name, last_name, is_primary)", {
      count: "exact",
    })
    .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (error) throw error;

  return { data, total: count };
}

async function fetchIndividualsByName({
  page,
  query,
}: {
  page: number;
  query: string;
}) {
  const namesQuery = await supabase
    .from("names")
    .select("first_name, last_name, individual_id")
    .ilike("first_name_last_name", `%${query}%`)
    .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (namesQuery.error) throw namesQuery.error;

  const individualIds = namesQuery.data.map((name) => name.individual_id);

  const { count, data, error } = await supabase
    .from("individuals")
    .select("id, gender, names(first_name, last_name, is_primary)", {
      count: "exact",
    })
    .in("id", individualIds)
    .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (error) throw error;

  return { data, total: count };
}
