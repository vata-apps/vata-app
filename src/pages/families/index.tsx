import { fetchFamilies } from "@/api";
import { FamilyMember } from "@/components/individual/FamilyMember";
import { H2 } from "@/components/typography/h2";
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
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChangeEvent, useState } from "react";

const ITEMS_PER_PAGE = 10;

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

  const totalPages = data?.total ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;
  const pagination = usePagination(page, totalPages);

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Husband</TableHead>
            <TableHead className="w-1/4">Wife</TableHead>
            <TableHead>Children</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((family) => (
            <TableRow key={family.id}>
              <TableCell>
                {family.husband && <FamilyMember individual={family.husband} />}
              </TableCell>
              <TableCell>
                {family.wife && <FamilyMember individual={family.wife} />}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {family.children.map((child) => (
                    <FamilyMember
                      key={child.individual.id}
                      individual={child.individual}
                    />
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="secondary" size="sm" asChild>
                  <Link
                    to="/families/$familyId"
                    params={{ familyId: family.id }}
                  >
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

export default FamiliesPage;
