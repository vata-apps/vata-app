import { supabase } from "../../lib/supabase";
import type { Individual, IndividualFilters } from "./types";

/**
 * Filters individuals based on search query and filters
 */
export async function filterIndividuals(
  individuals: Individual[],
  query?: string,
  filters?: IndividualFilters,
): Promise<Individual[]> {
  let filtered = individuals;

  // Apply name search filter
  if (query) {
    const searchTerm = query.toLowerCase();
    filtered = filtered.filter((individual) =>
      individual.names.some(
        (name) =>
          name.first_name?.toLowerCase().includes(searchTerm) ||
          name.last_name?.toLowerCase().includes(searchTerm),
      ),
    );
  }

  // Apply event filter
  if (filters?.event) {
    const { eventId, role } = filters.event;

    if (role === "subject") {
      // Get all individuals who are subjects of the event
      const { data: eventSubjects, error } = await supabase
        .from("event_subjects")
        .select("individual_id")
        .eq("event_id", eventId);

      if (error) throw error;

      const subjectIds = new Set(
        eventSubjects?.map((es) => es.individual_id) || [],
      );
      filtered = filtered.filter((individual) => subjectIds.has(individual.id));
    } else if (role === "participant") {
      // Get all individuals who are participants of the event
      const { data: eventParticipants, error } = await supabase
        .from("event_participants")
        .select("individual_id")
        .eq("event_id", eventId);

      if (error) throw error;

      const participantIds = new Set(
        eventParticipants?.map((ep) => ep.individual_id) || [],
      );
      filtered = filtered.filter((individual) =>
        participantIds.has(individual.id),
      );
    }
  }

  // Apply family filter
  if (filters?.family) {
    const { familyId, role } = filters.family;

    if (role === "parent") {
      // Get parents of the family (husband and wife)
      const { data: family, error } = await supabase
        .from("families")
        .select("husband_id, wife_id")
        .eq("id", familyId)
        .single();

      if (error) throw error;

      const parentIds = new Set(
        [family?.husband_id, family?.wife_id].filter(Boolean),
      );
      filtered = filtered.filter((individual) => parentIds.has(individual.id));
    } else if (role === "children") {
      // Get children of the family
      const { data: familyChildren, error } = await supabase
        .from("family_children")
        .select("individual_id")
        .eq("family_id", familyId);

      if (error) throw error;

      const childrenIds = new Set(
        familyChildren?.map((fc) => fc.individual_id) || [],
      );
      filtered = filtered.filter((individual) =>
        childrenIds.has(individual.id),
      );
    }
  }

  return filtered;
}
