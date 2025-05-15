import { Group, Title } from "@mantine/core";

export function PageHeader({ title }: { title: string }) {
  return (
    <Group justify="space-between" align="center">
      <Title>{title}</Title>
    </Group>
  );
}
