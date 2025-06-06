import { supabase } from "../../lib/supabase";

interface Params {
  individualIds?: string[];
}

export async function fetchIndividualsWithNames(
  treeId: string,
  params: Params,
) {
  let query = supabase
    .from("names")
    .select(
      `
        first_name,
        last_name,
        individuals!inner(
          id,
          gedcom_id,
          gender
        )
      `,
    )
    .eq("tree_id", treeId)
    .eq("is_primary", true);

  if (params.individualIds) {
    query = query.in("individuals.id", params.individualIds);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data?.map(({ individuals, first_name, last_name }) => {
    return {
      id: individuals.id,
      gedcomId: individuals.gedcom_id,
      gender: individuals.gender,
      firstName: first_name,
      lastName: last_name,
    };
  });
}

export type IndividualWithNames = Awaited<
  ReturnType<typeof fetchIndividualsWithNames>
>[number];
