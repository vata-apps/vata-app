import { fetchFamilies } from "@/api";
import { FamilyMember } from "@/components/individual/FamilyMember";
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
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
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
            <TableHead className="w-1/3">Husband</TableHead>
            <TableHead className="w-1/3">Wife</TableHead>
            <TableHead className="w-1/3">Children</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((family) => (
            <TableRow key={family.id}>
              <TableCell className="align-top py-4">
                {family.husband ? (
                  <FamilyMember
                    individual={{
                      id: family.husband.id,
                      names: family.husband.names,
                      gender: family.husband.gender,
                    }}
                  />
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="align-top py-4">
                {family.wife ? (
                  <FamilyMember
                    individual={{
                      id: family.wife.id,
                      names: family.wife.names,
                      gender: family.wife.gender,
                    }}
                  />
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="align-top py-4">
                {family.children && family.children.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {family.children.map((child) => (
                      <FamilyMember
                        key={child.individual.id}
                        individual={{
                          id: child.individual.id,
                          names: child.individual.names,
                          gender: child.individual.gender,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  "-"
                )}
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

export default FamiliesPage;
