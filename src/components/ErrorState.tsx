import { Anchor, Center, Container, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { PageCard } from "./PageCard";

interface ErrorStateProps {
  readonly error: Error;
  readonly title?: string;
  readonly backTo?: string;
  readonly backLabel?: string;
}

export function ErrorState({
  error,
  title = "Something went wrong",
  backTo,
  backLabel = "← Go back",
}: ErrorStateProps) {
  return (
    <Container fluid py="md">
      <PageCard>
        <Center py="xl">
          <Stack align="center" gap="lg">
            <Title order={3} c="red">
              {title}
            </Title>
            <Text c="dimmed" ta="center">
              {error.message}
            </Text>
            {backTo && (
              <Anchor component={Link} to={backTo}>
                {backLabel}
              </Anchor>
            )}
          </Stack>
        </Center>
      </PageCard>
    </Container>
  );
}
