import { fetchEventsByIndividualSubjects } from "../events";
import { fetchIndividualsWithNames } from "./";
import { IndividualGender, IndividualSort } from "./types";

interface Params {
  gender: IndividualGender;
  individualIds?: string[];
  search: string;
  sort: IndividualSort;
}

export async function fetchIndividualsForTable(treeId: string, params: Params) {
  // Get all individuals with their names
  const individualsWithNames = await fetchIndividualsWithNames(treeId, {
    individualIds: params.individualIds,
  });

  // Get all birth and death events for the individuals
  const eventsByIndividual = await fetchEventsByIndividualSubjects(treeId, {
    individualIds: individualsWithNames.map(({ id }) => id),
    eventTypes: ["Birth", "Death"],
  });

  // Combine the individuals with their events
  const data = individualsWithNames.map((individual) => {
    const events = eventsByIndividual.filter(
      (event) => event.individualId === individual.id,
    );

    const birthEvent = events.find((event) => event.eventType === "Birth");
    const deathEvent = events.find((event) => event.eventType === "Death");

    return {
      ...individual,
      birth: {
        date: birthEvent?.date,
        place: birthEvent?.place,
      },
      death: {
        date: deathEvent?.date,
        place: deathEvent?.place,
      },
    };
  });

  return data;
}

export type IndividualForTable = Awaited<
  ReturnType<typeof fetchIndividualsForTable>
>[number];
