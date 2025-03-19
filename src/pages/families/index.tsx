import { fetchFamilies } from "@/api";
import { FamilyMember } from "@/components/individual/FamilyMember";
import { H2 } from "@/components/typography/h2";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ChangeEvent, useState } from "react";

const ITEMS_PER_PAGE = 10;

type Family = Awaited<ReturnType<typeof fetchFamilies>>["data"][number];

const columns: ColumnDef<Family>[] = [
  {
    accessorKey: "husband",
    header: "Husband",
    cell: ({ row }) => {
      const husband = row.original.husband;
      return husband ? <FamilyMember individual={husband} /> : null;
    },
    size: 250,
  },
  {
    accessorKey: "wife",
    header: "Wife",
    cell: ({ row }) => {
      const wife = row.original.wife;
      return wife ? <FamilyMember individual={wife} /> : null;
    },
    size: 250,
  },
  {
    accessorKey: "children",
    header: "Children",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {row.original.children.map((child) => (
          <FamilyMember
            key={child.individual.id}
            individual={child.individual}
          />
        ))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/families/$familyId" params={{ familyId: row.original.id }}>
            View
          </Link>
        </Button>
      </div>
    ),
    size: 120,
  },
];

export const Route = createFileRoute("/families/")({
  component: FamiliesPage,
});

function FamiliesPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["families", page, query],
    queryFn: () => fetchFamilies({ page, query }),
    placeholderData: keepPreviousData,
    enabled: !query || query.length > 2,
  });

  const handleSearch = (value: ChangeEvent<HTMLInputElement>) => {
    setQuery(value.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <H2>Families</H2>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search families"
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

      {isLoading && <div>Loading families...</div>}

      {error && <div>Error loading families: {error.message}</div>}

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        page={page}
        totalItems={data?.total ?? 0}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />
    </div>
  );
}

export default FamiliesPage;
