import { fetchEvents } from "@/api";
import { PageHeader } from "@/components/PageHeader";
import { TableData } from "@/components/table-data";
import { TableState } from "@/components/table-data/types";
import type { EventListItem } from "@/types/event";
import { EventSortField } from "@/types/sort";
import { formatDate } from "@/utils/dates";
import { capitalize } from "@/utils/strings";
import { Stack } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<EventListItem, unknown>[] = [
  {
    accessorKey: "event_type_name",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.event_type_name;
      return type ? capitalize(type) : "Unknown";
    },
    size: 150,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.date),
    size: 180,
  },
  {
    accessorKey: "subjects",
    header: "Subject(s)",
    cell: ({ row }) => {
      const subjects = row.original.subjects;
      return subjects ? subjects.replace(/,/g, " •") : "Unknown";
    },
    size: 300,
  },
  {
    accessorKey: "place_name",
    header: "Place",
    cell: ({ row }) => row.original.place_name || "Unknown",
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
      total: response.total,
    };
  };

  const handleRowClick = (event: EventListItem) => {
    navigate({
      to: `/events/${event.id}`,
    });
  };

  return (
    <Stack>
      <PageHeader title="Events" />

      <TableData<EventListItem>
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
              { desc: false, id: "event_type_name", label: "Type (A-Z)" },
              { desc: true, id: "event_type_name", label: "Type (Z-A)" },
              { desc: false, id: "place_name", label: "Place (A-Z)" },
              { desc: true, id: "place_name", label: "Place (Z-A)" },
            ]}
          />
        </TableData.Toolbar>

        <TableData.Table />
      </TableData>
    </Stack>
  );
}

export default EventsPage;
