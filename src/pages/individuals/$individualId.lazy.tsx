import { fetchIndividualForPage } from "@/api/individuals/fetchIndividualForPage";
import { ErrorState, LoadingState, NotFoundState } from "@/components";
import { useTree } from "@/lib/use-tree";
import displayName from "@/utils/displayName";
import {
  Avatar,
  Button,
  Card,
  Code,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Timeline,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";

export const Route = createLazyFileRoute("/individuals/$individualId")({
  component: IndividualDetailPage,
});

/**
 * Displays the individual page with details, family relationships, and names
 */
function IndividualDetailPage() {
  const { individualId } = Route.useParams();
  const { currentTreeId } = useTree();

  const {
    data: individual,
    status,
    error,
  } = useQuery({
    queryKey: ["individual", individualId],
    queryFn: () => fetchIndividualForPage(currentTreeId ?? "", individualId),
    placeholderData: keepPreviousData,
    enabled: Boolean(currentTreeId),
  });

  if (status === "pending") {
    return <LoadingState message="Loading individual details..." />;
  }

  if (status === "error") {
    return (
      <ErrorState
        error={error}
        title="Something went wrong"
        backTo="/individuals"
        backLabel="← Back to individuals"
      />
    );
  }

  if (!individual) {
    return (
      <NotFoundState
        title="Individual Not Found"
        description="This individual doesn't exist or may have been removed."
        backTo="/individuals"
        backLabel="← Back to individuals"
      />
    );
  }

  console.log(individual);

  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <Stack w="100%">
          <Group w="100%">
            <Avatar name={displayName(individual)} size="xl" />
            <Stack gap={0} style={{ flexGrow: 1 }}>
              <Group grow>
                <Title order={2}>{displayName(individual)}</Title>
                <Group>
                  <Code ml="auto">{individual.gedcomId}</Code>
                </Group>
              </Group>

              <Stack gap={0}>
                <Group>
                  <Text w={48}>Birth</Text>
                  {individual.birth ? (
                    <Group gap={0}>
                      <Button
                        color="gray"
                        component={Link}
                        to={`/events/date=${individual.birth?.date}`}
                        size="compact-sm"
                        variant="transparent"
                      >
                        {individual.birth?.date}
                      </Button>
                      <Text>•</Text>
                      <Button
                        color="gray"
                        component={Link}
                        to={`/places/${individual.birth?.place?.id}`}
                        size="compact-sm"
                        variant="transparent"
                      >
                        {individual.birth?.place?.name}
                      </Button>
                    </Group>
                  ) : (
                    <Button
                      color="gray"
                      size="compact-sm"
                      variant="transparent"
                    >
                      Add birth information
                    </Button>
                  )}
                </Group>
                <Group>
                  <Text w={48}>Death</Text>
                  {individual.death ? (
                    <Group gap={0}>
                      <Button
                        color="gray"
                        component={Link}
                        to={`/events/date=${individual.death?.date}`}
                        size="compact-sm"
                        variant="transparent"
                      >
                        {individual.death?.date}
                      </Button>
                      <Text>•</Text>
                      <Button
                        color="gray"
                        component={Link}
                        to={`/places/${individual.death?.place?.id}`}
                        size="compact-sm"
                        variant="transparent"
                      >
                        {individual.death?.place?.name}
                      </Button>
                    </Group>
                  ) : (
                    <Button
                      color="gray"
                      size="compact-sm"
                      variant="transparent"
                    >
                      Add death information
                    </Button>
                  )}
                </Group>
              </Stack>
            </Stack>
          </Group>
        </Stack>

        <Grid gutter={64}>
          {/* Events */}
          <Grid.Col span={4}>
            <Stack gap="xs">
              <Title order={4}>Events</Title>
              <Timeline bulletSize={40} lineWidth={3}>
                {individual.events.map((event, index) => (
                  <Timeline.Item
                    key={event.id}
                    bullet={<event.Icon />}
                    title={
                      <UnstyledButton
                        component={Link}
                        to={`/events/${event.id}`}
                      >
                        {event.description}
                      </UnstyledButton>
                    }
                    lineVariant={
                      index === individual.events.length - 1
                        ? "dashed"
                        : "solid"
                    }
                  >
                    <Text c="dimmed" size="sm">
                      {event.place?.name}
                    </Text>
                    <Text size="xs" mt={4}>
                      {event.date}
                    </Text>
                  </Timeline.Item>
                ))}

                <Timeline.Item bullet={<IconPlus />}>
                  <Button variant="default">Add new event</Button>
                </Timeline.Item>
              </Timeline>
            </Stack>
          </Grid.Col>

          {/* Parents and siblings */}
          <Grid.Col span={4}>
            <Stack gap="xs">
              <Title order={4}>Parents and Siblings</Title>
              {/* Father */}
              {!individual.parents.father && (
                <Button variant="default" radius="lg">
                  Add father
                </Button>
              )}

              {individual.parents.father && (
                <Card
                  component={Link}
                  to={`/individuals/${individual.parents.father.id}`}
                  withBorder
                  radius="lg"
                  p="xs"
                >
                  <Group>
                    <Avatar name={displayName(individual.parents.father)} />

                    <Stack gap={0}>
                      <Text fw={600}>
                        {displayName(individual.parents.father)}
                      </Text>
                      <Text size="sm">
                        {individual.parents.father.lifeSpan}
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              )}

              {/* Mother */}
              {!individual.parents.mother && (
                <Button variant="default" radius="lg">
                  Add mother
                </Button>
              )}

              {individual.parents.mother && (
                <Card
                  component={Link}
                  to={`/individuals/${individual.parents.mother.id}`}
                  withBorder
                  radius="lg"
                  p="xs"
                >
                  <Group>
                    <Avatar name={displayName(individual.parents.mother)} />

                    <Stack gap={0}>
                      <Text fw={600}>
                        {displayName(individual.parents.mother)}
                      </Text>
                      <Text size="sm">
                        {individual.parents.mother.lifeSpan}
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              )}

              {/* Siblings */}
              {individual.siblings.map((sibling) => (
                <Card
                  key={sibling.id}
                  component={Link}
                  to={`/individuals/${sibling.id}`}
                  withBorder
                  radius="lg"
                  p="xs"
                  ml="xl"
                >
                  <Group>
                    <Avatar name={displayName(sibling)} />

                    <Stack gap={0}>
                      <Text fw={600}>{displayName(sibling)}</Text>
                      <Text size="sm">{sibling.lifeSpan}</Text>
                    </Stack>
                  </Group>
                </Card>
              ))}

              <Button ml="xl" variant="default" radius="lg">
                Add sibling
              </Button>
            </Stack>
          </Grid.Col>

          {/* Spouses and children */}
          <Grid.Col span={4}>
            <Stack gap="xs">
              <Title order={4}>Spouses and Children</Title>

              {/* Spouses */}
              {individual.families.map((family) => {
                const spouse =
                  individual.gender === "male" ? family.wife : family.husband;

                return (
                  <Fragment key={family.id}>
                    <Card
                      component={Link}
                      to={`/individuals/${spouse?.id}`}
                      withBorder
                      radius="lg"
                      p="xs"
                    >
                      <Group>
                        <Avatar name={displayName(spouse)} />

                        <Stack gap={0}>
                          <Text fw={600}>{displayName(spouse)}</Text>
                          <Text size="sm">{spouse?.lifeSpan}</Text>
                        </Stack>
                      </Group>
                    </Card>

                    {/* Children */}
                    {family.children.map((child) => (
                      <Card
                        key={child.id}
                        component={Link}
                        to={`/individuals/${child.id}`}
                        ml="xl"
                        withBorder
                        radius="lg"
                        p="xs"
                      >
                        <Group>
                          <Avatar name={displayName(child)} />

                          <Stack gap={0}>
                            <Text fw={600}>{displayName(child)}</Text>
                            <Text size="sm">{child.lifeSpan}</Text>
                          </Stack>
                        </Group>
                      </Card>
                    ))}

                    {/* Add child */}
                    <Button ml="xl" variant="default" radius="lg">
                      Add child
                    </Button>
                  </Fragment>
                );
              })}

              {/* Add family */}
              <Button variant="default" radius="lg">
                Add family
              </Button>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
