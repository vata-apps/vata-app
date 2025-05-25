import { BlankState } from "@/components/BlankState";
import { FamilyMember } from "@/components/individual/FamilyMember";
import { PageCard } from "@/components/PageCard";
import type { Event } from "@/types/event";
import { getEventParticipants, getEventSubjects } from "@/types/guards";
import type { IndividualWithNames } from "@/types/individual";

import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import { Users, X } from "lucide-react";

interface PeopleInvolvedCardProps {
  readonly event: Event;
}

export function PeopleInvolvedCard({ event }: PeopleInvolvedCardProps) {
  const subjects = getEventSubjects(event);
  const participants = getEventParticipants(event);
  const allParticipants = [...subjects, ...participants];

  if (allParticipants.length === 0) {
    return (
      <PageCard title="People Involved" icon={Users} actionLabel="Add people">
        <BlankState
          icon={Users}
          title="No People Connected"
          description="This event doesn't have any people associated with it yet."
        >
          <Button size="sm" variant="subtle">
            Add people
          </Button>
        </BlankState>
      </PageCard>
    );
  }

  return (
    <PageCard title="People Involved" icon={Users} actionLabel="Add people">
      <Stack gap="lg">
        {/* Event Subjects */}
        {subjects.length > 0 && (
          <Stack gap="sm">
            <Title order={4} size="sm" c="dimmed">
              Primary People
            </Title>
            <Stack gap="md">
              {subjects.map((participant) => (
                <Paper key={participant.id} p="md" withBorder radius="lg">
                  <Group gap="md" justify="space-between">
                    <Group gap="md">
                      <Avatar size="lg" radius="xl" color="blue">
                        {participant.individual.names[0]?.first_name?.[0] ||
                          "?"}
                      </Avatar>
                      <Box>
                        <FamilyMember
                          individual={
                            {
                              id: participant.individual.id,
                              gender: participant.individual.gender,
                              names: participant.individual.names,
                            } as IndividualWithNames
                          }
                        />
                        <Badge variant="light" size="sm" mt="xs" color="blue">
                          {participant.role_name}
                        </Badge>
                      </Box>
                    </Group>
                    <ActionIcon variant="subtle" color="gray" size="lg">
                      <X size={20} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Other Participants */}
        {participants.length > 0 && (
          <Stack gap="sm">
            <Title order={4} size="sm" c="dimmed">
              Other Participants
            </Title>
            <Stack gap="md">
              {participants.map((participant) => (
                <Paper key={participant.id} p="md" withBorder radius="lg">
                  <Group gap="md" justify="space-between">
                    <Group gap="md">
                      <Avatar size="lg" radius="xl" color="gray">
                        {participant.individual.names[0]?.first_name?.[0] ||
                          "?"}
                      </Avatar>
                      <Box>
                        <FamilyMember
                          individual={
                            {
                              id: participant.individual.id,
                              gender: participant.individual.gender,
                              names: participant.individual.names,
                            } as IndividualWithNames
                          }
                        />
                        <Badge variant="light" size="sm" mt="xs" color="gray">
                          {participant.role_name}
                        </Badge>
                      </Box>
                    </Group>
                    <ActionIcon variant="subtle" color="gray" size="lg">
                      <X size={20} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </PageCard>
  );
}
