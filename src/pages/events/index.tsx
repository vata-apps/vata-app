import { fetchEvents } from "@/api";
import { H2 } from "@/components/typography/h2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/dates";
import displayName from "@/utils/displayName";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
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

  const getEventTitle = (event: Event) => {
    if (event.eventType === "individual") {
      const individual = event.individuals;
      const eventType = event.individual_event_types?.name || "Event";
      return `${eventType} - ${displayName(individual?.names)}`;
    } else {
      const family = event.families;
      const eventType = event.family_event_types?.name || "Event";
      const husband = family?.husband;
      const wife = family?.wife;

      if (husband && wife) {
        return `${eventType} - ${displayName(husband.names)} & ${displayName(wife.names)}`;
      } else if (husband) {
        return `${eventType} - ${displayName(husband.names)}`;
      } else if (wife) {
        return `${eventType} - ${displayName(wife.names)}`;
      } else {
        return `${eventType} - Unknown Family`;
      }
    }
  };

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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsPage;
