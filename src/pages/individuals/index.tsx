import { H2 } from "@/components/typography/h2";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MarsIcon,
  VenusIcon,
} from "lucide-react";
import { useState } from "react";
import { useIndividualsWithNames } from "../../lib/hooks";

const ITEMS_PER_PAGE = 10;

export const Route = createFileRoute("/individuals/")({
  component: IndividualsPage,
});

function IndividualsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useIndividualsWithNames(page);

  if (isLoading) {
    return <div>Loading individuals...</div>;
  }

  if (error) {
    return <div>Error loading individuals: {error.message}</div>;
  }

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  return (
    <div className="space-y-8">
      <H2>Individuals</H2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
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
