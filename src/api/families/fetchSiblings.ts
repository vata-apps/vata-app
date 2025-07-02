import { supabase } from "@/lib/supabase";
import { fetchIndividuals } from "../individuals/fetchIndividuals";

export async function fetchSiblings(treeId: string, individualId: string) {
  const familyAsChildQuery = await supabase
    .from("family_children")
    .select("family_id")
    .eq("individual_id", individualId)
    .single();

  if (familyAsChildQuery.error) throw familyAsChildQuery.error;

  const familyId = familyAsChildQuery.data.family_id;

  const siblingsQuery = await supabase
    .from("family_children")
    .select("individual_id")
    .eq("family_id", familyId);

  if (siblingsQuery.error) throw siblingsQuery.error;

  const siblingsIds = siblingsQuery.data
    .map((sibling) => sibling.individual_id)
    .filter((id) => id !== individualId);

  const siblings = await fetchIndividuals(treeId, {
    individualIds: siblingsIds,
  });

  return siblings;
}
