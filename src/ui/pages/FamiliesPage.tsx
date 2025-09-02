import { PageHeader } from "@/components/PageHeader";
import { Stack } from "@mantine/core";
import { Link, useParams } from "@tanstack/react-router";

export function FamiliesPage() {
  const { treeId } = useParams({ from: "/$treeId/families" });

  return (
    <>
      <PageHeader title="Families" />

      <Stack>
        <p>Tree ID: {treeId}</p>
        <Link
          to="/$treeId/families/$familyId"
          params={{ treeId, familyId: "1" }}
        >
          Family 1
        </Link>
      </Stack>
    </>
  );
}
