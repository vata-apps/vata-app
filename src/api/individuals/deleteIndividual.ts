import { supabase } from "@/lib/supabase";

/**
 * Deletes an individual and all associated data with proper event relationship management
 *
 * This function implements sophisticated deletion logic:
 * 1. Deletes events only if the individual is the only subject
 * 2. Removes event relationships (participant and subject) but keeps events if there are other subjects
 * 3. Preserves events where the individual is only a participant or in marriage events with other subjects
 * 4. Automatically handles names, family relationships, and spouse references
 */
export async function deleteIndividual(treeId: string, individualId: string) {
  // First, get all events where this individual is a subject
  const { data: subjectEvents, error: subjectError } = await supabase
    .from("event_subjects")
    .select("event_id")
    .eq("individual_id", individualId)
    .eq("tree_id", treeId);

  if (subjectError) throw subjectError;

  // Handle each event where the individual is a subject
  for (const subjectEvent of subjectEvents || []) {
    // Count how many subjects this event has
    const { data: subjectCount, error: countError } = await supabase
      .from("event_subjects")
      .select("id", { count: "exact" })
      .eq("event_id", subjectEvent.event_id)
      .eq("tree_id", treeId);

    if (countError) throw countError;

    // If this is the only subject, delete the entire event
    if (subjectCount && subjectCount.length === 1) {
      // Delete event participants first (due to foreign key constraints)
      const { error: participantError } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", subjectEvent.event_id)
        .eq("tree_id", treeId);

      if (participantError) throw participantError;

      // Delete event subjects
      const { error: subjectsError } = await supabase
        .from("event_subjects")
        .delete()
        .eq("event_id", subjectEvent.event_id)
        .eq("tree_id", treeId);

      if (subjectsError) throw subjectsError;

      // Delete the event itself
      const { error: eventError } = await supabase
        .from("events")
        .delete()
        .eq("id", subjectEvent.event_id)
        .eq("tree_id", treeId);

      if (eventError) throw eventError;
    } else {
      // If there are other subjects, just remove this individual's subject relationship
      const { error: removeSubjectError } = await supabase
        .from("event_subjects")
        .delete()
        .eq("event_id", subjectEvent.event_id)
        .eq("individual_id", individualId)
        .eq("tree_id", treeId);

      if (removeSubjectError) throw removeSubjectError;
    }
  }

  // Remove all participant relationships for this individual
  const { error: participantError } = await supabase
    .from("event_participants")
    .delete()
    .eq("individual_id", individualId)
    .eq("tree_id", treeId);

  if (participantError) throw participantError;

  // Now delete the individual (this will cascade to names and family_children)
  const { error: individualError } = await supabase
    .from("individuals")
    .delete()
    .eq("id", individualId)
    .eq("tree_id", treeId);

  if (individualError) throw individualError;

  return { success: true };
}

export type DeleteIndividualResult = Awaited<
  ReturnType<typeof deleteIndividual>
>;
