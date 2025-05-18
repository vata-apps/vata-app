import {
  fetchPlacesRecursively,
  flattenPlaces,
} from "@/api/fetchPlacesRecursively";
import { PlaceChildrenTable } from "@/components/place/PlaceChildrenTable";
import { Stack, Text, Title } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type PlaceChildrenProps = {
  placeId: string;
  placeName: string;
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
    <Stack gap="sm">
      <Title order={4}>Places within {placeName}</Title>

      {(() => {
        if (status === "pending") return "Loading...";

        if (status === "error") {
          return <Text c="red">Error loading places: {error.message}</Text>;
        }

        if (status === "success") {
          return <PlaceChildrenTable places={places} placeName={placeName} />;
        }

        return null;
      })()}
    </Stack>
  );
}
