import { fetchFamiliesAsSpouse } from "@/api/fetchFamiliesAsSpouse";
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

interface FamilyAsSpouseProps {
  individualId: string;
}

export function FamilyAsSpouse({ individualId }: FamilyAsSpouseProps) {
  const { data: families, isLoading } = useQuery({
    queryKey: ["families-as-spouse", individualId],
    queryFn: () => fetchFamiliesAsSpouse(individualId),
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Families as Spouse</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  if (!families || families.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Families as Spouse</CardTitle>
          <Button variant="secondary" size="sm" asChild>
            <Link to="/families">Add Family</Link>
          </Button>
        </CardHeader>
        <CardContent>No families found</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Families as Spouse</CardTitle>
        <Button variant="secondary" size="sm" asChild>
          <Link to="/families">Add Family</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Spouse</TableHead>
              <TableHead>Children</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {families.map((family) => {
              const spouse =
                family.husband?.id === individualId
                  ? family.wife
                  : family.husband;

              return (
                <TableRow key={family.id} className="min-h-[4rem]">
                  <TableCell className="align-top py-4">
                    {spouse ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="h-6 p-0"
                        >
                          <Link
                            to="/individuals/$individualId"
                            params={{ individualId: spouse.id }}
                          >
                            {displayName(spouse.names)}
                          </Link>
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          (xxxx-xxxx)
                        </span>
                      </div>
                    ) : (
                      <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="h-6 p-0"
                      >
                        <Link
                          to="/individuals"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Add spouse
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="align-top py-4">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {family.children.map((child) => (
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
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
