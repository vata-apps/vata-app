import { PageHeader } from "@/components/PageHeader";
import { TableFamilies } from "@/components/tables/TableFamilies";
import { Stack } from "@mantine/core";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/families/")({
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
