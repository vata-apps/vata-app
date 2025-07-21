import { Place } from "@/api/places/fetchPlace";
import { fetchPlaceForPage } from "@/api/places/fetchPlaceForPage";
import {
  ErrorState,
  LoadingState,
  NotFoundState,
  PageHeader,
} from "@/components";
import { useTree } from "@/lib/use-tree";
import {
  Button,
  Card,
  Code,
  Container,
  Grid,
  Stack,
  Text,
  Timeline,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconMapPin, IconPlus } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";

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

  const {
    data: place,
    status,
    error,
  } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => fetchPlaceForPage(currentTreeId ?? "", placeId),
    placeholderData: keepPreviousData,
  });

  if (status === "pending") {
    return <LoadingState message="Loading place details..." />;
  }

  if (status === "error") {
    return (
      <ErrorState
        error={error}
        title="Something went wrong"
        backTo="/places"
        backLabel="← Back to places"
      />
    );
  }

  if (!place) {
    return (
      <NotFoundState
        title="Place Not Found"
        description="This place doesn't exist or may have been removed."
        backTo="/places"
        backLabel="← Back to places"
      />
    );
  }

  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader
          avatar={<IconMapPin size={48} />}
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
          rightSection={<Code>{place.gedcomId}</Code>}
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
    </Container>
  );
}

export default PlaceDetailPage;
