import { EventWithRelations, fetchEvents } from "@/api";
import { PageHeader } from "@/components/PageHeader";
import { TableData } from "@/components/table-data";
import { TableState } from "@/components/table-data/types";
import { EventSortField } from "@/types/sort";
import { formatDate } from "@/utils/dates";
import { getEventTitle } from "@/utils/events";
import { Stack } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<EventWithRelations, unknown>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.date),
    size: 180,
    enableSorting: true,
  },
  {
    accessorKey: "event",
    header: "Event",
    cell: ({ row }) => getEventTitle(row.original),
    enableSorting: false,
    size: 400,
  },
  {
    accessorKey: "place",
    header: "Place",
    cell: ({ row }) => row.original.places?.name || "Unknown",
    enableSorting: false,
  },
];

export const Route = createFileRoute("/events/")({
  component: EventsPage,
});

function EventsPage() {
  const navigate = useNavigate();

  const fetchTableData = async (state: TableState) => {
    const response = await fetchEvents({
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
      totalCount: response.totalCount,
    };
  };

  const handleRowClick = (event: EventWithRelations) => {
    navigate({
      to: `/events/${event.id}`,
      search: { eventType: event.eventType },
    });
  };

  return (
    <Stack>
      <PageHeader title="Events" />

      <TableData<EventWithRelations>
        queryKey={["events"]}
        fetchData={fetchTableData}
        columns={columns}
        defaultSorting={{ id: "date", desc: false }}
        onRowClick={handleRowClick}
      >
        <TableData.Toolbar>
          <TableData.AddButton to="/events/new" />
          <TableData.Search placeholder="Search events" />
          <TableData.SortBy
            sortOptions={[
              { desc: false, id: "date", label: "Date (Oldest First)" },
              { desc: true, id: "date", label: "Date (Newest First)" },
            ]}
          />
        </TableData.Toolbar>

        <TableData.Table />
      </TableData>
    </Stack>
  );
}

export default EventsPage;
