import { fetchIndividuals } from "@/api";
import { H2 } from "@/components/typography/h2";
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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MarsIcon,
  VenusIcon,
} from "lucide-react";
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
          {data?.data.map((individual) => {
            const primaryName = individual.names?.find(
              (name) => name.is_primary,
            );

            return (
              <TableRow key={individual.id}>
                <TableCell>
                  {individual.gender === "female" ? (
                    <VenusIcon className="w-4 h-4" />
                  ) : (
                    <MarsIcon className="w-4 h-4" />
                  )}
                </TableCell>
                <TableCell>{primaryName?.first_name || "N/A"}</TableCell>
                <TableCell>{primaryName?.last_name || "N/A"}</TableCell>
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
            );
          })}
        </TableBody>
      </Table>

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

export default IndividualsPage;
