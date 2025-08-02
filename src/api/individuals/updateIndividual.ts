import { supabase } from "@/lib/supabase";

interface UpdateIndividualData {
  gender: "male" | "female";
  names: Array<{
    id?: string;
    firstName: string;
    lastName: string;
    surname: string;
    type: "birth" | "marriage" | "nickname" | "unknown";
  }>;
}

export async function updateIndividual(
  treeId: string,
  individualId: string,
  data: UpdateIndividualData,
) {
  // First, update the individual
  const { error: individualError } = await supabase
    .from("individuals")
    .update({
      gender: data.gender,
    })
    .eq("id", individualId)
    .eq("tree_id", treeId);

  if (individualError) throw individualError;

  // Get existing names for this individual
  const { data: existingNames, error: fetchError } = await supabase
    .from("names")
    .select("id")
    .eq("individual_id", individualId)
    .eq("tree_id", treeId);

  if (fetchError) throw fetchError;

  // Delete existing names
  if (existingNames && existingNames.length > 0) {
    const { error: deleteError } = await supabase
      .from("names")
      .delete()
      .eq("individual_id", individualId)
      .eq("tree_id", treeId);

    if (deleteError) throw deleteError;
  }

  // Create new names
  const namesData = data.names.map((name, index) => ({
    individual_id: individualId,
    first_name: name.firstName,
    last_name: name.lastName,
    surname: name.surname || null,
    type: name.type,
    is_primary: index === 0, // First name is primary
    tree_id: treeId,
  }));

  const { error: namesError } = await supabase.from("names").insert(namesData);

  if (namesError) throw namesError;

  return { id: individualId };
}

export type UpdateIndividualResult = Awaited<
  ReturnType<typeof updateIndividual>
>;
