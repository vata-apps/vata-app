import type { FamilyFormData } from "@/components/FamilyForm";
import { supabase } from "@/lib/supabase";

export async function createFamily(
  treeId: string,
  data: FamilyFormData,
): Promise<{ id: string }> {
  // Start a transaction to create the family and its children relationships
  const { data: family, error: familyError } = await supabase
    .from("families")
    .insert({
      tree_id: treeId,
      husband_id: data.husbandId || null,
      wife_id: data.wifeId || null,
      type: data.type,
    })
    .select("id")
    .single();

  if (familyError) throw familyError;

  // If there are children, create the family_children relationships
  if (data.children.length > 0) {
    const familyChildrenData = data.children
      .filter((child) => child.individualId) // Filter out empty entries
      .map((child) => ({
        family_id: family.id,
        individual_id: child.individualId,
        tree_id: treeId,
      }));

    if (familyChildrenData.length > 0) {
      const { error: childrenError } = await supabase
        .from("family_children")
        .insert(familyChildrenData);

      if (childrenError) throw childrenError;
    }
  }

  return { id: family.id };
}
