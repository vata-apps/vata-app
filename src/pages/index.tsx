import { PageHeader } from "@/components/PageHeader";
import { Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <Stack>
      <PageHeader title="Dashboard" />
      <p>Work in Progress</p>
    </Stack>
  );
}

export default HomePage;
