import { Avatar, Badge, Card, Group, Stack, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

interface CardIndividualProps {
  individualId: string;
  lifeSpan: string;
  name: string;
  role?: string;
}

export function CardIndividual({
  individualId,
  lifeSpan,
  name,
  role,
}: CardIndividualProps) {
  return (
    <Card
      component={Link}
      to={`/individuals/${individualId}`}
      withBorder
      radius="lg"
      p="xs"
    >
      <Group wrap="nowrap" w="100%">
        <Avatar name={name} w="fit-content" />

        <Stack gap={0} w="100%">
          <Group w="100%">
            <Text fw={600}>{name}</Text>
            {role && (
              <Badge ml="auto" variant="light" color="gray">
                {role}
              </Badge>
            )}
          </Group>
          <Text size="sm">{lifeSpan}</Text>
        </Stack>
      </Group>
    </Card>
  );
}
