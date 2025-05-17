import { ActionIcon, Avatar, Group, Stack, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function PageHeader({
  avatar,
  backTo,
  children,
  title,
}: {
  avatar?: string;
  backTo?: string;
  children?: React.ReactNode;
  title: string;
}) {
  return (
    <Stack gap="xs">
      <Group align="center" gap="md">
        {backTo && (
          <ActionIcon
            component={Link}
            size="compact-xl"
            to={backTo}
            variant="transparent"
          >
            <ChevronLeft size={32} />
          </ActionIcon>
        )}
        {avatar && <Avatar size="md">{avatar}</Avatar>}
        <Title>{title}</Title>
      </Group>

      {children}
    </Stack>
  );
}
