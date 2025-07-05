import { PageHeader } from "@/components/PageHeader";
import { TableEvents } from "@/components/tables/TableEvents";
import { Stack } from "@mantine/core";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/events/")({
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
