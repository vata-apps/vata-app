import { fetchEvent } from "@/api";
import { EventHeader } from "@/components/event/EventHeader";
import {
  FamilyMember,
  IndividualWithNames,
} from "@/components/individual/FamilyMember";
import { Enums } from "@/database.types";
import {
  Badge,
  Button,
  Loader,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

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
    return search as { eventType: "individual" | "family" };
  },
});

function EventIndividuals({ event }: { event: Event }) {
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
    return <Text>No individuals associated with this event</Text>;
  }

  return (
    <Stack gap="sm">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Relationship</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {individuals.map((individual) => (
            <Table.Tr key={individual.id}>
              <Table.Td>
                <FamilyMember
                  individual={
                    {
                      id: individual.id,
                      gender: individual.gender,
                      names: individual.names,
                    } as IndividualWithNames
                  }
                />
              </Table.Td>
              <Table.Td>
                <Badge variant="default">{individual.relationship}</Badge>
              </Table.Td>
              <Table.Td ta="right">
                <Button
                  variant="default"
                  size="xs"
                  component={Link}
                  to={`/individuals/${individual.id}`}
                >
                  View
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
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

  if (status === "pending") return <Loader />;
  if (status === "error")
    return <Text>Error loading event: {error.message}</Text>;
  if (!event) return <Text>Event not found</Text>;

  const typedEvent = event as unknown as Event;

  return (
    <Stack>
      {/* Header Section */}
      <EventHeader event={typedEvent} />

      {/* Tabs Section */}
      <Tabs defaultValue="details" mt="lg" variant="default">
        <Tabs.List className="w-full justify-start">
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="individuals">Individuals</Tabs.Tab>
        </Tabs.List>

        {/* Details Tab */}
        <Tabs.Panel py="lg" value="details">
          <Stack gap="lg">
            <Title order={4}>Event Information</Title>
            {typedEvent.description && <Text>{typedEvent.description}</Text>}
          </Stack>
        </Tabs.Panel>

        {/* Individuals Tab */}
        <Tabs.Panel py="lg" value="individuals">
          <EventIndividuals event={typedEvent} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

export default EventPage;
