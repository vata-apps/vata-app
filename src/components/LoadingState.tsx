import { Center, Container, Loader, Stack, Text } from "@mantine/core";

interface LoadingStateProps {
  readonly message?: string;
  readonly size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function LoadingState({
  message = "Loading...",
  size = "lg",
}: LoadingStateProps) {
  return (
    <Container fluid py="md">
      <Center py="xl">
        <Stack align="center" gap="lg">
          <Loader size={size} />
          <Text c="dimmed">{message}</Text>
        </Stack>
      </Center>
    </Container>
  );
}
