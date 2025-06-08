import { PageHeader } from "@/components/PageHeader";
import { TableFamilies } from "@/components/TableFamilies";
import { Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/families/")({
  component: FamiliesPage,
});

function FamiliesPage() {
  return (
    <Stack gap="xl">
      <PageHeader title="Families" />

      <TableFamilies />
    </Stack>
  );
}

export default FamiliesPage;
