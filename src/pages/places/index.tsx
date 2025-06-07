import { PageHeader } from "@/components/PageHeader";
import { TablePlaces } from "@/components/TablePlaces/TablePlaces";
import { Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/places/")({
  component: PlacesPage,
});

function PlacesPage() {
  return (
    <Stack gap="xl">
      <PageHeader title="Places" />
      <TablePlaces />
    </Stack>
  );
}

export default PlacesPage;
