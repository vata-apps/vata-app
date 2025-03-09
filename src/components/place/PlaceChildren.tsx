import {
  fetchPlacesRecursively,
  flattenPlaces,
  RecursivePlaceWithType,
} from "@/api/fetchPlacesRecursively";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { capitalize } from "@/utils/strings";
import { Link } from "@tanstack/react-router";
import { CornerDownRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

type PlaceChildrenProps = {
  placeId: string;
  placeName: string;
};

export function PlaceChildren({ placeId, placeName }: PlaceChildrenProps) {
  const [flattenedPlaces, setFlattenedPlaces] = useState<
    RecursivePlaceWithType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChildPlaces = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const places = await fetchPlacesRecursively(placeId);
        setFlattenedPlaces(flattenPlaces(places));
      } catch (err) {
        console.error("Error fetching child places:", err);
        setError("Failed to load child places");
      } finally {
        setIsLoading(false);
      }
    };

    loadChildPlaces();
  }, [placeId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading sublocations...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            Loading places within {placeName}...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Places within {placeName}</CardTitle>
      </CardHeader>
      <CardContent>
        {flattenedPlaces.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flattenedPlaces.map((place) => (
                <TableRow key={place.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Add indentation based on the level */}
                      {Array.from({ length: place.level }).map((_, index) => (
                        <span key={index} className="w-4" />
                      ))}
                      <CornerDownRightIcon className="h-4 w-4" />
                      <Link
                        to="/places/$placeId"
                        params={{ placeId: place.id }}
                        className="hover:underline font-medium"
                      >
                        {place.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {capitalize(place.type.name)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to="/places/$placeId"
                        params={{ placeId: place.id }}
                      >
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-muted-foreground text-center py-8">
            No places found within {placeName}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
