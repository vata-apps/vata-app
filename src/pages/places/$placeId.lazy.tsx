import { getPlaceDetails } from "@/api/getPlaceDetails";
import { ErrorState, LoadingState } from "@/components";
import { PageHeaderNew } from "@/components/PageHeaderNew";
import { TableEvents } from "@/components/tables/TableEvents/TableEvents";
import { deletePlace } from "@/db";
import { useTree } from "@/hooks/use-tree";
import {
  Badge,
  Button,
  Container,
  Group,
  Modal,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import { IconEdit, IconMapPin, IconTag, IconTrash } from "@tabler/icons-react";
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

function PlaceDetailPage() {
  const { placeId } = Route.useParams();
  const { currentTreeId } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const placeDetailsQuery = useQuery({
    queryKey: ["placeDetails", placeId],
    queryFn: () => getPlaceDetails({ placeId }),
    placeholderData: keepPreviousData,
  });

  const childrenQuery = useQuery({
    queryKey: ["placeChildren", placeId],
    queryFn: () => [],
    placeholderData: keepPreviousData,
  });

  console.log("childrenQuery", childrenQuery.data);

  const parentQuery = useQuery({
    queryKey: ["placeParent", placeId],
    queryFn: () => [],
    placeholderData: keepPreviousData,
  });

  console.log("parentQuery", parentQuery.data);

  const deleteMutation = useMutation({
    mutationFn: () => deletePlace({ placeId }),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });

      // Navigate back to places list
      navigate({ to: "/places" });
    },
  });

  if (placeDetailsQuery.status === "pending") {
    return <LoadingState message="Loading place details..." />;
  }

  if (placeDetailsQuery.status === "error") {
    return <ErrorState error={placeDetailsQuery.error} backTo="/places" />;
  }

  const placeDetails = placeDetailsQuery.data;

  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeaderNew
          avatar={<IconMapPin size={36} />}
          gedcomId={placeDetails.gedcomId}
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
          title={placeDetails.name}
        >
          {placeDetails.placeType && (
            <Badge leftSection={<IconTag size={12} />} variant="default">
              {placeDetails.placeType.name}
            </Badge>
          )}
          {placeDetails.latitude && placeDetails.longitude && (
            <Badge
              leftSection={<IconMapPin size={12} />}
              variant="default"
            >{`${placeDetails.latitude}, ${placeDetails.longitude}`}</Badge>
          )}
        </PageHeaderNew>

        <Tabs defaultValue="details" keepMounted={false}>
          <Tabs.List>
            <Tabs.Tab value="details">Details</Tabs.Tab>
            <Tabs.Tab value="events">Events</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="details">DETAILS</Tabs.Panel>
          <Tabs.Panel pt="xl" value="events">
            <TableEvents placeId={placeId} />
          </Tabs.Panel>
        </Tabs>
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
            {placeDetails.name}
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
