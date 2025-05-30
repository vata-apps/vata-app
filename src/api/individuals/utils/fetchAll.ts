import type { Individual } from "../types";
import { fetchAndCombineEvents } from "./fetchEvents";
import { fetchIndividualsWithNames } from "./fetchIndividualsBasic";

// Type for individual data without events (as returned by fetchIndividualsWithNames)
type PartialIndividual = {
  id: string;
  gender: string | null;
  names: {
    first_name: string;
    last_name: string;
    is_primary: boolean;
  }[];
};

// Cache for all individuals data
let individualsCache: Individual[] | null = null;

/**
 * Fetches all individuals from the database with related data
 * Results are cached for subsequent calls
 */
export async function fetchAllIndividuals(): Promise<Individual[]> {
  if (individualsCache) {
    return individualsCache;
  }

  // Fetch basic individual data
  const individuals = await fetchIndividualsWithNames();

  if (individuals.length === 0) {
    individualsCache = [];
    return individualsCache;
  }

  // Get individual IDs for event queries
  const individualIds = individuals.map((ind: { id: string }) => ind.id);

  // Fetch and combine all events
  const eventsByIndividual = await fetchAndCombineEvents(individualIds);

  // Combine all data
  individualsCache = individuals.map((individual: PartialIndividual) => ({
    ...individual,
    individual_events: eventsByIndividual[individual.id] || [],
  }));

  return individualsCache!;
}

/**
 * Clears the individuals cache
 * Call this when individuals data might have changed
 */
export function clearIndividualsCache() {
  individualsCache = null;
}
