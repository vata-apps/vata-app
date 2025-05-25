import { fetchEvent } from "@/api";
import { ErrorState, LoadingState, NotFoundState } from "@/components";
import {
  EventHeader,
  MediaCard,
  PeopleInvolvedCard,
  SourcesCard,
} from "@/components/event";
import { getEventTitle } from "@/utils/events";
import { Anchor, Breadcrumbs, Container, Stack, Text } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/events/$eventId")({
  component: EventPage,
});

function EventPage() {
  const { eventId } = Route.useParams();

  const {
    data: event,
    status,
    error,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchEvent(eventId),
    placeholderData: keepPreviousData,
  });

  if (status === "pending") {
    return <LoadingState message="Loading event details..." />;
  }

  if (status === "error") {
    return (
      <ErrorState
        error={error}
        title="Something went wrong"
        backTo="/events"
        backLabel="← Back to events"
      />
    );
  }

  if (!event) {
    return (
      <NotFoundState
        title="Event Not Found"
        description="This event doesn't exist or may have been removed."
        backTo="/events"
        backLabel="← Back to events"
      />
    );
  }

  return (
    <Container fluid py="md">
      <Stack gap="xl">
        <Breadcrumbs>
          <Anchor component={Link} to="/events">
            Events
          </Anchor>
          <Text c="dimmed">{getEventTitle(event)}</Text>
        </Breadcrumbs>

        <EventHeader event={event} />

        <PeopleInvolvedCard event={event} />

        <SourcesCard />

        <MediaCard />
      </Stack>
    </Container>
  );
}

export default EventPage;
