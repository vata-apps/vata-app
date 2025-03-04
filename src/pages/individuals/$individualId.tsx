import { GenderIcon } from "@/components/GenderIcon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";

export const Route = createFileRoute("/individuals/$individualId")({
  component: IndividualPage,
});

function IndividualPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">John Doe</CardTitle>
                  <GenderIcon gender="male" className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>Born on January 1, 1900 in Paris, France</span>
                  <span className="mx-2">•</span>
                  <span>
                    Died on December 31, 1980 in New York, United States
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GenderIcon gender="male" className="h-4 w-4" />
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
                  <span className="mx-2">•</span>
                  <GenderIcon gender="female" className="h-4 w-4" />
                  <Button variant="ghost" size="sm" asChild className="h-6">
                    <Link
                      to="/individuals"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Add mother
                    </Link>
                  </Button>
                  <span className="mx-2">•</span>
                  <span>5 siblings</span>
                  <span className="mx-2">•</span>
                  <span>3 children</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="family" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="family">Family Relationships</TabsTrigger>
          <TabsTrigger value="names">Names</TabsTrigger>
        </TabsList>

        {/* Family Relationships Tab */}
        <TabsContent value="family" className="space-y-4">
          {/* Family where this person is a child */}
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
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="h-6 p-0"
                        >
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

          {/* Families where this person is a spouse */}
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
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="h-6 p-0"
                        >
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
                            (1932-)
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
                              params={{ individualId: "wd" }}
                            >
                              William Doe
                            </Link>
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            (1934-2005)
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
                              params={{ individualId: "sd" }}
                            >
                              Sarah Doe
                            </Link>
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            (1936-)
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
                            (1938-1995)
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
                              params={{ individualId: "ad" }}
                            >
                              Alice Doe
                            </Link>
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            (1940-2020)
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
                              params={{ individualId: "hd" }}
                            >
                              Henry Doe
                            </Link>
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            (1942-)
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
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="h-6 p-0"
                        >
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
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="h-6 p-0"
                        >
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
        </TabsContent>

        {/* Names Tab */}
        <TabsContent value="names" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Names</CardTitle>
              <Button variant="secondary" size="sm">
                Add Name
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Badge variant="secondary">Default</Badge>
                    </TableCell>
                    <TableCell className="font-medium">John William</TableCell>
                    <TableCell>Doe</TableCell>
                    <TableCell>
                      <Badge variant="outline">Birth</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell className="font-medium">Johnny</TableCell>
                    <TableCell></TableCell>
                    <TableCell>
                      <Badge variant="outline">Nickname</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default IndividualPage;
