import { createEvent } from "@/api/events/createEvent";
import { EventForm, PageHeader, type EventFormData } from "@/components";
import { useTree } from "@/hooks/use-tree";
import { Container, Stack } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/events/add")({
  component: AddEventPage,
});

function AddEventPage() {
  const { currentTreeId, isLoading: treeLoading } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createEventMutation = useMutation({
    mutationFn: (data: EventFormData) => createEvent(currentTreeId!, data),
    onSuccess: () => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: ["events", currentTreeId] });
      showNotification({
        title: "Success",
        message: "Event created successfully",
        color: "green",
      });
      navigate({ to: "/events" });
    },
    onError: (error) => {
      showNotification({
        title: "Error",
        message: `Failed to create event: ${error.message}`,
        color: "red",
      });
    },
  });

  // Show loading state while tree is loading
  if (treeLoading) {
    return (
      <Container fluid>
        <Stack gap="xl" w="100%" align="flex-start">
          <PageHeader title="Add Event" />
          <div>Loading tree data...</div>
        </Stack>
      </Container>
    );
  }

  // Show error if no tree is selected
  if (!currentTreeId) {
    return (
      <Container fluid>
        <Stack gap="xl" w="100%" align="flex-start">
          <PageHeader title="Add Event" />
          <div>No tree selected. Please select a tree first.</div>
        </Stack>
      </Container>
    );
  }

  const handleSubmit = async (values: EventFormData) => {
    if (!currentTreeId) {
      showNotification({
        title: "Error",
        message: "No tree selected. Please select a tree first.",
        color: "red",
      });
      return;
    }

    createEventMutation.mutate(values);
  };

  const handleCancel = () => {
    navigate({ to: "/events" });
  };

  return (
    <Container fluid>
      <Stack gap="xl" w="100%" align="flex-start">
        <PageHeader title="Add Event" />
        <EventForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={createEventMutation.isPending}
        />
      </Stack>
    </Container>
  );
}
