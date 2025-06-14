import { PageHeader } from "@/components/PageHeader";
import { TableEvents } from "@/components/TableEvents";
import { Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/events/")({
  component: EventsPage,
});

function EventsPage() {
  return (
    <Stack gap="xl">
      <PageHeader title="Events" />

      <TableEvents />
    </Stack>
  );
}
