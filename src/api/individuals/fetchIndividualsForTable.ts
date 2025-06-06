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
  let data = individualsWithNames.map((individual) => {
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

  if (params.search) {
    data = data.filter((individual) => {
      const completeName = `${individual.firstName} ${individual.lastName}`;
      const completeNameInverted = `${individual.lastName} ${individual.firstName}`;
      const regex = new RegExp(params.search, "i");
      return (
        regex.test(completeName) ||
        regex.test(completeNameInverted) ||
        regex.test(individual.birth.place ?? "") ||
        regex.test(individual.death.place ?? "")
      );
    });
  }

  if (params.gender !== "all") {
    data = data.filter((individual) => individual.gender === params.gender);
  }

  if (params.sort) {
    data = data.sort((a, b) => {
      const firstNameA = a.firstName?.toLocaleLowerCase() ?? "";
      const firstNameB = b.firstName?.toLocaleLowerCase() ?? "";
      const lastNameA = a.lastName?.toLocaleLowerCase() ?? "";
      const lastNameB = b.lastName?.toLocaleLowerCase() ?? "";

      if (params.sort === "last_name_asc") {
        const firstNameComparison = firstNameA?.localeCompare(firstNameB) ?? 0;
        const lastNameComparison = lastNameA?.localeCompare(lastNameB) ?? 0;

        return lastNameComparison || firstNameComparison;
      }

      if (params.sort === "last_name_desc") {
        const firstNameComparison = firstNameB?.localeCompare(firstNameA) ?? 0;
        const lastNameComparison = lastNameB?.localeCompare(lastNameA) ?? 0;

        return lastNameComparison || firstNameComparison;
      }

      if (params.sort === "first_name_asc") {
        const firstNameComparison = firstNameA?.localeCompare(firstNameB) ?? 0;
        const lastNameComparison = lastNameA?.localeCompare(lastNameB) ?? 0;

        return firstNameComparison || lastNameComparison;
      }

      if (params.sort === "first_name_desc") {
        const firstNameComparison = firstNameB?.localeCompare(firstNameA) ?? 0;
        const lastNameComparison = lastNameB?.localeCompare(lastNameA) ?? 0;

        return firstNameComparison || lastNameComparison;
      }

      return 0;
    });
  }

  return data;
}

export type IndividualForTable = Awaited<
  ReturnType<typeof fetchIndividualsForTable>
>[number];
