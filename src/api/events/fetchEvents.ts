import { supabase } from "@/lib/supabase";
import { fetchIndividuals } from "../individuals/fetchIndividuals";
import { getEventTitle } from "./utils/getEventTitle";

interface Params {
  eventIds?: string[];
  eventTypes?: string[];
  individualIds?: string[];
  placeIds?: string[];
}

export async function fetchEvents(
  treeId: string,
  { eventIds, eventTypes, individualIds, placeIds }: Params = {},
) {
  let query = supabase
    .from("events")
    .select(
      `
        id, 
        date,
        description,
        gedcom_id,
        event_types!inner(id, key, name),
        place:places(id, name),
        participants:event_participants(
          individual_id,
          role:event_roles(id, key, name)
        ),
        subjects:event_subjects(
          id,
          individual_id
        )
      `,
    )
    .eq("tree_id", treeId);

  // If filtering by individual IDs, we need to use a different approach
  if (individualIds) {
    // First, get the event IDs that have the specified individuals as subjects
    const { data: eventIdsWithSubjects, error: subjectsError } = await supabase
      .from("event_subjects")
      .select("event_id")
      .in("individual_id", individualIds)
      .eq("tree_id", treeId);

    if (subjectsError) throw subjectsError;

    const eventIdsToFilter = eventIdsWithSubjects.map((row) => row.event_id);

    if (eventIdsToFilter.length > 0) {
      query = query.in("id", eventIdsToFilter);
    } else {
      // If no events found for these individuals, return empty array
      return [];
    }
  }

  if (eventIds) {
    query = query.in("id", eventIds);
  }

  if (eventTypes) {
    query = query.in("event_types.key", eventTypes);
  }

  if (placeIds) {
    query = query.in("place_id", placeIds);
  }

  const { data, error } = await query;

  if (error) throw error;

  const participantsIndividualIds = data.flatMap((event) => {
    return (event.participants || []).map(
      (participant) => participant.individual_id,
    );
  });

  const individuals = await fetchIndividuals(treeId, {
    individualIds: participantsIndividualIds,
  });

  return data.map((event) => {
    const participants = (event.participants || [])
      .map((participant) => {
        const participantIndividual = individuals.find(
          (individual) => individual.id === participant.individual_id,
        );

        if (!participantIndividual) return null;

        return {
          ...participantIndividual,
          role: {
            id: participant.role.id,
            key: participant.role.key,
            name: participant.role.name,
          },
        };
      })
      .filter((participant) => participant !== null);

    return {
      id: event.id,
      date: event.date,
      description: event.description,
      gedcomId: `E-${event.gedcom_id?.toString().padStart(4, "0")}`,
      participants,
      place: event.place,
      title: getEventTitle({ event, participants }),
      type: event.event_types,
    };
  });
}

export type Events = Awaited<ReturnType<typeof fetchEvents>>;
