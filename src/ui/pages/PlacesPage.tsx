import { PageHeader } from "@/components/PageHeader";
import { Stack } from "@mantine/core";
import { Link, useParams } from "@tanstack/react-router";

export function PlacesPage() {
  const { treeId } = useParams({ from: "/$treeId/places" });

  return (
    <>
      <PageHeader title="Places" />

      <Stack>
        <p>Tree ID: {treeId}</p>
        <Link to="/$treeId/places/$placeId" params={{ treeId, placeId: "1" }}>
          Place 1
        </Link>
      </Stack>
    </>
  );
}
