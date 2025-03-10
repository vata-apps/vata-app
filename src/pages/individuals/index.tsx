import { fetchIndividuals } from "@/api";
import { GenderIcon } from "@/components/GenderIcon";
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
import displayName from "@/utils/displayName";
import { usePagination } from "@/utils/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChangeEvent, useState } from "react";

const ITEMS_PER_PAGE = 10;

export const Route = createFileRoute("/individuals/")({
  component: IndividualsPage,
});

function IndividualsPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["individuals", page, query],
    queryFn: () => fetchIndividuals({ page, query }),
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead className="w-1/4">First Name</TableHead>
            <TableHead className="w-1/4">Last Name</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((individual) => (
            <TableRow key={individual.id}>
              <TableCell>
                <GenderIcon className="w-4 h-4" gender={individual.gender} />
              </TableCell>
              <TableCell>
                {displayName(individual.names, { part: "first" })}
              </TableCell>
              <TableCell>
                {displayName(individual.names, { part: "last" })}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="secondary" size="sm" asChild>
                  <Link
                    to="/individuals/$individualId"
                    params={{ individualId: individual.id }}
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

export default IndividualsPage;
