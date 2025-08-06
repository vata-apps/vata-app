import { deleteIndividual } from "@/api/individuals/deleteIndividual";
import { fetchIndividualForPage } from "@/api/individuals/fetchIndividualForPage";
import { ErrorState, LoadingState, PageHeader } from "@/components";
import { CardIndividual } from "@/components/CardIndividual";
import { useTree } from "@/hooks/use-tree";
import displayName from "@/utils/displayName";
import {
  Button,
  Container,
  Grid,
  Group,
  Modal,
  Stack,
  Text,
  Timeline,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Fragment, useState } from "react";

export const Route = createLazyFileRoute("/individuals/$individualId")({
  component: IndividualDetailPage,
});

/**
 * Displays the individual page with details, family relationships, and names
 */
function IndividualDetailPage() {
  const { individualId } = Route.useParams();
  const { currentTreeId } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const {
    data: individual,
    status,
    error,
  } = useQuery({
    queryKey: ["individualForPage", individualId],
    queryFn: () => fetchIndividualForPage(currentTreeId ?? "", individualId),
    placeholderData: keepPreviousData,
    enabled: Boolean(currentTreeId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteIndividual(currentTreeId ?? "", individualId),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["individuals"] });
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });

      // Navigate back to individuals list
      navigate({ to: "/individuals" });
    },
  });

  if (status === "pending") {
    return <LoadingState message="Loading individual details..." />;
  }

  if (status === "error") {
    return <ErrorState error={error} backTo="/individuals" />;
  }

  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader
          avatar={displayName(individual)}
          gedcomId={individual.gedcomId ?? undefined}
          rightSection={
            <>
              <Button
                component={Link}
                to={`/individuals/${individualId}/edit`}
                leftSection={<IconEdit size={16} />}
                radius="xl"
              >
                Edit
              </Button>
              <Button
                color="red"
                radius="xl"
                variant="light"
                onClick={() => setDeleteModalOpen(true)}
                loading={deleteMutation.isPending}
              >
                <IconTrash size={16} />
              </Button>
            </>
          }
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
                  <Button
                    variant="default"
                    component={Link}
                    to={`/events/add?individualId=${individualId}`}
                  >
                    Add new event
                  </Button>
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
              <Button
                variant="default"
                radius="lg"
                component={Link}
                to={`/families/add?individualId=${individualId}`}
              >
                Add family
              </Button>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={
          <Group gap="sm">
            <IconTrash size={24} color="var(--mantine-color-red-6)" />
            <Text fw={600} size="lg">
              Delete Individual
            </Text>
          </Group>
        }
        centered
        size="md"
        padding="xl"
        radius="md"
      >
        <Stack gap="lg">
          <Text size="md" c="dimmed" ta="center">
            Are you sure you want to delete
          </Text>

          <Text size="xl" fw={700} c="white" ta="center" mb="md">
            {displayName(individual)}?
          </Text>

          <Stack gap="md">
            <Text size="md" c="dimmed" fw={500}>
              This will delete:
            </Text>
            <Stack gap={8} pl="md">
              <Text size="md" c="dimmed">
                • All names and family relationships
              </Text>
              <Text size="md" c="dimmed">
                • Events where this person is the main subject
              </Text>
              <Text size="md" c="dimmed">
                • Remove this person from shared events
              </Text>
              <Text size="md" c="dimmed">
                • Update family records (remove as spouse)
              </Text>
            </Stack>
          </Stack>

          <Text size="md" c="red" fw={600} ta="center">
            This action cannot be undone
          </Text>

          <Group justify="flex-end" gap="md" mt="md">
            <Button
              variant="light"
              size="md"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              color="red"
              size="md"
              onClick={() => deleteMutation.mutate()}
              loading={deleteMutation.isPending}
              leftSection={<IconTrash size={16} />}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
