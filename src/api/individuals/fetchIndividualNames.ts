import { supabase } from "@/lib/supabase";

export async function fetchIndividualNames(
  treeId: string,
  individualId: string,
) {
  const { data, error } = await supabase
    .from("names")
    .select(
      `
      id,
      first_name,
      last_name,
      surname,
      type,
      is_primary
    `,
    )
    .eq("tree_id", treeId)
    .eq("individual_id", individualId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (
    data?.map((name) => ({
      id: name.id,
      firstName: name.first_name || "",
      lastName: name.last_name || "",
      surname: name.surname || "",
      type: name.type,
      isPrimary: name.is_primary,
    })) || []
  );
}

export type IndividualNames = Awaited<ReturnType<typeof fetchIndividualNames>>;
