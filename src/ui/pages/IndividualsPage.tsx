import { PageHeader } from "@/components/PageHeader";
import { Stack } from "@mantine/core";
import { Link, useParams } from "@tanstack/react-router";

export function IndividualsPage() {
  const { treeId } = useParams({ from: "/$treeId/individuals" });

  return (
    <>
      <PageHeader title="Individuals" />

      <Stack>
        <p>Tree ID: {treeId}</p>
        <Link
          to="/$treeId/individuals/$individualId"
          params={{ treeId, individualId: "1" }}
        >
          Individual 1
        </Link>
      </Stack>
    </>
  );
}
