import { supabase } from "@/lib/supabase";

interface CreateIndividualData {
  gender: "male" | "female";
  names: Array<{
    firstName: string;
    lastName: string;
    surname: string;
    type: "birth" | "marriage" | "nickname" | "unknown";
  }>;
}

export async function createIndividual(
  treeId: string,
  data: CreateIndividualData,
) {
  // First, create the individual
  const { data: newIndividual, error: individualError } = await supabase
    .from("individuals")
    .insert({
      gender: data.gender,
      tree_id: treeId,
    })
    .select("id")
    .single();

  if (individualError) throw individualError;

  // Then, create the names for this individual
  const namesData = data.names.map((name, index) => ({
    individual_id: newIndividual.id,
    first_name: name.firstName,
    last_name: name.lastName,
    surname: name.surname || null,
    type: name.type,
    is_primary: index === 0, // First name is primary
    tree_id: treeId,
  }));

  const { error: namesError } = await supabase.from("names").insert(namesData);

  if (namesError) throw namesError;

  return newIndividual;
}

export type CreateIndividualResult = Awaited<
  ReturnType<typeof createIndividual>
>;
