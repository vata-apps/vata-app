import { fetchPlaceById } from "@/api/fetchPlaceById";
import { PlaceChildren } from "@/components/place/PlaceChildren";
import { PlaceEvents } from "@/components/place/PlaceEvents";
import { PlaceHeader } from "@/components/place/PlaceHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarIcon, CornerDownRightIcon, MapIcon } from "lucide-react";
import { useEffect, useState } from "react";

// Define a recursive type for the parent hierarchy
type ParentPlace = {
  id: string;
  name: string;
  parent: ParentPlace | null;
};

export const Route = createFileRoute("/places/$placeId")({
  component: PlaceDetailPage,
});

function PlaceDetailPage() {
  const { placeId } = Route.useParams();
  const [place, setPlace] = useState<null | {
    id: string;
    name: string;
    type: { name: string };
    parent: ParentPlace | null;
    latitude?: number | null;
    longitude?: number | null;
    created_at: string;
  }>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadPlace = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        setNotFound(false);

        const placeData = await fetchPlaceById(placeId);

        if (!placeData) {
          setNotFound(true);
          return;
        }

        setPlace(placeData);
      } catch (error) {
        console.error("Error loading place:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Unknown error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPlace();
  }, [placeId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Loading...</CardHeader>
        </Card>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Error loading place: {errorMessage}</CardHeader>
        </Card>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Place not found</CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {place && <PlaceHeader place={place} />}

      <Tabs defaultValue="sublocations">
        <TabsList>
          <TabsTrigger value="sublocations">
            <CornerDownRightIcon className="h-4 w-4 mr-2" />
            Sublocations
          </TabsTrigger>
          <TabsTrigger value="events">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="map">
            <MapIcon className="h-4 w-4 mr-2" />
            Map
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sublocations" className="mt-4">
          {place && <PlaceChildren placeId={placeId} placeName={place.name} />}
        </TabsContent>
        <TabsContent value="events" className="mt-4">
          <PlaceEvents placeId={placeId} />
        </TabsContent>
        <TabsContent value="map" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Map</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Map view will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PlaceDetailPage;
