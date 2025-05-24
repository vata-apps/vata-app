import { FamilyMember } from "@/components/individual/FamilyMember";
import { Enums } from "@/database.types";
import { supabase } from "@/lib/supabase";
import { IndividualWithNames } from "@/types";
import { capitalize } from "@/utils/strings";
import {
  Button,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
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

// Local type guard for this component's Event type
function isIndividualEventLocal(event: Event): event is IndividualEvent {
  return event.eventType === "individual";
}

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

  if (isLoading) return <Loader />;

  if (events.length === 0) {
    return <Text c="dimmed">No events found at {placeName}</Text>;
  }

  return (
    <Stack gap="sm">
      <Title order={4}>Events at {placeName}</Title>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Person/Family</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th style={{ textAlign: "right" }}></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {events.map((event) => (
            <Table.Tr key={`${event.eventType}-${event.id}`}>
              <Table.Td>{event.date}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {isIndividualEventLocal(event) ? (
                    <UserIcon size={16} />
                  ) : (
                    <UsersIcon size={16} />
                  )}

                  {capitalize(event.type)}
                </Group>
              </Table.Td>
              <Table.Td>
                {isIndividualEventLocal(event) ? (
                  <FamilyMember
                    individual={event.individual as IndividualWithNames}
                  />
                ) : (
                  <Group gap={0}>
                    <UsersIcon size={16} />
                    <Button
                      variant="transparent"
                      size="compact-sm"
                      component={Link}
                      to={`/families/${event.familyId}`}
                    >
                      {event.family}
                    </Button>
                  </Group>
                )}
              </Table.Td>
              <Table.Td>{event.description || "-"}</Table.Td>
              <Table.Td align="right">
                <Button
                  variant="default"
                  size="xs"
                  component={Link}
                  to={
                    isIndividualEventLocal(event)
                      ? `/individuals/${event.individual.id}`
                      : `/families/${event.familyId}`
                  }
                >
                  <Group gap="xs">
                    <Pencil size={14} />
                    <span style={{ fontSize: "var(--mantine-font-size-sm)" }}>
                      Edit
                    </span>
                  </Group>
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
