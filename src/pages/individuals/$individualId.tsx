import { GenderIcon } from "@/components/GenderIcon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { Baby, CalendarDays, MapPin } from "lucide-react";

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
                  <span>Born on January 1, 1900</span>
                  <MapPin className="h-4 w-4 ml-2" />
                  <span>Paris, France</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>Died on December 31, 1980</span>
                  <MapPin className="h-4 w-4 ml-2" />
                  <span>New York, United States</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Baby className="h-4 w-4" />
                  <span>3 children</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="names" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="names">Names</TabsTrigger>
          <TabsTrigger value="family">Family Relationships</TabsTrigger>
        </TabsList>

        {/* Names Tab */}
        <TabsContent value="names" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Names</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Surname</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">John William</TableCell>
                    <TableCell>
                      <Badge variant="outline">Birth</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Primary</Badge>
                    </TableCell>
                    <TableCell>Doe</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Johnny</TableCell>
                    <TableCell>
                      <Badge variant="outline">Nickname</Badge>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Family Relationships Tab */}
        <TabsContent value="family" className="space-y-4">
          {/* As Spouse Card */}
          <Card>
            <CardHeader>
              <CardTitle>Spouse Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Jane Smith</div>
                    <div className="text-sm text-muted-foreground">Wife</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* As Child Card */}
          <Card>
            <CardHeader>
              <CardTitle>Parents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>RD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Robert Doe</div>
                    <div className="text-sm text-muted-foreground">Father</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>MD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Mary Doe</div>
                    <div className="text-sm text-muted-foreground">Mother</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default IndividualPage;
