import {
  fetchPlacesRecursively,
  flattenPlaces,
} from "@/api/fetchPlacesRecursively";
import { BlankState } from "@/components/BlankState";
import { PageCard } from "@/components/PageCard";
import { PlaceChildrenTable } from "@/components/place/PlaceChildrenTable";
import { Center, Loader, Stack, Text } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";

type PlaceChildrenProps = {
  readonly placeId: string;
  readonly placeName: string;
};

/**
 * Displays the places within a specific location
 */
export function PlaceChildren({ placeId, placeName }: PlaceChildrenProps) {
  const {
    data: places,
    status,
    error,
  } = useQuery({
    queryKey: ["places-children", placeId],
    queryFn: async () => {
      const places = await fetchPlacesRecursively(placeId);
      return flattenPlaces(places);
    },
    placeholderData: keepPreviousData,
  });

  return (
    <PageCard title="Sub Locations" icon={MapPin} actionLabel="Add location">
      {(() => {
        if (status === "pending") {
          return (
            <Center py="xl">
              <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text c="dimmed">Loading sub locations...</Text>
              </Stack>
            </Center>
          );
        }

        if (status === "error") {
          return (
            <Center py="xl">
              <Stack align="center" gap="md">
                <MapPin size={48} color="var(--mantine-color-red-6)" />
                <Text c="red" ta="center">
                  Error loading places: {error.message}
                </Text>
              </Stack>
            </Center>
          );
        }

        if (status === "success") {
          if (places.length === 0) {
            return (
              <BlankState
                icon={MapPin}
                title="No Sub Locations"
                description={`No places found within ${placeName}.`}
              />
            );
          }
          return <PlaceChildrenTable places={places} />;
        }

        return null;
      })()}
    </PageCard>
  );
}
