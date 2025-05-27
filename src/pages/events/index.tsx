import { fetchEventsFiltered } from "@/api";
import { EventsTable } from "@/components/events";
import { PageHeader } from "@/components/PageHeader";
import type { TableState } from "@/components/table-data/types";
import type { EventSortField } from "@/types/sort";
import { Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/events/")({
  component: EventsPage,
});

function EventsPage() {
  const fetchTableData = async (state: TableState) => {
    const response = await fetchEventsFiltered({
      page: state.pagination.pageIndex + 1,
      query: state.globalFilter,
      sort: state.sorting
        ? {
            field: state.sorting.id as EventSortField,
            direction: state.sorting.desc ? "desc" : "asc",
          }
        : { field: "date", direction: "asc" },
    });

    return {
      data: response.data,
      total: response.total,
    };
  };

  return (
    <Stack>
      <PageHeader title="Events" />

      <EventsTable
        queryKey={["events"]}
        fetchData={fetchTableData}
        showPlaceColumn={true}
        showToolbar={true}
        showAddButton={true}
        defaultSorting={{ id: "date", desc: false }}
        searchPlaceholder="Search events"
      />
    </Stack>
  );
}
