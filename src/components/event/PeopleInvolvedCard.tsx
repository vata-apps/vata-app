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
  Group,
  Paper,
  Stack,
} from "@mantine/core";
import { Users, X } from "lucide-react";

interface PeopleInvolvedCardProps {
  readonly event: Event;
}

export function PeopleInvolvedCard({ event }: PeopleInvolvedCardProps) {
  const subjects = getEventSubjects(event);
  const participants = getEventParticipants(event);

  return (
    <Stack gap="xl">
      {/* Subjects Section */}
      <PageCard title="Primary People" icon={Users}>
        {subjects.length === 0 ? (
          <BlankState icon={Users} title="No primary people yet" />
        ) : (
          <Stack gap="md">
            {subjects.map((participant) => (
              <Paper key={participant.id} p="md" withBorder radius="lg">
                <Group gap="md">
                  <Avatar size="lg" radius="xl" color="blue">
                    {participant.individual.names[0]?.first_name?.[0] || "?"}
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
              </Paper>
            ))}
          </Stack>
        )}
      </PageCard>

      {/* Participants Section */}
      <PageCard title="Participants" icon={Users} actionLabel="Add participant">
        {participants.length === 0 ? (
          <BlankState icon={Users} title="No participants yet" />
        ) : (
          <Stack gap="md">
            {participants.map((participant) => (
              <Paper key={participant.id} p="md" withBorder radius="lg">
                <Group gap="md" justify="space-between">
                  <Group gap="md">
                    <Avatar size="lg" radius="xl" color="gray">
                      {participant.individual.names[0]?.first_name?.[0] || "?"}
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
        )}
      </PageCard>
    </Stack>
  );
}
