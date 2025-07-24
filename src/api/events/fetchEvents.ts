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
  let query = supabase.from("events").select(`
    id, 
    date,
    gedcom_id,
    event_types!inner(id, key, name),
    place:places!inner(id, name),
    participants:event_participants!inner(
      individual_id,
      role:event_roles!inner(id, key, name)
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
    query = query.in("event_types.key", eventTypes);
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

  const individuals = await fetchIndividuals(treeId, {
    individualIds: participantsIndividualIds,
  });

  return data.map((event) => {
    const participants = event.participants
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
      gedcomId: `E-${event.gedcom_id?.toString().padStart(4, "0")}`,
      participants,
      place: event.place,
      title: getEventTitle({ event, participants }),
      type: event.event_types,
    };
  });
}

export type Events = Awaited<ReturnType<typeof fetchEvents>>;
