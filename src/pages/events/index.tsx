import { fetchEvents } from "@/api";
import { H2 } from "@/components/typography/h2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/dates";
import { getEventTitle } from "@/utils/events";
import { usePagination } from "@/utils/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["events", page, query],
    queryFn: () => fetchEvents({ page, query }),
    placeholderData: keepPreviousData,
    enabled: !query || query.length > 2,
  });

  const handleSearch = (value: ChangeEvent<HTMLInputElement>) => {
    setQuery(value.target.value);
    setPage(1);
  };

  const totalPages = data?.total ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;
  const pagination = usePagination(page, totalPages);

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Date</TableHead>
            <TableHead className="w-1/2">Event</TableHead>
            <TableHead className="w-1/4">Place</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((event) => {
            // Cast the event to our Event type
            const typedEvent = event as unknown as Event;
            return (
              <TableRow key={`${typedEvent.eventType}-${typedEvent.id}`}>
                <TableCell>{formatDate(typedEvent.date)}</TableCell>
                <TableCell>{getEventTitle(typedEvent)}</TableCell>
                <TableCell>{typedEvent.places?.name || "Unknown"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="secondary" size="sm" asChild>
                    <Link
                      to="/events/$eventId"
                      params={{ eventId: typedEvent.id }}
                      search={{ eventType: typedEvent.eventType }}
                    >
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

export default EventsPage;
