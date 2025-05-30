import { fetchEventsFiltered } from "@/api";
import type { TableState } from "@/components/table-data/types";
import type { EventSortField } from "@/types/sort";
import type { Event, EventsTableProps } from "./types";

/**
 * Creates the fetch function for the EventsTable
 */
export function createFetchTableData(filters: EventsTableProps["filters"]) {
  return async (state: TableState) => {
    const response = await fetchEventsFiltered({
      page: state.pagination.pageIndex + 1,
      query: state.globalFilter,
      sort: state.sorting
        ? {
            field: state.sorting.id as EventSortField,
            direction: state.sorting.desc ? "desc" : "asc",
          }
        : { field: "date", direction: "asc" },
      placeId: filters?.placeId,
      familyId: filters?.familyId,
    });

    return {
      data: response.data as Event[],
      total: response.total ?? 0,
    };
  };
}
