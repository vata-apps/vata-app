import { GenderIcon } from "@/components/GenderIcon";
import { FamilyAsChild } from "@/components/individual/FamilyAsChild";
import { FamilyAsSpouse } from "@/components/individual/FamilyAsSpouse";
import { Names } from "@/components/individual/Names";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
          <FamilyAsChild />
          <FamilyAsSpouse />
        </TabsContent>

        {/* Names Tab */}
        <TabsContent value="names">
          <Names />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default IndividualPage;
