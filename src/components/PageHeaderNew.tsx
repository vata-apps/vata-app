import { Avatar, Badge, Group, Stack, Title } from "@mantine/core";

interface PageHeaderProps {
  avatar?: string | React.ReactNode;
  children?: React.ReactNode;
  gedcomId?: string;
  rightSection?: React.ReactNode;
  title: string;
}

export function PageHeaderNew({
  avatar,
  children,
  gedcomId,
  rightSection,
  title,
}: PageHeaderProps) {
  const avatarElement = (() => {
    if (!avatar) return null;
    if (typeof avatar === "string") return <Avatar name={avatar} size="lg" />;
    return <Avatar size="lg">{avatar}</Avatar>;
  })();

  return (
    <Stack w="100%">
      <Group align="center" w="100%">
        {avatarElement}

        <Stack gap="xs" justify="center" style={{ flexGrow: 1 }}>
          <Title order={2}>{title}</Title>

          <Group>
            {gedcomId && <Badge variant="default">{gedcomId}</Badge>}

            {children}
          </Group>
        </Stack>

        {rightSection && (
          <Group gap="xs" justify="flex-end">
            {rightSection}
          </Group>
        )}
      </Group>
    </Stack>
  );
}
