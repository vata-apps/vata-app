import { fetchFamily } from "@/api/fetchFamily";
import FamilyEvents from "@/components/family/FamilyEvents";
import FamilyHeader from "@/components/family/FamilyHeader";
import FamilyMembers from "@/components/family/FamilyMembers";
import { Loader, Stack, Tabs, Text } from "@mantine/core";
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

  if (status === "pending") return <Loader />;

  if (status === "error") {
    return <Text>Error loading family: {error.message}</Text>;
  }

  if (!family) return <Text>Family not found</Text>;

  return (
    <Stack>
      {/* Header Section */}
      <FamilyHeader family={family} />

      {/* Tabs Section */}
      <Tabs defaultValue="members" mt="lg" variant="default">
        <Tabs.List className="w-full justify-start">
          <Tabs.Tab value="members">Family Members</Tabs.Tab>
          <Tabs.Tab value="events">Family Events</Tabs.Tab>
        </Tabs.List>

        {/* Family Members Tab */}
        <Tabs.Panel py="lg" value="members">
          <FamilyMembers family={family} />
        </Tabs.Panel>

        {/* Family Events Tab */}
        <Tabs.Panel py="lg" value="events">
          <FamilyEvents familyId={familyId} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

export default FamilyPage;
