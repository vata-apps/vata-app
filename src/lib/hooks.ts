import { useQuery } from "@tanstack/react-query";
import {
  fetchIndividualById,
  fetchIndividuals,
  fetchIndividualsWithNames,
} from "./api";

/**
 * Hook to fetch all individuals from the API.
 * Uses React Query for data fetching and caching.
 * @returns Query object containing individuals data, loading state, and error state
 */
export function useIndividuals() {
  return useQuery({
    queryKey: ["individuals"],
    queryFn: fetchIndividuals,
  });
}

/**
 * Hook to fetch a single individual by their ID.
 * The query will only run if an ID is provided.
 * @param id The unique identifier of the individual to fetch
 * @returns Query object containing individual data, loading state, and error state
 */
export function useIndividual(id: string) {
  return useQuery({
    queryKey: ["individuals", id],
    queryFn: () => fetchIndividualById(id),
    enabled: Boolean(id), // Only run the query if an ID is provided
  });
}

/**
 * Hook to fetch paginated individuals with their associated names.
 * Uses React Query for data fetching and caching.
 * @param page The page number to fetch (zero-based)
 * @returns Query object containing paginated individuals with names data, loading state, and error state
 */
export function useIndividualsWithNames(page: number) {
  return useQuery({
    queryKey: ["individuals", "with-names", "paginated", page],
    queryFn: () => fetchIndividualsWithNames(page, 10),
  });
}
