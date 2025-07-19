import { supabase } from "@/lib/supabase";
import { fetchIndividuals } from "../individuals/fetchIndividuals";

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
  let query = supabase.from("events").select(`
    id, 
    date,
    gedcom_id,
    event_types!inner(id, name),
    place:places!inner(id, name),
    participants:event_participants!inner(
      individual_id,
      role:event_roles!inner(name)
    ),
    subjects:event_subjects!inner(
      id,
      individual_id
    )
  `);

  if (eventIds) {
    query = query.in("id", eventIds);
  }

  if (eventTypes) {
    query = query.in("event_types.name", eventTypes);
  }

  if (individualIds) {
    query = query.in("subjects.individual_id", individualIds);
  }

  if (placeIds) {
    query = query.in("place.id", placeIds);
  }

  const { data, error } = await query;

  if (error) throw error;

  const participantsIndividualIds = data.flatMap((event) => {
    return event.participants.map((participant) => participant.individual_id);
  });

  const participants = await fetchIndividuals(treeId, {
    individualIds: participantsIndividualIds,
  });

  return data.map((event) => {
    return {
      id: event.id,
      date: event.date,
      gedcomId: `E-${event.gedcom_id?.toString().padStart(4, "0")}`,
      place: event.place,
      type: event.event_types,
      participants: event.participants
        .map((participant) => {
          const participantIndividual = participants.find(
            (individual) => individual.id === participant.individual_id,
          );

          if (!participantIndividual) return null;

          return {
            ...participantIndividual,
            role: participant.role.name,
          };
        })
        .filter((participant) => participant !== null),
    };
  });
}

export type Events = Awaited<ReturnType<typeof fetchEvents>>;
