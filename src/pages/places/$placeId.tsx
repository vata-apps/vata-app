import { fetchPlaceById } from "@/api/fetchPlaceById";
import { ErrorState, LoadingState, NotFoundState } from "@/components";
import {
  MapCard,
  PlaceChildren,
  PlaceEvents,
  PlaceHeader,
} from "@/components/place";
import { Anchor, Breadcrumbs, Container, Stack, Text } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/places/$placeId")({
  component: PlaceDetailPage,
});

/**
 * Displays the place page with details, sublocations, events and map
 */
function PlaceDetailPage() {
  const { placeId } = Route.useParams();

  const {
    data: place,
    status,
    error,
  } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => fetchPlaceById(placeId),
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
    <Container fluid py="md">
      <Stack gap="xl">
        <Breadcrumbs>
          <Anchor component={Link} to="/places">
            Places
          </Anchor>
          <Text c="dimmed">{place.name}</Text>
        </Breadcrumbs>

        <PlaceHeader place={place} />

        <MapCard />

        <PlaceChildren placeId={placeId} placeName={place.name} />

        <PlaceEvents placeId={placeId} />
      </Stack>
    </Container>
  );
}

export default PlaceDetailPage;
