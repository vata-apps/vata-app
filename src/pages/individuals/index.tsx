import { PageHeader } from "@/components/PageHeader";
import { TableIndividuals } from "@/components/TableIndividuals";
import { Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/individuals/")({
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
