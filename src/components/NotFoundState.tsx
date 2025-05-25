import { Anchor, Center, Container, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";

interface NotFoundStateProps {
  readonly title?: string;
  readonly description?: string;
  readonly backTo?: string;
  readonly backLabel?: string;
}

export function NotFoundState({
  title = "Not Found",
  description = "The item you're looking for doesn't exist or may have been removed.",
  backTo,
  backLabel = "← Go back",
}: NotFoundStateProps) {
  return (
    <Container fluid py="md">
      <Center py="xl">
        <Stack align="center" gap="lg">
          <Title order={3} c="dimmed">
            {title}
          </Title>
          <Text c="dimmed" ta="center">
            {description}
          </Text>
          {backTo && (
            <Anchor component={Link} to={backTo}>
              {backLabel}
            </Anchor>
          )}
        </Stack>
      </Center>
    </Container>
  );
}
