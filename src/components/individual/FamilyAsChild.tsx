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

/**
 * Displays the family information where the individual is a child
 */
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Family as Child</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Father</TableHead>
                <TableHead className="w-[250px]">Mother</TableHead>
                <TableHead>Siblings</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="min-h-[4rem]">
                <TableCell className="align-top py-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      to="/individuals"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Add father
                    </Link>
                  </Button>
                </TableCell>
                <TableCell className="align-top py-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      to="/individuals"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Add mother
                    </Link>
                  </Button>
                </TableCell>
                <TableCell className="align-top py-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      to="/individuals"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Add sibling
                    </Link>
                  </Button>
                </TableCell>
                <TableCell className="text-right py-4">&nbsp;</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Family as Child</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Father</TableHead>
              <TableHead className="w-[250px]">Mother</TableHead>
              <TableHead>Siblings</TableHead>
              <TableHead className="w-[100px]"></TableHead>
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
                  <Button variant="ghost" size="sm" asChild>
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
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      to="/individuals"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Add mother
                    </Link>
                  </Button>
                )}
              </TableCell>
              <TableCell
                className={`${family.children.filter((child) => child.individual.id !== individualId).length > 0 ? "py-4 align-top" : ""}`}
              >
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
                  {family.children.filter(
                    (child) => child.individual.id !== individualId,
                  ).length === 0 && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to="/individuals"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Add sibling
                      </Link>
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to="/families/$familyId"
                    params={{ familyId: family.id }}
                  >
                    Edit
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
