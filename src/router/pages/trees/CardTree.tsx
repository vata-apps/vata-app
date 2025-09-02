import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";

import { Card } from "@mantine/core";
import { IconDots, IconPencil, IconStar, IconTrash } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

interface CardTreeProps {
  readonly tree: {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly isDefault: boolean;
  };
}

export function CardTree({ tree }: CardTreeProps) {
  const { id, name, description, isDefault } = tree;

  return (
    <Card mih={150} radius="md" shadow="sm" withBorder>
      <Stack justify="space-between" h="100%">
        <Stack gap={4}>
          <Text fz="lg" fw={500}>
            {name}
          </Text>
          <Text fz="sm" c="dimmed">
            {description}
          </Text>
        </Stack>

        <Group align="center" justify="space-between">
          <Link
            params={{ treeId: id }}
            style={{ width: "min-content" }}
            to="/$treeId"
          >
            <Button radius="xl" variant="default">
              Open tree
            </Button>
          </Link>

          <Group align="center">
            {isDefault && (
              <Badge size="md" variant="dot">
                Default
              </Badge>
            )}

            <Menu>
              <Menu.Target>
                <ActionIcon radius="xl" size="input-sm" variant="default">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  disabled={isDefault}
                  leftSection={<IconStar size={14} />}
                >
                  Set as default tree
                </Menu.Item>
                <Menu.Item leftSection={<IconPencil size={14} />}>
                  Edit
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
