import { fetchIndividuals } from "@/api";
import { GenderIcon } from "@/components/GenderIcon";
import { H2 } from "@/components/typography/h2";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Enums, Tables } from "@/database.types";
import { useSorting } from "@/hooks/useSorting";
import { IndividualSortField } from "@/types/sort";
import displayName from "@/utils/displayName";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { useState } from "react";

const ITEMS_PER_PAGE = 10;

export const Route = createFileRoute("/individuals/")({
  component: IndividualsPage,
});

type Name = Pick<Tables<"names">, "first_name" | "last_name" | "is_primary">;

type Individual = {
  id: string;
  gender: Enums<"gender">;
  names: Name[];
};

const columns: ColumnDef<Individual>[] = [
  {
    accessorKey: "gender",
    header: "",
    cell: ({ row }) => (
      <GenderIcon className="w-4 h-4" gender={row.original.gender} />
    ),
    size: 32,
  },
  {
    accessorKey: "names",
    header: "First Name",
    cell: ({ row }) => displayName(row.original.names, { part: "first" }),
    id: "first_name",
  },
  {
    accessorKey: "names",
    header: "Last Name",
    cell: ({ row }) => displayName(row.original.names, { part: "last" }),
    id: "last_name",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="secondary" size="sm" asChild>
        <Link
          to="/individuals/$individualId"
          params={{ individualId: row.original.id }}
        >
          View
        </Link>
      </Button>
    ),
    size: 100,
  },
];

function IndividualsPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const { sorting, sortConfig, onSortingChange } =
    useSorting<IndividualSortField>({
      defaultField: "last_name",
    });

  const { data, isLoading, error } = useQuery({
    queryKey: ["individuals", page, query, sortConfig],
    queryFn: () => fetchIndividuals({ page, query, sort: sortConfig }),
    placeholderData: keepPreviousData,
    enabled: !query || query.length > 2,
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setPage(1);
  };

  const handleSortingChange = (updatedSorting: SortingState) => {
    onSortingChange(updatedSorting);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <H2>Individuals</H2>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search individuals"
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

      {isLoading && <div>Loading individuals...</div>}

      {error && <div>Error loading individuals: {error.message}</div>}

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        page={page}
        totalItems={data?.total ?? 0}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />
    </div>
  );
}

export default IndividualsPage;
