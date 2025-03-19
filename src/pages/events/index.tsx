import { fetchEvents } from "@/api";
import { H2 } from "@/components/typography/h2";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { useSorting } from "@/hooks/useSorting";
import { EventSortField } from "@/types/sort";
import { formatDate } from "@/utils/dates";
import { getEventTitle } from "@/utils/events";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { ChangeEvent, useState } from "react";

const ITEMS_PER_PAGE = 10;

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

export const Route = createFileRoute("/events/")({
  component: EventsPage,
});

function EventsPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const { sorting, sortConfig, onSortingChange } = useSorting<EventSortField>({
    defaultField: "date",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["events", page, query, sortConfig],
    queryFn: () => fetchEvents({ page, query, sort: sortConfig }),
    placeholderData: keepPreviousData,
    enabled: !query || query.length > 2,
  });

  const handleSearch = (value: ChangeEvent<HTMLInputElement>) => {
    setQuery(value.target.value);
    setPage(1);
  };

  const handleSortingChange = (updatedSorting: SortingState) => {
    onSortingChange(updatedSorting);
    setPage(1);
  };

  const columns: ColumnDef<Event>[] = [
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
          <Button variant="secondary" size="sm" asChild>
            <Link
              to="/events/$eventId"
              params={{ eventId: row.original.id }}
              search={{ eventType: row.original.eventType }}
            >
              View
            </Link>
          </Button>
        </div>
      ),
      size: 120,
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-8">
      <H2>Events</H2>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search events"
          value={query}
          onChange={handleSearch}
          className="w-full max-w-sm"
        />

        {query && (
          <Button variant="secondary" onClick={() => setQuery("")}>
            Clear
          </Button>
        )}
      </div>

      {isLoading && <div>Loading events...</div>}

      {error && <div>Error loading events: {error.message}</div>}

      <DataTable
        columns={columns}
        data={(data?.data || []) as unknown as Event[]}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        page={page}
        totalItems={data?.total || 0}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />
    </div>
  );
}

export default EventsPage;
