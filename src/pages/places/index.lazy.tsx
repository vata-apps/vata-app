import { PageHeader } from "@/components/PageHeader";
import { TablePlaces } from "@/components/tables/TablePlaces";
import { Container, Stack } from "@mantine/core";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/places/")({
  component: PlacesPage,
});

function PlacesPage() {
  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader title="Places" />
        <TablePlaces />
      </Stack>
    </Container>
  );
}

export default PlacesPage;
