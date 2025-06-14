import { PageCard } from "@/components/PageCard";
import type { Event } from "@/types/event";

import { TableIndividuals } from "@/components/tables/TableIndividuals";
import { Stack } from "@mantine/core";
import { Users } from "lucide-react";

interface PeopleInvolvedCardProps {
  readonly event: Event;
}

export function PeopleInvolvedCard({ event }: PeopleInvolvedCardProps) {
  const subjectIds = event.participants
    .filter(({ is_subject }) => is_subject)
    .map(({ individual }) => individual.id);

  const participantIds = event.participants
    .filter(({ is_subject }) => !is_subject)
    .map(({ individual }) => individual.id);

  return (
    <Stack gap="xl">
      {/* Subjects Section */}
      <PageCard title="Primary People" icon={Users}>
        <TableIndividuals hideToolbar individualIds={subjectIds} />
      </PageCard>

      {/* Participants Section */}
      <PageCard title="Participants" icon={Users}>
        <TableIndividuals hideToolbar individualIds={participantIds} />
      </PageCard>
    </Stack>
  );
}
