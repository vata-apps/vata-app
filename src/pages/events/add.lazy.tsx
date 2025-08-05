import { createEvent } from "@/api/events/createEvent";
import { fetchIndividual } from "@/api/individuals/fetchIndividual";
import { EventForm, PageHeader, type EventFormData } from "@/components";
import { useTree } from "@/hooks/use-tree";
import displayName from "@/utils/displayName";
import { Container, Stack } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/events/add")({
  component: AddEventPage,
});

function AddEventPage() {
  const { currentTreeId, isLoading: treeLoading } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const preselectedIndividualId =
    new URLSearchParams(window.location.search).get("individualId") ||
    undefined;

  // Fetch individual data if preselected
  const { data: preselectedIndividual } = useQuery({
    queryKey: ["individual", preselectedIndividualId],
    queryFn: () =>
      fetchIndividual(currentTreeId ?? "", preselectedIndividualId!),
    enabled: Boolean(currentTreeId && preselectedIndividualId),
  });

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
      // Navigate back to individual page if we came from there, otherwise to events list
      if (preselectedIndividualId) {
        navigate({ to: `/individuals/${preselectedIndividualId}` });
      } else {
        navigate({ to: "/events" });
      }
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
    // Navigate back to individual page if we came from there, otherwise to events list
    if (preselectedIndividualId) {
      navigate({ to: `/individuals/${preselectedIndividualId}` });
    } else {
      navigate({ to: "/events" });
    }
  };

  // Generate page title
  const pageTitle = preselectedIndividual
    ? `Add Event for ${displayName(preselectedIndividual)}`
    : "Add Event";

  return (
    <Container fluid>
      <Stack gap="xl" w="100%" align="flex-start">
        <PageHeader title={pageTitle} />
        <EventForm
          mode="create"
          preselectedIndividualId={preselectedIndividualId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={createEventMutation.isPending}
        />
      </Stack>
    </Container>
  );
}
