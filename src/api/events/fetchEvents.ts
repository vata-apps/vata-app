import { supabase } from "@/lib/supabase";
import { fetchIndividuals } from "../individuals/fetchIndividuals";

interface Params {
  eventTypes?: string[];
  individualIds?: string[];
}

export async function fetchEvents(
  treeId: string,
  { eventTypes, individualIds }: Params,
) {
  let query = supabase
    .from("event_subjects")
    .select(
      `
      id,
      event:events!inner(
        id,
        date,
        event_types!inner(name),
        place:places(id, name),
        participants:event_participants!inner(individual_id, role:event_roles!inner(name))
      )
    `,
    )
    .eq("tree_id", treeId);

  if (eventTypes) {
    query = query.in("event.event_types.name", eventTypes);
  }

  if (individualIds) {
    query = query.in("individual_id", individualIds);
  }

  const { data, error } = await query;

  if (error) throw error;

  const participantsIndividualIds = data.flatMap((event_subject) => {
    return event_subject.event.participants.map(
      (participant) => participant.individual_id,
    );
  });

  const participants = await fetchIndividuals(treeId, {
    individualIds: participantsIndividualIds,
  });

  return data.map((event_subject) => {
    const { event } = event_subject;

    return {
      id: event.id,
      date: event.date,
      place: event.place,
      type: event.event_types.name,
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
