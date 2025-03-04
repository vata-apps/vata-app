import { Badge } from "@/components/ui/badge";
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

export function FamilyAsSpouse() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Families as Spouse</CardTitle>
        <Button variant="secondary" size="sm">
          Add Family
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Spouse</TableHead>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead>Children</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Example Family 1 */}
            <TableRow className="min-h-[4rem]">
              <TableCell className="align-top py-4">
                <div className="flex items-center gap-2">
                  <Button variant="link" size="sm" asChild className="h-6 p-0">
                    <Link
                      to="/individuals/$individualId"
                      params={{ individualId: "js" }}
                    >
                      Jane Smith
                    </Link>
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    (1902-1980)
                  </span>
                </div>
              </TableCell>
              <TableCell className="align-top py-4">
                <Badge variant="secondary">Married</Badge>
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
                        params={{ individualId: "rd" }}
                      >
                        Robert Doe Jr.
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (1925-1990)
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
                        Mary Doe
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (1928-2015)
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
                        params={{ individualId: "jd" }}
                      >
                        James Doe
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (1930-2010)
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to="/families/$familyId"
                    params={{ familyId: "example1" }}
                  >
                    Edit
                  </Link>
                </Button>
              </TableCell>
            </TableRow>

            {/* Example Family 2 */}
            <TableRow className="min-h-[4rem]">
              <TableCell className="align-top py-4">
                <div className="flex items-center gap-2">
                  <Button variant="link" size="sm" asChild className="h-6 p-0">
                    <Link
                      to="/individuals/$individualId"
                      params={{ individualId: "sj" }}
                    >
                      Sarah Johnson
                    </Link>
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    (1910-1995)
                  </span>
                </div>
              </TableCell>
              <TableCell className="align-top py-4">
                <Badge variant="secondary">Civil union</Badge>
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
                        params={{ individualId: "td" }}
                      >
                        Thomas Doe
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (1953-)
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to="/families/$familyId"
                    params={{ familyId: "example2" }}
                  >
                    Edit
                  </Link>
                </Button>
              </TableCell>
            </TableRow>

            {/* Example Family 3 */}
            <TableRow className="min-h-[4rem]">
              <TableCell className="align-top py-4">
                <div className="flex items-center gap-2">
                  <Button variant="link" size="sm" asChild className="h-6 p-0">
                    <Link
                      to="/individuals/$individualId"
                      params={{ individualId: "md-2" }}
                    >
                      Margaret Davis
                    </Link>
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    (1915-2000)
                  </span>
                </div>
              </TableCell>
              <TableCell className="align-top py-4">
                <Badge variant="secondary">Married</Badge>
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
                        params={{ individualId: "pd" }}
                      >
                        Patricia Doe
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (1955-)
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
                        params={{ individualId: "dd" }}
                      >
                        David Doe
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (1957-2015)
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
                        Michael Doe
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (1960-)
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to="/families/$familyId"
                    params={{ familyId: "example3" }}
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
