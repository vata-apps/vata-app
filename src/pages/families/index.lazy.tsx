import { PageHeader } from "@/components/PageHeader";
import { TableFamilies } from "@/components/tables/TableFamilies";
import { Container, Stack } from "@mantine/core";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/families/")({
  component: FamiliesPage,
});

function FamiliesPage() {
  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader title="Families" />
        <TableFamilies />
      </Stack>
    </Container>
  );
}

export default FamiliesPage;
