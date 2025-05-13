import { Button, Group, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

export function PageHeader({
  addTo,
  title,
}: {
  addTo?: string;
  title: string;
}) {
  return (
    <Group justify="space-between" align="center">
      <Title>{title}</Title>

      {addTo && (
        <Button
          component={Link}
          leftSection={<PlusIcon width={24} />}
          size="md"
          to={addTo}
          variant="primary"
        >
          Add
        </Button>
      )}
    </Group>
  );
}
