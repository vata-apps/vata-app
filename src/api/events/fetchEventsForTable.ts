import { supabase } from "@/lib/supabase";

export async function fetchEventsForTable(
  treeId: string,
  { placeIds }: { placeIds?: string[] },
) {
  let eventsQuery = supabase
    .from("events")
    .select(
      `
        id,
        date,
        event_types(id, name),
        places!inner(id, name)
      `,
    )
    .eq("tree_id", treeId);

  if (placeIds && placeIds.length > 0) {
    eventsQuery = eventsQuery.in("places.id", placeIds);
  }

  const eventSubjectsQuery = supabase
    .from("event_subjects")
    .select("id, event_id, individual_id")
    .eq("tree_id", treeId);

  const individualsQuery = supabase
    .from("individuals")
    .select("id, gender, names(id, first_name, last_name)")
    .eq("tree_id", treeId)
    .eq("names.is_primary", true);

  const [events, eventSubjects, individuals] = await Promise.all([
    eventsQuery,
    eventSubjectsQuery,
    individualsQuery,
  ]);

  if (events.error) throw events.error;
  if (eventSubjects.error) throw eventSubjects.error;
  if (individuals.error) throw individuals.error;

  const eventsForTable = events.data?.map((event) => {
    const subjects = eventSubjects.data
      .filter(({ event_id }) => event_id === event.id)
      .map(({ individual_id }) =>
        individuals.data.find(({ id }) => id === individual_id),
      )
      .filter(
        (child): child is NonNullable<typeof child> => child !== undefined,
      );

    return {
      id: event.id,
      eventType: event.event_types,
      date: event.date,
      place: event.places,
      individuals: subjects,
    };
  });

  return eventsForTable;
}

export type EventForTable = Awaited<
  ReturnType<typeof fetchEventsForTable>
>[number];
