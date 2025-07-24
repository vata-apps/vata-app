import { Anchor, Center, Container, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";

interface ErrorStateProps {
  readonly error: Error;
  readonly backTo: string;
}

export function ErrorState({ error, backTo }: ErrorStateProps) {
  const title = (() => {
    switch (error.message) {
      case "not_found":
        return "Not Found";
      default:
        return "Something went wrong";
    }
  })();

  const description = (() => {
    switch (error.message) {
      case "not_found":
        return "The item you're looking for doesn't exist or may have been removed.";
      default:
        return "An error occurred while loading the item.";
    }
  })();

  return (
    <Container fluid py="md">
      <Center py="xl">
        <Stack align="center" gap="lg">
          <Title order={3} c="red">
            {title}
          </Title>
          <Text c="dimmed" ta="center">
            {description}
          </Text>
          <Anchor component={Link} to={backTo}>
            ← Go back
          </Anchor>
        </Stack>
      </Center>
    </Container>
  );
}
