import { fetchFamilyAsChild } from "@/api/fetchFamilyAsChild";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import displayName from "@/utils/displayName";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

interface FamilyAsChildProps {
  individualId: string;
}

export function FamilyAsChild({ individualId }: FamilyAsChildProps) {
  const { data: family, isLoading } = useQuery({
    queryKey: ["family-as-child", individualId],
    queryFn: () => fetchFamilyAsChild(individualId),
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Family as Child</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  if (!family) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Family as Child</CardTitle>
        </CardHeader>
        <CardContent>No family found</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Family as Child</CardTitle>
        <Button variant="secondary" size="sm" asChild>
          <Link to="/families/$familyId" params={{ familyId: family.id }}>
            Edit Family
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Father</TableHead>
              <TableHead className="w-[250px]">Mother</TableHead>
              <TableHead>Siblings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="min-h-[4rem]">
              <TableCell className="align-top py-4">
                {family.husband ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="link"
                      size="sm"
                      asChild
                      className="h-6 p-0"
                    >
                      <Link
                        to="/individuals/$individualId"
                        params={{ individualId: family.husband.id }}
                      >
                        {displayName(family.husband.names)}
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (xxxx-xxxx)
                    </span>
                  </div>
                ) : (
                  <Button variant="link" size="sm" asChild className="h-6 p-0">
                    <Link
                      to="/individuals"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Add father
                    </Link>
                  </Button>
                )}
              </TableCell>
              <TableCell className="align-top py-4">
                {family.wife ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="link"
                      size="sm"
                      asChild
                      className="h-6 p-0"
                    >
                      <Link
                        to="/individuals/$individualId"
                        params={{ individualId: family.wife.id }}
                      >
                        {displayName(family.wife.names)}
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (xxxx-xxxx)
                    </span>
                  </div>
                ) : (
                  <Button variant="link" size="sm" asChild className="h-6 p-0">
                    <Link
                      to="/individuals"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Add mother
                    </Link>
                  </Button>
                )}
              </TableCell>
              <TableCell className="align-top py-4">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {family.children
                    .filter((child) => child.individual.id !== individualId)
                    .map((child) => (
                      <div
                        key={child.individual.id}
                        className="flex items-center gap-2"
                      >
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="h-6 p-0"
                        >
                          <Link
                            to="/individuals/$individualId"
                            params={{ individualId: child.individual.id }}
                          >
                            {displayName(child.individual.names)}
                          </Link>
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          (xxxx-xxxx)
                        </span>
                      </div>
                    ))}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
