import { fetchPlaces } from "@/api";
import { H2 } from "@/components/typography/h2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/utils/navigation";
import { capitalize } from "@/utils/strings";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChangeEvent, useState } from "react";

const ITEMS_PER_PAGE = 10;

export const Route = createFileRoute("/places/")({
  component: PlacesPage,
});

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
  const pagination = usePagination(page, totalPages);

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Name</TableHead>
            <TableHead className="w-1/4">Type</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((place) => (
            <TableRow key={place.id}>
              <TableCell>{place.name}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {capitalize(place.place_type?.name || "")}
                </Badge>
              </TableCell>
              <TableCell>{place.parent?.name || "None"}</TableCell>
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

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

export default PlacesPage;
