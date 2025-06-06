import { supabase } from "@/lib/supabase";

interface Params {
  eventTypes?: string[];
  individualIds: string[];
}

export async function fetchEventsByIndividualSubjects(
  treeId: string,
  params: Params,
) {
  const { eventTypes, individualIds } = params;

  let query = supabase
    .from("events")
    .select(
      `
        id,
        date,
        event_types!inner(name),
        event_subjects!inner(individual_id),
        places(name)
      `,
    )
    .eq("tree_id", treeId)
    .in("event_subjects.individual_id", individualIds);

  if (eventTypes) {
    query = query.in("event_types.name", eventTypes);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data.map((event) => {
    return {
      id: event.id,
      date: event.date,
      eventType: event.event_types.name,
      individualId: event.event_subjects[0].individual_id,
      place: event.places?.name,
    };
  });
}

export type EventByIndividualSubject = Awaited<
  ReturnType<typeof fetchEventsByIndividualSubjects>
>[number];
