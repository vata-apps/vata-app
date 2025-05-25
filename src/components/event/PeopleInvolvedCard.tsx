import { BlankState } from "@/components/BlankState";
import { FamilyMember } from "@/components/individual/FamilyMember";
import { PageCard } from "@/components/PageCard";
import type { Event } from "@/types";
import { isFamilyEvent, isIndividualEvent } from "@/types";
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
} from "@mantine/core";
import { Users, X } from "lucide-react";

interface PeopleInvolvedCardProps {
  readonly event: Event;
}

export function PeopleInvolvedCard({ event }: PeopleInvolvedCardProps) {
  const individuals = [];

  if (isIndividualEvent(event)) {
    individuals.push({
      id: event.individual_id,
      gender: event.individuals.gender,
      names: event.individuals.names,
      relationship: "Primary Person",
    });
  } else if (isFamilyEvent(event)) {
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
      <PageCard title="Witnesses" icon={Users} actionLabel="Add people">
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
    <PageCard title="Witnesses" icon={Users} actionLabel="Add people">
      <Stack gap="md">
        {individuals.map((individual) => (
          <Paper key={individual.id} p="md" withBorder radius="lg">
            <Group gap="md" justify="space-between">
              <Group gap="md">
                <Avatar size="lg" radius="xl" color="blue">
                  {individual.names[0]?.first_name?.[0] || "?"}
                </Avatar>
                <Box>
                  <FamilyMember
                    individual={
                      {
                        id: individual.id,
                        gender: individual.gender,
                        names: individual.names,
                      } as IndividualWithNames
                    }
                  />
                  <Badge variant="light" size="sm" mt="xs">
                    {individual.relationship}
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
    </PageCard>
  );
}
