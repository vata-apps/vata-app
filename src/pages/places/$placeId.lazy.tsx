import { deletePlace } from "@/api/places/deletePlace";
import { Place } from "@/api/places/fetchPlace";
import { fetchPlaceForPage } from "@/api/places/fetchPlaceForPage";
import { ErrorState, LoadingState, PageHeader } from "@/components";
import { useTree } from "@/hooks/use-tree";
import {
  Button,
  Card,
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
import { IconEdit, IconMapPin, IconPlus, IconTrash } from "@tabler/icons-react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createLazyFileRoute("/places/$placeId")({
  component: PlaceDetailPage,
});

function PlaceCard({ place }: { place: Place | null }) {
  if (!place) {
    return (
      <Card withBorder radius="lg" py="xs">
        <Stack gap={0}>
          <Text fw={600}>No place</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card
      component={Link}
      to={`/places/${place.id}`}
      withBorder
      radius="lg"
      py="xs"
    >
      <Stack gap={0}>
        <Text fw={600}>{place.name}</Text>
        <Text size="sm">{place.placeType.name}</Text>
      </Stack>
    </Card>
  );
}

/**
 * Displays the place page with details, sublocations, events and map
 */
function PlaceDetailPage() {
  const { placeId } = Route.useParams();
  const { currentTreeId } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const {
    data: place,
    status,
    error,
  } = useQuery({
    queryKey: ["placeForPage", placeId],
    queryFn: () => fetchPlaceForPage(currentTreeId ?? "", placeId),
    placeholderData: keepPreviousData,
    enabled: Boolean(currentTreeId && placeId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePlace(currentTreeId ?? "", placeId),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });

      // Navigate back to places list
      navigate({ to: "/places" });
    },
  });

  if (status === "pending") {
    return <LoadingState message="Loading place details..." />;
  }

  if (status === "error") {
    return <ErrorState error={error} backTo="/places" />;
  }

  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader
          avatar={<IconMapPin size={48} />}
          gedcomId={place.gedcomId}
          metadata={[
            { title: "Type", value: place.placeType.name },
            {
              title: "Lat/Long",
              value:
                place.latitude && place.longitude
                  ? `${place.latitude}, ${place.longitude}`
                  : "N/A",
            },
          ]}
          rightSection={
            <>
              <Button
                component={Link}
                to={`/places/${placeId}/edit`}
                variant="filled"
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
          title={place.name}
        />

        <Grid gutter={64}>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Title order={4}>Events</Title>
              <Timeline bulletSize={40} lineWidth={3}>
                {place.events.map((event, index) => (
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
                      index === place.events.length - 1 ? "dashed" : "solid"
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
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xl">
              <Stack gap="xs">
                <Title order={4}>Map</Title>
                TODO
              </Stack>
              <Stack gap="xs">
                <Title order={4}>Included in</Title>
                <PlaceCard place={place.parent} />
              </Stack>

              <Stack gap="xs">
                <Title order={4}>Includes</Title>
                {place.children.length > 0 ? (
                  place.children.map((child) => (
                    <PlaceCard key={child.id} place={child} />
                  ))
                ) : (
                  <PlaceCard place={null} />
                )}
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
              Delete Place
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
            {place.name}
          </Text>

          <Stack gap="md">
            <Text size="md" c="dimmed" fw={500}>
              This will delete:
            </Text>
            <Stack gap={8} pl="md">
              <Text size="md" c="dimmed">
                • The place itself
              </Text>
              <Text size="md" c="dimmed">
                • Remove place reference from events
              </Text>
              <Text size="md" c="dimmed">
                • Child places will become top-level
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

export default PlaceDetailPage;
