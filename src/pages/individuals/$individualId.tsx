import { fetchIndividual } from "@/api/fetchIndividual";
import { GenderIcon } from "@/components/GenderIcon";
import { FamilyAsChild } from "@/components/individual/FamilyAsChild";
import { FamilyAsSpouse } from "@/components/individual/FamilyAsSpouse";
import { Names } from "@/components/individual/Names";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import displayName from "@/utils/displayName";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";

export const Route = createFileRoute("/individuals/$individualId")({
  component: IndividualPage,
});

function IndividualPage() {
  const { individualId } = Route.useParams();

  const { data: individual, isLoading } = useQuery({
    queryKey: ["individual", individualId],
    queryFn: () => fetchIndividual(individualId),
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Loading...</CardHeader>
        </Card>
      </div>
    );
  }

  if (!individual) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Individual not found</CardHeader>
        </Card>
      </div>
    );
  }

  const names = individual.names || [];
  const displayedName = displayName(names);
  const initials = displayedName
    ? displayedName
        .split(" ")
        .map((n) => n?.[0] || "")
        .join("")
        .toUpperCase()
    : "??";

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">
                    {displayName(individual.names)}
                  </CardTitle>
                  <GenderIcon gender={individual.gender} className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <Button variant="ghost" size="sm" asChild className="h-6">
                    <Link
                      to="/individuals"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Add birth information
                    </Link>
                  </Button>
                  <span className="mx-2">•</span>
                  <Button variant="ghost" size="sm" asChild className="h-6">
                    <Link
                      to="/individuals"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Add death information
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GenderIcon gender="male" className="h-4 w-4" />
                  {individual.family_as_child[0]?.family?.husband ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="h-6 p-0"
                      >
                        <Link
                          to="/individuals/$individualId"
                          params={{
                            individualId:
                              individual.family_as_child[0].family.husband.id,
                          }}
                        >
                          {displayName(
                            individual.family_as_child[0].family.husband.names,
                          )}
                        </Link>
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        (xxxx-xxxx)
                      </span>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" asChild className="h-6">
                      <Link
                        to="/individuals"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Add father
                      </Link>
                    </Button>
                  )}
                  <span className="mx-2">•</span>
                  <GenderIcon gender="female" className="h-4 w-4" />
                  {individual.family_as_child[0]?.family?.wife ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="h-6 p-0"
                      >
                        <Link
                          to="/individuals/$individualId"
                          params={{
                            individualId:
                              individual.family_as_child[0].family.wife.id,
                          }}
                        >
                          {displayName(
                            individual.family_as_child[0].family.wife.names,
                          )}
                        </Link>
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        (xxxx-xxxx)
                      </span>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" asChild className="h-6">
                      <Link
                        to="/individuals"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Add mother
                      </Link>
                    </Button>
                  )}
                  <span className="mx-2">•</span>
                  <span>
                    {individual.family_as_child[0]?.family?.children.length
                      ? `${individual.family_as_child[0].family.children.length - 1} siblings`
                      : "No siblings"}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    {individual.families_as_spouse.reduce(
                      (acc, family) => acc + family.children.length,
                      0,
                    )}{" "}
                    children
                  </span>
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
          <FamilyAsChild individualId={individualId} />
          <FamilyAsSpouse individualId={individualId} />
        </TabsContent>

        {/* Names Tab */}
        <TabsContent value="names">
          <Names individualId={individualId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default IndividualPage;
