import { EventsTable } from "@/components/events";
import { PageHeader } from "@/components/PageHeader";
import { Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/events/")({
  component: EventsPage,
});

function EventsPage() {
  return (
    <Stack>
      <PageHeader title="Events" />

      <EventsTable
        showToolbar={true}
        showAddButton={true}
        defaultSorting={{ id: "date", desc: false }}
        searchPlaceholder="Search events"
      />
    </Stack>
  );
}
