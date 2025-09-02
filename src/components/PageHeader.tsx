import { AppPath } from "@/router";
import { ActionIcon, Button, Group, Menu, Title } from "@mantine/core";
import { Icon, IconChevronDown, IconChevronLeft } from "@tabler/icons-react";
import { Link, useParams } from "@tanstack/react-router";
import { useLayoutEffect } from "react";

interface PageHeaderProps {
  readonly menuItems?: {
    readonly label: string;
    readonly icon: Icon;
    readonly onClick: () => void;
    readonly color?: string;
  }[];
  readonly onBackTo?: AppPath;
  readonly onClickEdit?: () => void;
  readonly title: string;
}

export function PageHeader({
  menuItems,
  onBackTo,
  onClickEdit,
  title,
}: PageHeaderProps) {
  const { treeId } = useParams({ from: "/$treeId" });

  useLayoutEffect(() => {
    document.title = `${title} - vata-app`;
  }, [title]);

  return (
    <Group h={60} align="center" gap="xs">
      {onBackTo && (
        <Link params={{ treeId }} to={onBackTo}>
          <ActionIcon color="gray" size="lg" variant="transparent">
            <IconChevronLeft />
          </ActionIcon>
        </Link>
      )}

      <Title order={1} size="h3">
        {title}
      </Title>

      {onClickEdit && menuItems && (
        <Button.Group ml="auto">
          <Button
            size="sm"
            style={{
              borderTopLeftRadius: "var(--mantine-radius-xl)",
              borderBottomLeftRadius: "var(--mantine-radius-xl)",
            }}
          >
            Edit
          </Button>
          <Menu>
            <Menu.Target>
              <Button
                size="sm"
                style={{
                  borderTopRightRadius: "var(--mantine-radius-xl)",
                  borderBottomRightRadius: "var(--mantine-radius-xl)",
                }}
              >
                <IconChevronDown size={20} />
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {menuItems.map((item) => (
                <Menu.Item
                  key={item.label}
                  leftSection={<item.icon size={16} />}
                  color={item.color}
                >
                  {item.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Button.Group>
      )}
    </Group>
  );
}
