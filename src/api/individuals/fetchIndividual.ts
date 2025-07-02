import { fetchIndividuals } from "./fetchIndividuals";

export async function fetchIndividual(treeId: string, individualId: string) {
  const individuals = await fetchIndividuals(treeId, {
    individualIds: [individualId],
  });

  if (individuals.length === 0) throw new Error("Individual not found");
  if (individuals.length > 1) throw new Error("Multiple individuals found");

  return individuals[0];
}

export type Individual = Awaited<ReturnType<typeof fetchIndividual>>;
