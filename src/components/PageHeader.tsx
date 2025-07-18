import { Avatar, Box, Group, Stack, Text, Title } from "@mantine/core";
import { Fragment } from "react";

interface PageHeaderProps {
  avatar?: string | React.ReactNode;

  metadata?: { title: string; value: string | React.ReactNode }[];
  rightSection?: React.ReactNode;
  title: string;
}

export function PageHeader({
  avatar,
  metadata,
  rightSection,
  title,
}: PageHeaderProps) {
  return (
    <Stack w="100%">
      <Group align="flex-start" w="100%">
        {avatar && typeof avatar === "string" && (
          <Avatar name={avatar} size="xl" />
        )}
        {avatar && typeof avatar !== "string" && (
          <Avatar size="xl">{avatar}</Avatar>
        )}

        <Stack gap={0} style={{ flexGrow: 1 }}>
          <Group grow>
            <Title order={2}>{title}</Title>
            <Group justify="flex-end">{rightSection}</Group>
          </Group>

          <Box
            display="grid"
            style={{ columnGap: 16, gridTemplateColumns: "min-content 1fr" }}
          >
            {metadata?.map(({ title, value }) => (
              <Fragment key={title}>
                <Text c="dimmed">{title}</Text>
                <Text>{value}</Text>
              </Fragment>
            ))}
          </Box>
        </Stack>
      </Group>
    </Stack>
  );
}
