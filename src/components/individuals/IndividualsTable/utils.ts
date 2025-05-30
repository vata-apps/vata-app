import type { IndividualsTableProps } from "./types";

/**
 * Helper function to safely extract first element from array or return the value
 */
export function getFirstOrValue<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Generates query key with proper typing for React Query
 */
export function generateQueryKey(
  filters: IndividualsTableProps["filters"],
): string[] {
  return ["individuals", ...(filters ? [JSON.stringify(filters)] : [])];
}
