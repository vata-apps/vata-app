import { fetchPlaceById } from "@/api/fetchPlaceById";
import { PlaceChildren } from "@/components/place/PlaceChildren";
import { PlaceEvents } from "@/components/place/PlaceEvents";
import { PlaceHeader } from "@/components/place/PlaceHeader";
import { Loader, Stack, Tabs, Text } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

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

  if (status === "pending") return <Loader />;

  if (status === "error") {
    return <Text>Error loading place: {error.message}</Text>;
  }

  if (!place) return <Text>Place not found</Text>;

  return (
    <Stack>
      {/* Header Section */}
      <PlaceHeader place={place} />

      {/* Tabs Section */}
      <Tabs defaultValue="sublocations" mt="lg" variant="default">
        <Tabs.List className="w-full justify-start">
          <Tabs.Tab value="sublocations">Sublocations</Tabs.Tab>
          <Tabs.Tab value="events">Events</Tabs.Tab>
          <Tabs.Tab value="map">Map</Tabs.Tab>
        </Tabs.List>

        {/* Sublocations Tab */}
        <Tabs.Panel py="lg" value="sublocations">
          <PlaceChildren placeId={placeId} placeName={place.name} />
        </Tabs.Panel>

        {/* Events Tab */}
        <Tabs.Panel py="lg" value="events">
          <PlaceEvents placeId={placeId} />
        </Tabs.Panel>

        {/* Map Tab */}
        <Tabs.Panel py="lg" value="map">
          <Text>Map view will be implemented here</Text>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

export default PlaceDetailPage;
