import { fetchFamily } from "@/api/fetchFamily";
import FamilyEvents from "@/components/family/FamilyEvents";
import FamilyHeader from "@/components/family/FamilyHeader";
import FamilyMembers from "@/components/family/FamilyMembers";
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/families/$familyId")({
  component: FamilyPage,
});

/**
 * Displays the family page with husband, wife, and children information
 */
function FamilyPage() {
  const { familyId } = Route.useParams();

  const {
    data: family,
    status,
    error,
  } = useQuery({
    queryKey: ["family", familyId],
    queryFn: () => fetchFamily(familyId),
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
          <CardHeader>Error loading family: {error.message}</CardHeader>
        </Card>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Family not found</CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header Section */}
      <FamilyHeader family={family} />

      {/* Tabs Section */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="members">Family Members</TabsTrigger>
          <TabsTrigger value="events">Family Events</TabsTrigger>
        </TabsList>

        {/* Family Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <FamilyMembers family={family} />
        </TabsContent>

        {/* Family Events Tab */}
        <TabsContent value="events">
          <FamilyEvents familyId={familyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FamilyPage;
