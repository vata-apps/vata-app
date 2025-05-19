import { Enums } from "@/database.types";
import { formatDate } from "@/utils/dates";
import { getEventTitle } from "@/utils/events";
import { Badge, Button, Group } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { FamilyMember } from "../individual/FamilyMember";
import { PageHeader } from "../PageHeader";

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

export function EventHeader({ event }: { event: Event }) {
  return (
    <PageHeader backTo="/events" title={getEventTitle(event)}>
      <Group gap="xs">
        <Badge variant="default">
          {event.eventType === "individual"
            ? "Individual Event"
            : "Family Event"}
        </Badge>

        <Group align="center" gap={0}>
          <CalendarIcon size={16} />
          {event.date ? (
            <Button variant="transparent" size="compact-sm">
              {formatDate(event.date)}
            </Button>
          ) : (
            <Button variant="transparent" size="compact-sm">
              Add Date
            </Button>
          )}
        </Group>

        <Group align="center" gap={0}>
          <MapPinIcon size={16} />
          {event.places ? (
            <Button variant="transparent" size="compact-sm">
              {event.places.name}
            </Button>
          ) : (
            <Button variant="transparent" size="compact-sm">
              Add Place
            </Button>
          )}
        </Group>

        {event.eventType === "individual" ? (
          <FamilyMember individual={event.individuals} />
        ) : (
          <Group align="center" gap={0}>
            <UsersIcon size={16} />
            <Button
              variant="transparent"
              size="compact-sm"
              component={Link}
              to={`/families/${event.family_id}`}
            >
              {getEventTitle(event).split(" - ")[1]}
            </Button>
          </Group>
        )}
      </Group>
    </PageHeader>
  );
}
