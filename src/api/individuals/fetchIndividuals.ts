import { supabase } from "../../lib/supabase";

interface Params {
  individualIds?: string[];
}

export async function fetchIndividuals(treeId: string, params: Params) {
  let query = supabase
    .from("names")
    .select(
      `
        first_name,
        last_name,
        individuals!inner(
          id,
          gedcom_id,
          gender,
          event_subjects:event_subjects(
            id,
            event:events(
              id,
              event_type:event_types(id, name),
              date,
              place:places(id, name)
            )
          )
        )
      `,
    )
    .eq("tree_id", treeId)
    .eq("is_primary", true);

  if (params.individualIds) {
    query = query.in("individuals.id", params.individualIds);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data?.map(({ individuals, first_name, last_name }) => {
    const birth = individuals.event_subjects?.find(
      ({ event }) => event.event_type.name === "Birth",
    );

    const birthDate = birth?.event.date;
    const birthPlace = birth?.event.place;

    const death = individuals.event_subjects?.find(
      ({ event }) => event.event_type.name === "Death",
    );

    const deathDate = death?.event.date;
    const deathPlace = death?.event.place;
    const lifeSpan = (() => {
      if (birthDate && deathDate) return `${birthDate} - ${deathDate}`;
      if (birthDate && !deathDate) return `${birthDate} - xxxx`;
      if (!birthDate && deathDate) return `xxxx - ${deathDate}`;
      return "Unknown";
    })();

    const gedcomId = (() => {
      if (!individuals.gedcom_id) return null;
      return `I-${individuals.gedcom_id.toString().padStart(4, "0")}`;
    })();

    return {
      id: individuals.id,
      gedcomId,
      gender: individuals.gender,
      firstName: first_name,
      lastName: last_name,
      birth: birth && { date: birthDate, place: birthPlace },
      death: death && { date: deathDate, place: deathPlace },
      lifeSpan,
    };
  });
}

export type Individuals = Awaited<ReturnType<typeof fetchIndividuals>>;
