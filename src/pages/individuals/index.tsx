import { PageHeader } from "@/components/PageHeader";
import { IndividualsTable } from "@/components/individuals/IndividualsTable";
import { Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/individuals/")({
  component: IndividualsPage,
});

function IndividualsPage() {
  return (
    <Stack h="100%">
      <PageHeader title="Individuals" />
      <IndividualsTable hideColumns={["role"]} />
    </Stack>
  );
}

export default IndividualsPage;
