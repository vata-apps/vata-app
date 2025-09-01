import { supabase } from "@/lib/supabase";
import { formatGedcomId } from "./utils/formatGedcomId";

interface Params {
  individualIds: string[];
}

export async function getIndividuals(params: Params) {
  const { individualIds } = params;

  const { data, error } = await supabase
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
    .in("individuals.id", individualIds)
    .eq("is_primary", true);

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

    const gedcomId = formatGedcomId({
      id: individuals.gedcom_id,
      module: "individuals",
    });

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

export type GetIndividuals = Awaited<ReturnType<typeof getIndividuals>>;
