import { fetchFamilyForPage } from "@/api/families/fetchFamilyForPage";
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
import { IconPlus, IconUsersGroup } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/families/$familyId")({
  component: FamilyPage,
});

/**
 * Displays the family page with husband, wife, and children information
 */
function FamilyPage() {
  const { familyId } = Route.useParams();
  const { currentTreeId } = useTree();

  const {
    data: family,
    status,
    error,
  } = useQuery({
    queryKey: ["family", familyId],
    queryFn: () => fetchFamilyForPage(currentTreeId ?? "", familyId),
    placeholderData: keepPreviousData,
    enabled: Boolean(currentTreeId),
  });

  if (status === "pending") {
    return <LoadingState message="Loading family details..." />;
  }

  if (status === "error") {
    return (
      <ErrorState
        error={error}
        title="Something went wrong"
        backTo="/families"
        backLabel="← Back to families"
      />
    );
  }

  if (!family) {
    return (
      <NotFoundState
        title="Family Not Found"
        description="This family doesn't exist or may have been removed."
        backTo="/families"
        backLabel="← Back to families"
      />
    );
  }

  const husbandName = family.husband ? displayName(family.husband) : "Unknown";
  const wifeName = family.wife ? displayName(family.wife) : "Unknown";
  const familyName = `${husbandName} & ${wifeName}`;

  return (
    <Container fluid py="md">
      <Stack gap="xl" w="100%">
        <PageHeader
          avatar={<IconUsersGroup size={48} />}
          metadata={[
            { title: "Husband", value: husbandName },
            { title: "Wife", value: wifeName },
          ]}
          rightSection={<Code>{family.gedcomId}</Code>}
          title={familyName}
        />

        <Grid gutter={64}>
          <Grid.Col span={4}>
            <Stack gap="xl">
              <Stack gap="xs">
                <Title order={4}>Parents</Title>
                {family.husband && (
                  <CardIndividual
                    individualId={family.husband.id}
                    lifeSpan={family.husband.lifeSpan}
                    name={displayName(family.husband)}
                    role="Husband"
                  />
                )}

                {family.wife && (
                  <CardIndividual
                    individualId={family.wife.id}
                    lifeSpan={family.wife.lifeSpan}
                    name={displayName(family.wife)}
                    role="Wife"
                  />
                )}
                {(!family.husband || !family.wife) && (
                  <Group>
                    <Button variant="default">Add parent</Button>
                  </Group>
                )}
              </Stack>

              <Stack gap="xs">
                <Title order={4}>Children</Title>
                {family.children.map((child) => (
                  <CardIndividual
                    key={child.id}
                    individualId={child.id}
                    lifeSpan={child.lifeSpan}
                    name={displayName(child)}
                  />
                ))}

                <Group>
                  <Button variant="default">Add child</Button>
                </Group>
              </Stack>
            </Stack>
          </Grid.Col>

          <Grid.Col span={4}>
            <Stack gap="xl">
              <Stack gap="xs">
                <Title order={4}>Sources</Title>
                TODO
              </Stack>

              <Stack gap="xs">
                <Title order={4}>Medias</Title>
                TODO
              </Stack>
            </Stack>
          </Grid.Col>

          <Grid.Col span={4}>
            <Stack gap="xl">
              <Stack gap="xs">
                <Title order={4}>Events</Title>
                <Timeline bulletSize={40} lineWidth={3}>
                  {family.events.map((event, index) => (
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
                        index === family.events.length - 1 ? "dashed" : "solid"
                      }
                    >
                      <Text size="xs" mt={4}>
                        {event.date}
                      </Text>
                    </Timeline.Item>
                  ))}
                  <Timeline.Item bullet={<IconPlus />}>
                    <Button variant="default">Add event</Button>
                  </Timeline.Item>
                </Timeline>
              </Stack>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}

export default FamilyPage;
