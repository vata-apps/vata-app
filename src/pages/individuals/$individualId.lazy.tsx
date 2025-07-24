import { fetchIndividualForPage } from "@/api/individuals/fetchIndividualForPage";
import {
  ErrorState,
  LoadingState,
  NotFoundState,
  PageHeader,
} from "@/components";
import { CardIndividual } from "@/components/CardIndividual";
import { useTree } from "@/lib/use-tree";
import displayName from "@/utils/displayName";
import {
  Button,
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

  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader
          avatar={displayName(individual)}
          metadata={[
            {
              title: "Birth",
              value: (
                <>
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
                </>
              ),
            },
            {
              title: "Death",
              value: (
                <>
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
                </>
              ),
            },
          ]}
          rightSection={<Code>{individual.gedcomId}</Code>}
          title={displayName(individual)}
        />

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
                <CardIndividual
                  individualId={individual.parents.father.id}
                  lifeSpan={individual.parents.father.lifeSpan}
                  name={displayName(individual.parents.father)}
                />
              )}

              {/* Mother */}
              {!individual.parents.mother && (
                <Button variant="default" radius="lg">
                  Add mother
                </Button>
              )}

              {individual.parents.mother && (
                <CardIndividual
                  individualId={individual.parents.mother.id}
                  lifeSpan={individual.parents.mother.lifeSpan}
                  name={displayName(individual.parents.mother)}
                />
              )}

              {/* Siblings */}
              {individual.siblings.map((sibling) => (
                <Group key={sibling.id} ml="lg" grow>
                  <CardIndividual
                    individualId={sibling.id}
                    lifeSpan={sibling.lifeSpan}
                    name={displayName(sibling)}
                  />
                </Group>
              ))}

              <Button ml="lg" variant="default" radius="lg">
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
                    {spouse && (
                      <CardIndividual
                        individualId={spouse.id}
                        lifeSpan={spouse.lifeSpan}
                        name={displayName(spouse)}
                      />
                    )}

                    {/* Children */}
                    {family.children.map((child) => (
                      <Group key={child.id} ml="lg" grow>
                        <CardIndividual
                          individualId={child.id}
                          lifeSpan={child.lifeSpan}
                          name={displayName(child)}
                        />
                      </Group>
                    ))}

                    {/* Add child */}
                    <Button ml="lg" variant="default" radius="lg">
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
