import { fetchEvent } from "@/api/events/fetchEvent";
import { updateEvent } from "@/api/events/updateEvent";
import {
  ErrorState,
  EventForm,
  LoadingState,
  PageHeader,
  type EventFormData,
} from "@/components";
import { useTree } from "@/hooks/use-tree";
import { Container, Stack } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLazyFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";

export const Route = createLazyFileRoute("/events/$eventId_/edit")({
  component: EventEditPage,
});

function EventEditPage() {
  const { eventId } = useParams({ from: "/events/$eventId_/edit" });
  const { currentTreeId } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch the current event data
  const {
    data: event,
    status,
    error,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchEvent(currentTreeId ?? "", eventId),
    enabled: Boolean(currentTreeId && eventId),
  });

  const updateEventMutation = useMutation({
    mutationFn: (data: EventFormData) => {
      return updateEvent(currentTreeId!, eventId, {
        typeId: data.typeId,
        date: data.date,
        placeId: data.placeId,
        description: data.description,
        subjects: data.subjects,
        participants: data.participants,
      });
    },
    onSuccess: async () => {
      showNotification({
        title: "Success",
        message: `Event updated successfully`,
        color: "green",
      });

      // Invalidate all related queries that could be affected by the event update
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events", currentTreeId] });

      navigate({ to: `/events/${eventId}` });
    },
    onError: (error) => {
      const errorMessage = (() => {
        if (error instanceof Error) return error.message;
        return "An unknown error occurred";
      })();

      showNotification({
        title: "Error",
        message: `Failed to update event: ${errorMessage}`,
        color: "red",
      });
    },
  });

  if (status === "pending") {
    return <LoadingState message="Loading event details..." />;
  }

  if (status === "error") {
    return <ErrorState error={error} backTo="/events" />;
  }

  if (!event) {
    return <ErrorState error={new Error("Event not found")} backTo="/events" />;
  }

  // Transform event data to match EventForm format
  const initialValues: EventFormData = {
    id: event.id,
    typeId: event.type.id,
    date: event.date || "",
    placeId: event.place?.id || "",
    description: event.description || "",
    subjects: event.participants
      .filter((participant) => {
        // Get subjects (including husband/wife for marriage events)
        const isSubject = participant.role.key === "subject";
        const isHusband = participant.role.key === "husband";
        const isWife = participant.role.key === "wife";
        return isSubject || isHusband || isWife;
      })
      .map((participant) => ({
        individualId: participant.id,
      })),
    participants: event.participants
      .filter((participant) => {
        // Filter out subjects since they're handled separately
        const isSubject = participant.role.key === "subject";
        const isHusband = participant.role.key === "husband";
        const isWife = participant.role.key === "wife";
        return !isSubject && !isHusband && !isWife;
      })
      .map((participant) => ({
        individualId: participant.id,
        roleId: participant.role.id,
      })),
  };

  const handleSubmit = async (values: EventFormData) => {
    await updateEventMutation.mutateAsync(values);
  };

  const handleCancel = () => {
    navigate({ to: `/events/${eventId}` });
  };

  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader title={`Edit Event: ${event.title}`} />
        <EventForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={updateEventMutation.isPending}
        />
      </Stack>
    </Container>
  );
} 