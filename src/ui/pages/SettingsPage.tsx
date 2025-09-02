import { PageHeader } from "@/components/PageHeader";
import { Stack } from "@mantine/core";
import { useParams } from "@tanstack/react-router";

export function SettingsPage() {
  const { treeId } = useParams({ from: "/$treeId/settings" });

  return (
    <>
      <PageHeader title="Settings" />

      <Stack>
        <p>Tree ID: {treeId}</p>
      </Stack>
    </>
  );
}
