import { supabase } from "@/lib/supabase";

export async function fetchFamiliesForTable(treeId: string) {
  const queryFamilies = supabase
    .from("families")
    .select("id, gedcom_id, husband_id, wife_id")
    .eq("tree_id", treeId);

  const queryIndividuals = supabase
    .from("individuals")
    .select("id, gender, names(first_name, last_name, is_primary)")
    .eq("tree_id", treeId)
    .eq("names.is_primary", true);

  const queryFamilyChildren = supabase
    .from("family_children")
    .select("individual_id, family_id")
    .eq("tree_id", treeId);

  const [families, individuals, familyChildren] = await Promise.all([
    queryFamilies,
    queryIndividuals,
    queryFamilyChildren,
  ]);

  if (families.error) throw families.error;
  if (individuals.error) throw individuals.error;
  if (familyChildren.error) throw familyChildren.error;

  const familiesData = families.data;
  const individualsData = individuals.data;
  const familyChildrenData = familyChildren.data;

  return familiesData.map((family) => {
    const husband = individualsData.find(({ id }) => id === family.husband_id);
    const wife = individualsData.find(({ id }) => id === family.wife_id);
    const children = familyChildrenData
      .filter(({ family_id }) => family_id === family.id)
      .map(({ individual_id }) =>
        individualsData.find(({ id }) => id === individual_id),
      )
      .filter(
        (child): child is NonNullable<typeof child> => child !== undefined,
      );

    return {
      id: family.id,
      gedcomId: family.gedcom_id,
      husband: husband
        ? {
            id: husband.id,
            gender: husband.gender,
            names: husband.names,
          }
        : null,
      wife: wife
        ? {
            id: wife.id,
            gender: wife.gender,
            names: wife.names,
          }
        : null,
      children: children.map((child) => ({
        id: child.id,
        gender: child.gender,
        names: child.names,
      })),
    };
  });
}

export type FamilyForTable = Awaited<
  ReturnType<typeof fetchFamiliesForTable>
>[number];
