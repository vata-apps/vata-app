import { supabase } from "@/lib/supabase";
import { fetchIndividuals } from "../individuals/fetchIndividuals";

interface Params {
  individualIds?: string[];
}

export async function fetchFamilies(treeId: string, params: Params) {
  // Fetch families entities
  let query = supabase
    .from("families")
    .select("id, gedcom_id, husband_id, wife_id")
    .eq("tree_id", treeId);

  if (params.individualIds) {
    query = query.or(
      `husband_id.in.(${params.individualIds.join(",")}),wife_id.in.(${params.individualIds.join(",")})`,
    );
  }

  const familiesQuery = await query;

  if (familiesQuery.error) throw familiesQuery.error;

  // Fetch all children of the families
  const familyIds = familiesQuery.data.map((family) => family.id);
  const familyChildrenQuery = await supabase
    .from("family_children")
    .select("individual_id, family_id")
    .eq("tree_id", treeId)
    .in("family_id", familyIds);

  if (familyChildrenQuery.error) throw familyChildrenQuery.error;

  const familyChildren = familyChildrenQuery.data;

  const individualIds = [
    ...new Set(
      familiesQuery.data
        .flatMap((family) => [family.husband_id, family.wife_id])
        .filter((id) => id !== null),
    ),
    ...new Set(familyChildren.map((child) => child.individual_id)),
  ];

  // Fetch all individuals that are in the families
  const individuals = await fetchIndividuals(treeId, {
    individualIds,
  });

  return familiesQuery.data.map((family) => {
    const husband = individuals.find(
      (individual) => individual.id === family.husband_id,
    );
    const wife = individuals.find(
      (individual) => individual.id === family.wife_id,
    );
    const children = individuals.filter((individual) =>
      familyChildren.some(
        (child) =>
          child.individual_id === individual.id &&
          child.family_id === family.id,
      ),
    );

    return {
      id: family.id,
      gedcomId: `F-${family.gedcom_id.toString().padStart(4, "0")}`,
      husband,
      wife,
      children,
    };
  });
}

export type Families = Awaited<ReturnType<typeof fetchFamilies>>;
