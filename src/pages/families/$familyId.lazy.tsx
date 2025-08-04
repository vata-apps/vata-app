import { deleteFamily } from "@/api/families/deleteFamily";
import { fetchFamilyForPage } from "@/api/families/fetchFamilyForPage";
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
import { IconPlus, IconTrash, IconUsersGroup } from "@tabler/icons-react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createLazyFileRoute("/families/$familyId")({
  component: FamilyPage,
});

/**
 * Displays the family page with husband, wife, and children information
 */
function FamilyPage() {
  const { familyId } = Route.useParams();
  const { currentTreeId } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  const deleteMutation = useMutation({
    mutationFn: () => deleteFamily(currentTreeId ?? "", familyId),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({ queryKey: ["individuals"] });

      // Navigate back to families list
      navigate({ to: "/families" });
    },
  });

  if (status === "pending") {
    return <LoadingState message="Loading family details..." />;
  }

  if (status === "error") {
    return <ErrorState error={error} backTo="/families" />;
  }

  const husbandName = family.husband ? displayName(family.husband) : "Unknown";
  const wifeName = family.wife ? displayName(family.wife) : "Unknown";
  const familyName = `${husbandName} & ${wifeName}`;

  return (
    <Container fluid py="md">
      <Stack gap="xl" w="100%">
        <PageHeader
          avatar={<IconUsersGroup size={48} />}
          gedcomId={family.gedcomId}
          metadata={[
            { title: "Husband", value: husbandName },
            { title: "Wife", value: wifeName },
          ]}
          rightSection={
            <Button
              color="red"
              variant="light"
              onClick={() => setDeleteModalOpen(true)}
              loading={deleteMutation.isPending}
              radius="xl"
            >
              <IconTrash size={16} />
            </Button>
          }
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

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={
          <Group gap="sm">
            <IconTrash size={24} color="var(--mantine-color-red-6)" />
            <Text fw={600} size="lg">
              Delete Family
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
            {familyName}
          </Text>

          <Stack gap="md">
            <Text size="md" c="dimmed" fw={500}>
              This will delete:
            </Text>
            <Stack gap={8} pl="md">
              <Text size="md" c="dimmed">
                • The family itself
              </Text>
              <Text size="md" c="dimmed">
                • All family-child relationships
              </Text>
              <Text size="md" c="dimmed">
                • Family structure and connections
              </Text>
            </Stack>
          </Stack>

          <Text size="md" c="dimmed" ta="center">
            Note: Individual family members will be preserved
          </Text>

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

export default FamilyPage;
