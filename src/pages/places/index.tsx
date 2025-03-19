import { fetchPlaces, PlaceWithType } from "@/api";
import { H2 } from "@/components/typography/h2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { useSorting } from "@/hooks/useSorting";
import { PlaceSortField } from "@/types/sort";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ChangeEvent, useState } from "react";

const ITEMS_PER_PAGE = 10;

const columns: ColumnDef<PlaceWithType>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    size: 400,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.place_type?.name || ""}
      </Badge>
    ),
    size: 150,
    enableSorting: false,
  },
  {
    accessorKey: "parent",
    header: "Parent",
    cell: ({ row }) => row.original.parent?.name || "None",
    size: 300,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/places/$placeId" params={{ placeId: row.original.id }}>
            View
          </Link>
        </Button>
      </div>
    ),
    size: 100,
    enableSorting: false,
  },
];

export const Route = createFileRoute("/places/")({
  component: PlacesPage,
});

function PlacesPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const { sorting, sortConfig, onSortingChange } = useSorting<PlaceSortField>({
    defaultField: "name",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["places", page, query, sortConfig],
    queryFn: () =>
      fetchPlaces({ page, query, sortConfig: sortConfig || undefined }),
    placeholderData: keepPreviousData,
    enabled: !query || query.length > 2,
  });

  const handleSearch = (value: ChangeEvent<HTMLInputElement>) => {
    setQuery(value.target.value);
    setPage(1);
  };

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

      <DataTable
        columns={columns}
        data={data?.data || []}
        page={page}
        totalItems={data?.total || 0}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
        sorting={sorting}
        onSortingChange={onSortingChange}
      />
    </div>
  );
}

export default PlacesPage;
