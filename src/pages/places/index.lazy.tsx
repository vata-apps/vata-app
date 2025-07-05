import { PageHeader } from "@/components/PageHeader";
import { TablePlaces } from "@/components/tables/TablePlaces";
import { Stack } from "@mantine/core";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/places/")({
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
