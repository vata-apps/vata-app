import { PageCard } from "@/components/PageCard";
import type { Event } from "@/types/event";
import { isIndividualEvent } from "@/types/guards";
import { getEventTitle } from "@/utils/events";
import { Button, Group, Stack, ThemeIcon, Title } from "@mantine/core";
import { Calendar, Edit, MapPin, Trash2, User, Users } from "lucide-react";

interface EventHeaderCardProps {
  readonly event: Event;
}

export function EventHeader({ event }: EventHeaderCardProps) {
  const isIndividual = isIndividualEvent(event);

  return (
    <PageCard>
      <Group justify="space-between" align="flex-start">
        <Group>
          <ThemeIcon
            size={60}
            radius="xl"
            variant="gradient"
            gradient={{ from: "blue.6", to: "blue.4", deg: 135 }}
          >
            {isIndividual ? <User size={24} /> : <Users size={24} />}
          </ThemeIcon>
          <Stack gap="xs">
            <Title order={2} fw={600}>
              {getEventTitle(event)}
            </Title>
            <Group gap="xl">
              <Group gap={0}>
                <Calendar size={16} />
                <Button variant="transparent" size="compact-md">
                  {event.date || "Add date"}
                </Button>
              </Group>
              <Group gap={0}>
                <MapPin size={16} />
                <Button variant="transparent" size="compact-md">
                  {event.place?.name || "Add location"}
                </Button>
              </Group>
            </Group>
          </Stack>
        </Group>

        <Group gap="sm">
          <Button
            variant="subtle"
            leftSection={<Edit size={16} />}
            onClick={() => {
              // TODO: Open edit form
              console.log("Edit event:", event.id);
            }}
          >
            Edit
          </Button>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => {
              // TODO: Delete event
              console.log("Delete event:", event.id);
            }}
          >
            <Trash2 size={16} />
          </Button>
        </Group>
      </Group>
    </PageCard>
  );
}
