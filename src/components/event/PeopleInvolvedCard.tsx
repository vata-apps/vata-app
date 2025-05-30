import { IndividualsTable } from "@/components/individuals/IndividualsTable";
import { PageCard } from "@/components/PageCard";
import type { Event } from "@/types/event";

import { Stack } from "@mantine/core";
import { Users } from "lucide-react";

interface PeopleInvolvedCardProps {
  readonly event: Event;
}

export function PeopleInvolvedCard({ event }: PeopleInvolvedCardProps) {
  return (
    <Stack gap="xl">
      {/* Subjects Section */}
      <PageCard title="Primary People" icon={Users}>
        <IndividualsTable
          filters={{ event: { eventId: event.id, role: "subject" } }}
          showToolbar={false}
          showPagination={false}
          columnsConfig={{
            gender: { visible: false },
            role: { width: 160 },
          }}
          blankState={{
            icon: Users,
            title: "No primary people yet",
          }}
        />
      </PageCard>

      {/* Participants Section */}
      <PageCard title="Participants" icon={Users} actionLabel="Add participant">
        <IndividualsTable
          filters={{ event: { eventId: event.id, role: "participant" } }}
          showToolbar={false}
          showPagination={false}
          onDeleteIndividual={() => {}}
          columnsConfig={{
            gender: { visible: false },
            role: { width: 160 },
          }}
          blankState={{
            icon: Users,
            title: "No participants yet",
          }}
        />
      </PageCard>
    </Stack>
  );
}
