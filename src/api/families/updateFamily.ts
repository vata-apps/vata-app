import type { FamilyFormData } from "@/components/FamilyForm";
import { supabase } from "@/lib/supabase";

export async function updateFamily(
  treeId: string,
  familyId: string,
  data: FamilyFormData,
): Promise<{ id: string }> {
  // Update the family record
  const { error: familyError } = await supabase
    .from("families")
    .update({
      husband_id: data.husbandId || null,
      wife_id: data.wifeId || null,
      type: data.type,
    })
    .eq("id", familyId)
    .eq("tree_id", treeId);

  if (familyError) throw familyError;

  // Delete existing family_children relationships
  const { error: deleteError } = await supabase
    .from("family_children")
    .delete()
    .eq("family_id", familyId)
    .eq("tree_id", treeId);

  if (deleteError) throw deleteError;

  // Create new family_children relationships
  if (data.children.length > 0) {
    const familyChildrenData = data.children
      .filter((child) => child.individualId) // Filter out empty entries
      .map((child) => ({
        family_id: familyId,
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

  return { id: familyId };
}
