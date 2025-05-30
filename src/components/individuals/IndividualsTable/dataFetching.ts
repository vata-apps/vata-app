import { fetchIndividuals } from "@/api";
import type { TableState } from "@/components/table-data/types";
import { IndividualSortField } from "@/types/sort";
import type { Individual, IndividualsTableProps } from "./types";
import { getFirstOrValue } from "./utils";

/**
 * Creates the fetch function for the IndividualsTable
 */
export function createFetchTableData(
  filters: IndividualsTableProps["filters"],
) {
  return async (state: TableState) => {
    const response = await fetchIndividuals({
      page: state.pagination.pageIndex + 1,
      query: state.globalFilter,
      sort: state.sorting
        ? {
            field: state.sorting.id as IndividualSortField,
            direction: state.sorting.desc ? "desc" : "asc",
          }
        : { field: "last_name", direction: "asc" },
      filters,
    });

    // Transform the data to handle Supabase's array returns for joined data
    const transformedData = response.data.map((individual: unknown) => {
      const ind = individual as Record<string, unknown>;
      return {
        ...ind,
        individual_events: ((ind.individual_events as unknown[]) || []).map(
          (event: unknown) => {
            const evt = event as Record<string, unknown>;
            return {
              ...evt,
              individual_event_types: getFirstOrValue(
                evt.individual_event_types as
                  | { id: string; name: string }
                  | { id: string; name: string }[],
              ),
              places: getFirstOrValue(
                evt.places as
                  | { id: string; name: string }
                  | { id: string; name: string }[]
                  | null,
              ),
            };
          },
        ),
      };
    });

    return {
      data: transformedData as Individual[],
      total: response.total ?? 0,
    };
  };
}
