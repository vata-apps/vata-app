import { fetchIndividual } from "@/api/fetchIndividual";
import { FamilyAsChild } from "@/components/individual/FamilyAsChild";
import { FamilyAsSpouse } from "@/components/individual/FamilyAsSpouse";
import { IndividualHeader } from "@/components/individual/IndividualHeader";
import { Names } from "@/components/individual/Names";
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/individuals/$individualId")({
  component: IndividualPage,
});

function IndividualPage() {
  const { individualId } = Route.useParams();

  const {
    data: individual,
    status,
    error,
  } = useQuery({
    queryKey: ["individual", individualId],
    queryFn: () => fetchIndividual(individualId),
    placeholderData: keepPreviousData,
  });

  if (status === "pending") {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Loading...</CardHeader>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Error loading individual: {error.message}</CardHeader>
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

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header Section */}
      <IndividualHeader individual={individual} />

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
