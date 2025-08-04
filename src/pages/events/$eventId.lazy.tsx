import { deleteEvent } from "@/api/events/deleteEvent";
import { fetchEventForPage } from "@/api/events/fetchEventForPage";
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
  Title,
} from "@mantine/core";
import { IconCalendar, IconEdit, IconTrash } from "@tabler/icons-react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

const SUBJECT_ROLES = ["subject", "husband", "wife"];

export const Route = createLazyFileRoute("/events/$eventId")({
  component: EventPage,
});

function EventPage() {
  const { eventId } = Route.useParams();
  const { currentTreeId } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data, status, error } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventForPage(currentTreeId ?? "", eventId),
    enabled: Boolean(currentTreeId && eventId),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(currentTreeId ?? "", eventId),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["individuals"] });

      // Navigate back to events list
      navigate({ to: "/events" });
    },
  });

  if (status === "pending") {
    return <LoadingState message="Loading event details..." />;
  }

  if (status === "error") {
    return <ErrorState error={error} backTo="/events" />;
  }

  const subjects = data.participants.filter((participant) =>
    SUBJECT_ROLES.includes(participant.role.key ?? ""),
  );
  const witnesses = data.participants.filter(
    (participant) => !SUBJECT_ROLES.includes(participant.role.key ?? ""),
  );

  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader
          avatar={<IconCalendar size={48} />}
          gedcomId={data.gedcomId}
          metadata={[
            { title: "Place", value: data.place?.name ?? "Unknown" },
            { title: "Date", value: data.date ?? "Unknown" },
          ]}
          rightSection={
            <>
              <Button
                component={Link}
                to={`/events/${eventId}/edit`}
                leftSection={<IconEdit size={16} />}
                radius="xl"
              >
                Edit
              </Button>
              <Button
                color="red"
                variant="light"
                onClick={() => setDeleteModalOpen(true)}
                loading={deleteMutation.isPending}
                radius="xl"
              >
                <IconTrash size={16} />
              </Button>
            </>
          }
          title={data.title}
        />

        <Grid gutter={64}>
          <Grid.Col span={6}>
            <Stack gap="xl">
              <Stack gap="xs">
                <Title order={4}>Subjects</Title>

                {subjects.map((subject) => (
                  <CardIndividual
                    key={subject.id}
                    individualId={subject.id}
                    lifeSpan={subject.lifeSpan}
                    name={displayName(subject)}
                    role={
                      subject.role.key !== "subject"
                        ? subject.role.name
                        : undefined
                    }
                  />
                ))}

                {data.type.key === "marriage" && subjects.length !== 2 && (
                  <Button variant="default">Add spouse</Button>
                )}
              </Stack>

              <Stack gap="xs">
                <Title order={4}>Witnesses</Title>

                {witnesses.length > 0 &&
                  witnesses.map((witness) => (
                    <CardIndividual
                      key={witness.id}
                      individualId={witness.id}
                      lifeSpan={witness.lifeSpan}
                      name={displayName(witness)}
                      role={witness.role.name}
                    />
                  ))}

                <Group>
                  <Button variant="default">Add witness</Button>
                </Group>
              </Stack>
            </Stack>
          </Grid.Col>

          <Grid.Col span={6}>
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
              Delete Event
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
            {data.title}
          </Text>

          <Stack gap="md">
            <Text size="md" c="dimmed" fw={500}>
              This will delete:
            </Text>
            <Stack gap={8} pl="md">
              <Text size="md" c="dimmed">
                • The event itself
              </Text>
              <Text size="md" c="dimmed">
                • All event participants and subjects
              </Text>
              <Text size="md" c="dimmed">
                • All event relationships
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
