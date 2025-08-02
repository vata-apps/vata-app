import { supabase } from "@/lib/supabase";
import { Individual } from "../individuals/fetchIndividual";
import { fetchIndividuals } from "../individuals/fetchIndividuals";

export async function fetchParents(treeId: string, individualId: string) {
  const result: { father: Individual | null; mother: Individual | null } = {
    father: null,
    mother: null,
  };

  const familyAsChildQuery = await supabase
    .from("family_children")
    .select("family:families!inner(id, husband_id, wife_id)")
    .eq("tree_id", treeId)
    .eq("individual_id", individualId)
    .single();

  if (familyAsChildQuery.error) {
    if (familyAsChildQuery.error.code === "PGRST116") return result;
    throw familyAsChildQuery.error;
  }

  const individualIds = [
    familyAsChildQuery.data.family.husband_id,
    familyAsChildQuery.data.family.wife_id,
  ].filter((id) => id !== null);

  if (individualIds.length === 0) return result;

  const parents = await fetchIndividuals(treeId, {
    individualIds,
  });

  const father = parents.find((parent) => parent.gender === "male");
  const mother = parents.find((parent) => parent.gender === "female");

  if (father) result.father = father ?? null;
  if (mother) result.mother = mother ?? null;

  return result;
}
