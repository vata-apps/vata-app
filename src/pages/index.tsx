import { Stack, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <Stack>
      <Title>Dashboard</Title>
      <p>Work in Progress</p>
    </Stack>
  );
}

export default HomePage;
