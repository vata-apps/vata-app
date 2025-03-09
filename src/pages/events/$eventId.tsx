import { fetchEvent } from "@/api";
import {
  FamilyMember,
  IndividualWithNames,
} from "@/components/individual/FamilyMember";
import { H2 } from "@/components/typography/h2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Enums } from "@/database.types";
import { formatDate } from "@/utils/dates";
import displayName from "@/utils/displayName";
import { capitalize } from "@/utils/strings";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarIcon, MapPinIcon, UserIcon, UsersIcon } from "lucide-react";

// Define types for our events
type EventBase = {
  id: string;
  date: string | null;
  description: string | null;
  place_id: string | null;
  places?: {
    id: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
  } | null;
  eventType: "individual" | "family";
};

type IndividualEvent = EventBase & {
  eventType: "individual";
  individual_id: string;
  individuals: {
    id: string;
    gender: Enums<"gender">;
    names: Array<{
      first_name: string | null;
      last_name: string | null;
      is_primary: boolean;
    }>;
  };
  individual_event_types: { id: string; name: string };
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
      gender: Enums<"gender">;
      names: Array<{
        first_name: string | null;
        last_name: string | null;
        is_primary: boolean;
      }>;
    } | null;
    wife?: {
      id: string;
      gender: Enums<"gender">;
      names: Array<{
        first_name: string | null;
        last_name: string | null;
        is_primary: boolean;
      }>;
    } | null;
  };
  family_event_types: { id: string; name: string };
};

type Event = IndividualEvent | FamilyEvent;

export const Route = createFileRoute("/events/$eventId")({
  component: EventPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      eventType: (search.eventType as "individual" | "family") || "individual",
    };
  },
});

function EventHeader({ event }: { event: Event }) {
  const getEventTitle = () => {
    if (event.eventType === "individual") {
      const individual = event.individuals;
      const eventType = capitalize(
        event.individual_event_types?.name || "Event",
      );
      return `${eventType} - ${displayName(individual?.names)}`;
    } else {
      const family = event.families;
      const eventType = capitalize(event.family_event_types?.name || "Event");
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
    <Card>
      <CardHeader>
        <H2>{getEventTitle()}</H2>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          {event.places && (
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              <Link
                to="/places/$placeId"
                params={{ placeId: event.place_id || "" }}
                className="text-primary hover:underline"
              >
                {event.places.name}
              </Link>
            </div>
          )}
          <div className="flex items-center gap-1">
            {event.eventType === "individual" ? (
              <>
                <UserIcon className="h-4 w-4" />
                <Link
                  to="/individuals/$individualId"
                  params={{ individualId: event.individual_id }}
                  className="text-primary hover:underline"
                >
                  {displayName(event.individuals?.names)}
                </Link>
              </>
            ) : (
              <>
                <UsersIcon className="h-4 w-4" />
                <Link
                  to="/families/$familyId"
                  params={{ familyId: event.family_id }}
                  className="text-primary hover:underline"
                >
                  {getEventTitle().split(" - ")[1]}
                </Link>
              </>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function EventIndividuals({ event }: { event: Event }) {
  // For individual events, we just have one individual
  // For family events, we have husband and wife
  const individuals = [];

  if (event.eventType === "individual") {
    individuals.push({
      id: event.individual_id,
      gender: event.individuals.gender,
      names: event.individuals.names,
      relationship: "Primary",
    });
  } else {
    const family = event.families;

    if (family.husband) {
      individuals.push({
        id: family.husband_id!,
        gender: family.husband.gender,
        names: family.husband.names,
        relationship: "Husband",
      });
    }

    if (family.wife) {
      individuals.push({
        id: family.wife_id!,
        gender: family.wife.gender,
        names: family.wife.names,
        relationship: "Wife",
      });
    }
  }

  if (individuals.length === 0) {
    return (
      <Card>
        <CardHeader>No individuals associated with this event</CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>Individuals</CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Individual</TableHead>
              <TableHead className="w-1/4">Relationship</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {individuals.map((individual) => (
              <TableRow key={individual.id}>
                <TableCell>
                  <FamilyMember
                    individual={
                      {
                        id: individual.id,
                        gender: individual.gender,
                        names: individual.names,
                      } as IndividualWithNames
                    }
                  />
                </TableCell>
                <TableCell>{individual.relationship}</TableCell>
                <TableCell className="text-right">
                  <Button variant="secondary" size="sm" asChild>
                    <Link
                      to="/individuals/$individualId"
                      params={{ individualId: individual.id }}
                    >
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function EventPage() {
  const { eventId } = Route.useParams();
  const { eventType } = Route.useSearch();

  const {
    data: event,
    status,
    error,
  } = useQuery({
    queryKey: ["event", eventId, eventType],
    queryFn: () => fetchEvent(eventId, eventType),
    placeholderData: keepPreviousData,
  });

  if (status === "pending") {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Loading...</CardHeader>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Error loading event: {error.message}</CardHeader>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Event not found</CardHeader>
        </Card>
      </div>
    );
  }

  // Cast the event to unknown first to avoid type errors
  const typedEvent = event as unknown as Event;

  return (
    <div className="container mx-auto py-6 space-y-8">
      <EventHeader event={typedEvent} />

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="individuals">Individuals</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>Event Information</CardHeader>
            <CardContent className="space-y-4">
              {typedEvent.description && (
                <div>
                  <h3 className="text-sm font-medium">Description</h3>
                  <p>{typedEvent.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individuals" className="space-y-4 mt-4">
          <EventIndividuals event={typedEvent} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EventPage;
