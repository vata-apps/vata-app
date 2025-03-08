import { fetchPlaces, PlaceWithType } from "@/api";
import { H2 } from "@/components/typography/h2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ChangeEvent, useState } from "react";

const ITEMS_PER_PAGE = 10;

export const Route = createFileRoute("/places/")({
  component: PlacesPage,
});

/**
 * Capitalizes the first letter of each word in a string
 */
function capitalize(str: string) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function PlacesPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["places", page, query],
    queryFn: () => fetchPlaces({ page, query }),
    placeholderData: keepPreviousData,
    enabled: !query || query.length > 2,
  });

  const handleSearch = (value: ChangeEvent<HTMLInputElement>) => {
    setQuery(value.target.value);
    setPage(1);
  };

  const totalPages = data?.total ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  return (
    <div className="space-y-8">
      <H2>Places</H2>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search places"
          value={query}
          onChange={handleSearch}
          className="w-full max-w-sm"
        />

        {query && (
          <Button variant="secondary" onClick={() => setQuery("")}>
            Clear
          </Button>
        )}
      </div>

      {isLoading && <div>Loading places...</div>}

      {error && <div>Error loading places: {error.message}</div>}

      <div className="overflow-x-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead className="w-[15%]">Type</TableHead>
              <TableHead className="w-[20%]">Part of</TableHead>
              <TableHead className="w-[12%]">Latitude</TableHead>
              <TableHead className="w-[12%]">Longitude</TableHead>
              <TableHead className="w-[11%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((place: PlaceWithType) => (
              <TableRow key={place.id}>
                <TableCell className="truncate">{place.name}</TableCell>
                <TableCell>
                  {place.place_type?.name && (
                    <Badge variant="secondary">
                      {capitalize(place.place_type.name)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="truncate">
                  {place.parent?.name || "-"}
                </TableCell>
                <TableCell>{place.latitude || "-"}</TableCell>
                <TableCell>{place.longitude || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="secondary" size="sm" asChild>
                    <Link to="/places/$placeId" params={{ placeId: place.id }}>
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlacesPage;
