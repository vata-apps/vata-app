import { fetchEvents } from "@/api";
import { PageHeader } from "@/components/PageHeader";
import { TableData } from "@/components/table-data";
import { EventSortField } from "@/types/sort";
import { formatDate } from "@/utils/dates";
import { getEventTitle } from "@/utils/events";
import { Button, Stack } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";

// Define types for our events
type EventBase = {
  id: string;
  date: string | null;
  description: string | null;
  place_id: string | null;
  places?: { name: string } | null;
};

type IndividualEvent = EventBase & {
  eventType: "individual";
  individual_id: string;
  individuals: {
    id: string;
    gender: string;
    names: Array<{
      first_name: string | null;
      last_name: string | null;
      is_primary: boolean;
    }>;
  };
  individual_event_types: { name: string };
};

type FamilyEvent = EventBase & {
  eventType: "family";
  family_id: string;
  families: {
    id: string;
    husband_id: string | null;
    wife_id: string | null;
    husband?: {
      id: string;
      gender: string;
      names: Array<{
        first_name: string | null;
        last_name: string | null;
        is_primary: boolean;
      }>;
    } | null;
    wife?: {
      id: string;
      gender: string;
      names: Array<{
        first_name: string | null;
        last_name: string | null;
        is_primary: boolean;
      }>;
    } | null;
  };
  family_event_types: { name: string };
};

type Event = IndividualEvent | FamilyEvent;

type RawEvent = Omit<Event, "eventType" | "places"> & {
  places?: { name: string }[] | { name: string } | null;
  individual_id?: string;
  family_id?: string;
};

type TableState = {
  globalFilter: string;
  sorting: { id: string; desc: boolean } | null;
  pagination: { pageIndex: number; pageSize: number };
};

export const Route = createFileRoute("/events/")({
  component: EventsPage,
});

const columns: ColumnDef<Event, unknown>[] = [
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
  },
  {
    accessorKey: "place",
    header: "Place",
    cell: ({ row }) => row.original.places?.name || "Unknown",
    size: 400,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <Button
          component={Link}
          size="xs"
          to={`/events/${row.original.id}?eventType=${row.original.eventType}`}
          variant="default"
        >
          View
        </Button>
      </div>
    ),
    size: 120,
    enableSorting: false,
  },
];

function EventsPage() {
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

    // Transform the response data to match our Event type
    const events = response.data.map((event: RawEvent) => {
      const places = Array.isArray(event.places)
        ? event.places[0]
        : event.places;

      const baseEvent = {
        ...event,
        places: places ? { name: places.name } : null,
      };

      if ("individual_id" in event) {
        return {
          ...baseEvent,
          eventType: "individual" as const,
        };
      }
      return {
        ...baseEvent,
        eventType: "family" as const,
      };
    });

    return {
      data: events as Event[],
      totalCount: response.total ?? 0,
    };
  };

  return (
    <Stack>
      <PageHeader title="Events" />

      <TableData<Event>
        queryKey={["events"]}
        fetchData={fetchTableData}
        columns={columns}
        defaultSorting={{ id: "date", desc: false }}
      >
        {/* <TableData.Filters createPagePath="/events/new" /> */}
        <TableData.Table />
      </TableData>
    </Stack>
  );
}

export default EventsPage;
