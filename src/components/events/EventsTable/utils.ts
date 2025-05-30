import type { EventsTableProps } from "./types";

/**
 * Generates query key with proper typing for React Query
 */
export function generateQueryKey(
  filters: EventsTableProps["filters"],
): string[] {
  return ["events", ...(filters ? [JSON.stringify(filters)] : [])];
}
