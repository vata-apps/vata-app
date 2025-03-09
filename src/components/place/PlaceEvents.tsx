import {
  FamilyMember,
  IndividualWithNames,
} from "@/components/individual/FamilyMember";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Enums } from "@/database.types";
import { supabase } from "@/lib/supabase";
import { capitalize } from "@/utils/strings";
import { Link } from "@tanstack/react-router";
import { Pencil, UserIcon, UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";

type IndividualEvent = {
  id: string;
  type: string;
  individual: {
    id: string;
    name: string;
    gender: Enums<"gender">;
    names: {
      first_name: string | null;
      last_name: string | null;
      is_primary: boolean;
    }[];
  };
  date: string;
  eventType: "individual";
  place?: {
    id: string;
    name: string;
  } | null;
  description?: string;
};

type FamilyEvent = {
  id: string;
  type: string;
  family: string;
  familyId: string;
  date: string;
  eventType: "family";
  place?: {
    id: string;
    name: string;
  } | null;
  description?: string;
};

type Event = IndividualEvent | FamilyEvent;

type PlaceEventsProps = {
  placeId: string;
};

// Define types for the Supabase query results
type IndividualEventResult = {
  id: string;
  date: string | null;
  description: string | null;
  type_id: string;
  individual_event_types: {
    id: string;
    name: string;
  };
  individual_id: string;
  individuals: {
    id: string;
    gender: Enums<"gender">;
    names: {
      first_name: string | null;
      last_name: string | null;
      is_primary: boolean;
    }[];
  };
  place_id: string | null;
  places: {
    id: string;
    name: string;
  } | null;
};

type FamilyEventResult = {
  id: string;
  date: string | null;
  description: string | null;
  type_id: string;
  family_event_types: {
    id: string;
    name: string;
  };
  family_id: string;
  families: {
    id: string;
    husband_id: string | null;
    wife_id: string | null;
    husband: {
      id: string;
      gender: Enums<"gender">;
      names: {
        first_name: string | null;
        last_name: string | null;
        is_primary: boolean;
      }[];
    } | null;
    wife: {
      id: string;
      gender: Enums<"gender">;
      names: {
        first_name: string | null;
        last_name: string | null;
        is_primary: boolean;
      }[];
    } | null;
  };
  place_id: string | null;
  places: {
    id: string;
    name: string;
  } | null;
};

export function PlaceEvents({ placeId }: PlaceEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [placeName, setPlaceName] = useState("this place");

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);

      try {
        // Fetch place name
        const { data: placeData, error: placeError } = await supabase
          .from("places")
          .select("name")
          .eq("id", placeId)
          .single();

        if (placeError) {
          console.error("Error fetching place:", placeError);
        } else if (placeData) {
          setPlaceName(placeData.name);
        }

        // Fetch individual events for this place
        const { data: individualEventsData, error: individualEventsError } =
          await supabase
            .from("individual_events")
            .select(
              `
            id, 
            date, 
            description,
            type_id,
            individual_event_types(id, name),
            individual_id,
            individuals(
              id,
              gender,
              names(first_name, last_name, is_primary)
            ),
            place_id,
            places(id, name)
          `,
            )
            .eq("place_id", placeId)
            .order("date", { ascending: false, nullsFirst: false });

        if (individualEventsError) {
          console.error(
            "Error fetching individual events:",
            individualEventsError,
          );
          return;
        }

        // Fetch family events for this place
        const { data: familyEventsData, error: familyEventsError } =
          await supabase
            .from("family_events")
            .select(
              `
            id, 
            date, 
            description,
            type_id,
            family_event_types(id, name),
            family_id,
            families(
              id,
              husband_id,
              wife_id,
              husband:individuals!families_husband_id_fkey(
                id,
                gender,
                names(first_name, last_name, is_primary)
              ),
              wife:individuals!families_wife_id_fkey(
                id,
                gender,
                names(first_name, last_name, is_primary)
              )
            ),
            place_id,
            places(id, name)
          `,
            )
            .eq("place_id", placeId)
            .order("date", { ascending: false, nullsFirst: false });

        if (familyEventsError) {
          console.error("Error fetching family events:", familyEventsError);
          return;
        }

        // Transform individual events to match the component's expected format
        const formattedIndividualEvents: IndividualEvent[] = (
          individualEventsData as unknown as IndividualEventResult[]
        ).map((event) => {
          const names = event.individuals?.names || [];
          const primaryName =
            names.find((name) => name.is_primary) || names[0] || {};
          const fullName =
            `${primaryName.first_name || ""} ${primaryName.last_name || ""}`.trim();

          return {
            id: event.id,
            type: event.individual_event_types?.name || "",
            individual: {
              id: event.individual_id,
              name: fullName,
              gender: event.individuals?.gender || "male",
              names: event.individuals?.names || [],
            },
            date: event.date || "",
            eventType: "individual",
            place: event.places
              ? {
                  id: event.places.id,
                  name: event.places.name,
                }
              : null,
            description: event.description || undefined,
          };
        });

        // Transform family events to match the component's expected format
        const formattedFamilyEvents: FamilyEvent[] = (
          familyEventsData as unknown as FamilyEventResult[]
        ).map((event) => {
          const husbandNames = event.families?.husband?.names || [];
          const wifeNames = event.families?.wife?.names || [];

          const husbandPrimaryName =
            husbandNames.find((name) => name.is_primary) ||
            husbandNames[0] ||
            {};
          const wifePrimaryName =
            wifeNames.find((name) => name.is_primary) || wifeNames[0] || {};

          const husbandFullName =
            `${husbandPrimaryName.first_name || ""} ${husbandPrimaryName.last_name || ""}`.trim();
          const wifeFullName =
            `${wifePrimaryName.first_name || ""} ${wifePrimaryName.last_name || ""}`.trim();

          const familyName =
            husbandFullName && wifeFullName
              ? `${husbandFullName} & ${wifeFullName} Family`
              : husbandFullName
                ? `${husbandFullName} Family`
                : wifeFullName
                  ? `${wifeFullName} Family`
                  : "Unknown Family";

          return {
            id: event.id,
            type: event.family_event_types?.name || "",
            family: familyName,
            familyId: event.family_id,
            date: event.date || "",
            eventType: "family",
            place: event.places
              ? {
                  id: event.places.id,
                  name: event.places.name,
                }
              : null,
            description: event.description || undefined,
          };
        });

        // Combine and sort all events by date
        const allEvents: Event[] = [
          ...formattedIndividualEvents,
          ...formattedFamilyEvents,
        ].sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setEvents(allEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [placeId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading events...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading events...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events at {placeName}</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Person/Family</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={`${event.eventType}-${event.id}`}>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {event.eventType === "individual" ? (
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Badge variant="outline">{capitalize(event.type)}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.eventType === "individual" ? (
                      <FamilyMember
                        individual={event.individual as IndividualWithNames}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="h-6 p-0"
                        >
                          <Link
                            to="/families/$familyId"
                            params={{ familyId: event.familyId }}
                          >
                            {event.family}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      {event.eventType === "individual" ? (
                        <Link
                          to="/individuals/$individualId"
                          params={{ individualId: event.individual.id }}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      ) : (
                        <Link
                          to="/families/$familyId"
                          params={{ familyId: event.familyId }}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-muted-foreground text-center py-8">
            No events found at {placeName}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
