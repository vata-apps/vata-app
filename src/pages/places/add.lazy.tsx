import { PageHeader, PlaceForm } from "@/components";
import { Container, Stack } from "@mantine/core";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/places/add")({
  component: AddPlacePage,
});

function AddPlacePage() {
  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader title="Add Place" />
        <PlaceForm mode="create" />
      </Stack>
    </Container>
  );
}
