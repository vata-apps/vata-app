import { Event, isIndividualEvent } from "@/types";
import { formatDate } from "@/utils/dates";
import { getEventTitle } from "@/utils/events";
import { Badge, Button, Group } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { FamilyMember } from "../individual/FamilyMember";
import { PageHeader } from "../PageHeader";

export function EventHeader({ event }: { event: Event }) {
  return (
    <PageHeader backTo="/events" title={getEventTitle(event)}>
      <Group gap="xs">
        <Badge variant="default">
          {isIndividualEvent(event) ? "Individual Event" : "Family Event"}
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

        {isIndividualEvent(event) ? (
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
