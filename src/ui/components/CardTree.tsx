import type { TreeWithStatus } from "$/types/tree-status";
import { getStatusColor } from "$/utils/tree-status";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconDots, IconPencil, IconTrash } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

interface CardTreeProps {
  tree: TreeWithStatus;
}

export function CardTree({ tree }: CardTreeProps) {
  const { id, label, description, status, created_at } = tree;

  const disabled = status.type !== "healthy";

  return (
    <Card mih={150} radius="md" shadow="sm" withBorder>
      <Stack justify="space-between" h="100%">
        <Stack gap={4}>
          <Group justify="space-between">
            <Text fz="lg" fw={500}>
              {label}
            </Text>
            <Tooltip label={status.details || status.message}>
              <Badge
                color={getStatusColor(status.type)}
                size="sm"
                variant="dot"
              >
                {status.message}
              </Badge>
            </Tooltip>
          </Group>
          <Text fz="sm" c="dimmed">
            {description || "-"}
          </Text>
          {created_at && (
            <Text fz="sm" c="dimmed">
              {new Date(created_at).toLocaleString()}
            </Text>
          )}
        </Stack>

        <Group align="center" justify="space-between">
          <Link
            disabled={disabled}
            params={{ treeId: id }}
            style={{ width: "min-content" }}
            to="/tree/$treeId"
          >
            <Button disabled={disabled} radius="xl" variant="default">
              {status.type === "healthy"
                ? "Open"
                : status.type === "orphaned"
                  ? "Remove"
                  : "Import"}
            </Button>
          </Link>

          <Menu>
            <Menu.Target>
              <ActionIcon radius="xl" size="input-sm" variant="default">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconPencil size={14} />}
                onClick={() => {
                  // TODO: Implement edit functionality
                  console.log("Edit tree:", id);
                }}
              >
                Edit
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => {
                  // TODO: Implement delete functionality
                  console.log("Delete tree:", id);
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Stack>
    </Card>
  );
}
