import { supabase } from "@/lib/supabase";
import type { EventListItem } from "@/types/event";
import { formatDate } from "@/utils/dates";
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

type PlaceEventsProps = {
  placeId: string;
};

export function PlaceEvents({ placeId }: PlaceEventsProps) {
  const [events, setEvents] = useState<EventListItem[]>([]);
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

        // Fetch events for this place using the new unified system
        const { data: eventsData, error: eventsError } = await supabase
          .from("event_details")
          .select("*")
          .eq("place_id", placeId)
          .order("date", { ascending: false, nullsFirst: false });

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          return;
        }

        // Transform the data to match EventListItem format
        const formattedEvents: EventListItem[] = (eventsData || []).map(
          (event) => ({
            id: event.id,
            date: event.date,
            description: event.description,
            event_type_name: event.event_type_name,
            place_name: event.place_name,
            subjects: Array.isArray(event.subjects)
              ? event.subjects.map((s: { name: string }) => s.name).join(", ")
              : "Unknown",
          }),
        );

        setEvents(formattedEvents);
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

  const isIndividualEventType = (eventTypeName: string): boolean => {
    const individualEventTypes = [
      "birth",
      "death",
      "baptism",
      "burial",
      "graduation",
      "retirement",
      "immigration",
      "emigration",
      "naturalization",
      "census",
      "will",
      "probate",
    ];
    return individualEventTypes.includes(eventTypeName);
  };

  return (
    <Stack gap="sm">
      <Title order={4}>Events at {placeName}</Title>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>People</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th style={{ textAlign: "right" }}></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {events.map((event) => (
            <Table.Tr key={event.id}>
              <Table.Td>{formatDate(event.date)}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {isIndividualEventType(event.event_type_name) ? (
                    <UserIcon size={16} />
                  ) : (
                    <UsersIcon size={16} />
                  )}
                  {capitalize(event.event_type_name)}
                </Group>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{event.subjects}</Text>
              </Table.Td>
              <Table.Td>{event.description || "-"}</Table.Td>
              <Table.Td align="right">
                <Button
                  variant="default"
                  size="xs"
                  component={Link}
                  to={`/events/${event.id}`}
                >
                  <Group gap="xs">
                    <Pencil size={14} />
                    <span style={{ fontSize: "var(--mantine-font-size-sm)" }}>
                      View
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
