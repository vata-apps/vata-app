import { PageHeader } from "@/components/PageHeader";
import { TableIndividuals } from "@/components/tables/TableIndividuals";
import { Stack } from "@mantine/core";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/individuals/")({
  component: IndividualsPage,
});

function IndividualsPage() {
  return (
    <Stack gap="xl">
      <PageHeader title="Individuals" />
      <TableIndividuals />
    </Stack>
  );
}

export default IndividualsPage;
