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
import { Link } from "@tanstack/react-router";

export function FamilyAsChild() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Family as Child</CardTitle>
        <Button variant="secondary" size="sm" asChild>
          <Link
            to="/families/$familyId"
            params={{ familyId: "example-origin" }}
          >
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
                <div className="flex items-center gap-2">
                  <Button variant="link" size="sm" asChild className="h-6 p-0">
                    <Link
                      to="/individuals/$individualId"
                      params={{ individualId: "rd-sr" }}
                    >
                      Robert Doe Sr.
                    </Link>
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    (1870-1940)
                  </span>
                </div>
              </TableCell>
              <TableCell className="align-top py-4">
                <Button variant="link" size="sm" asChild className="h-6 p-0">
                  <Link
                    to="/individuals"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Add mother
                  </Link>
                </Button>
              </TableCell>
              <TableCell className="align-top py-4">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="link"
                      size="sm"
                      asChild
                      className="h-6 p-0"
                    >
                      <Link
                        to="/individuals/$individualId"
                        params={{ individualId: "wd" }}
                      >
                        William Doe
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (1898-1960)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="link"
                      size="sm"
                      asChild
                      className="h-6 p-0"
                    >
                      <Link
                        to="/individuals/$individualId"
                        params={{ individualId: "ed" }}
                      >
                        Elizabeth Doe
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (1901-1985)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="link"
                      size="sm"
                      asChild
                      className="h-6 p-0"
                    >
                      <Link
                        to="/individuals/$individualId"
                        params={{ individualId: "rd" }}
                      >
                        Richard Doe
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (1903-1970)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="link"
                      size="sm"
                      asChild
                      className="h-6 p-0"
                    >
                      <Link
                        to="/individuals/$individualId"
                        params={{ individualId: "md" }}
                      >
                        Margaret Doe
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (1905-1990)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="link"
                      size="sm"
                      asChild
                      className="h-6 p-0"
                    >
                      <Link
                        to="/individuals/$individualId"
                        params={{ individualId: "cd" }}
                      >
                        Charles Doe
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (1907-1980)
                    </span>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
