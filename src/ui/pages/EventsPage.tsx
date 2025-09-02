import { PageHeader } from "@/components/PageHeader";
import { Stack } from "@mantine/core";
import { Link, useParams } from "@tanstack/react-router";

export function EventsPage() {
  const { treeId } = useParams({ from: "/$treeId/events" });

  return (
    <>
      <PageHeader title="Events" />

      <Stack>
        <p>Tree ID: {treeId}</p>
        <Link to="/$treeId/events/$eventId" params={{ treeId, eventId: "1" }}>
          Event 1
        </Link>
      </Stack>
    </>
  );
}
