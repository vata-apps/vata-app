import {
  Avatar,
  Badge,
  Box,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Fragment } from "react";

interface PageHeaderProps {
  avatar?: string | React.ReactNode;
  gedcomId?: string;
  metadata?: { title: string; value: string | React.ReactNode }[];
  rightSection?: React.ReactNode;
  title: string;
}

export function PageHeader({
  avatar,
  gedcomId,
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
          <Grid grow>
            <Grid.Col span={10} style={{ flexGrow: 1 }}>
              <Group align="center">
                <Title order={2}>{title}</Title>
                {gedcomId && <Badge variant="default">{gedcomId}</Badge>}
              </Group>
            </Grid.Col>
            <Grid.Col span={2} style={{ flexGrow: 0 }}>
              <Group gap="xs" justify="flex-end">
                {rightSection}
              </Group>
            </Grid.Col>
          </Grid>

          <Box
            display="grid"
            style={{ columnGap: 16, gridTemplateColumns: "min-content 1fr" }}
          >
            {metadata?.map(({ title, value }) => (
              <Fragment key={title}>
                <Text c="dimmed">{title}</Text>
                {typeof value === "string" ? (
                  <Text>{value}</Text>
                ) : (
                  <Group>{value}</Group>
                )}
              </Fragment>
            ))}
          </Box>
        </Stack>
      </Group>
    </Stack>
  );
}
