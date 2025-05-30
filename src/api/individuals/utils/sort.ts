import { SortConfig } from "@/types/sort";
import type { Individual } from "../types";

/**
 * Sorts individuals based on sort configuration
 */
export function sortIndividuals(
  individuals: Individual[],
  sort?: SortConfig,
): Individual[] {
  if (!sort) {
    // Default sort by last name
    return individuals.sort((a, b) => {
      const aName = a.names.find(
        (n: { is_primary: boolean; last_name: string }) => n.is_primary,
      );
      const bName = b.names.find(
        (n: { is_primary: boolean; last_name: string }) => n.is_primary,
      );
      const aLastName = aName?.last_name || "";
      const bLastName = bName?.last_name || "";
      return aLastName.localeCompare(bLastName);
    });
  }

  const { field, direction } = sort;
  const multiplier = direction === "asc" ? 1 : -1;

  return individuals.sort((a, b) => {
    const aName = a.names.find(
      (n: { is_primary: boolean; first_name: string; last_name: string }) =>
        n.is_primary,
    );
    const bName = b.names.find(
      (n: { is_primary: boolean; first_name: string; last_name: string }) =>
        n.is_primary,
    );

    let aValue: string;
    let bValue: string;

    if (field === "first_name") {
      aValue = aName?.first_name || "";
      bValue = bName?.first_name || "";
    } else {
      aValue = aName?.last_name || "";
      bValue = bName?.last_name || "";
    }

    return aValue.localeCompare(bValue) * multiplier;
  });
}
