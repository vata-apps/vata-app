import { fetchIndividual } from "@/api/fetchIndividual";
import { FamilyAsChild } from "@/components/individual/FamilyAsChild";
import { FamilyAsSpouse } from "@/components/individual/FamilyAsSpouse";
import { IndividualHeader } from "@/components/individual/IndividualHeader";
import { Names } from "@/components/individual/Names";
import { Loader, Stack, Tabs, Text } from "@mantine/core";
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

  if (status === "pending") return <Loader />;

  if (status === "error") {
    return <Text>Error loading individual: {error.message}</Text>;
  }

  return (
    <Stack>
      {/* Header Section */}
      <IndividualHeader individual={individual} />

      {/* Tabs Section */}
      <Tabs defaultValue="family" mt="lg" variant="default">
        <Tabs.List>
          <Tabs.Tab value="family">Family Relationships</Tabs.Tab>
          <Tabs.Tab value="names">Names</Tabs.Tab>
        </Tabs.List>

        {/* Family Relationships Tab */}
        <Tabs.Panel py="lg" value="family">
          <Stack gap="lg">
            <FamilyAsChild individualId={individualId} />
            <FamilyAsSpouse individualId={individualId} />
          </Stack>
        </Tabs.Panel>

        {/* Names Tab */}
        <Tabs.Panel py="lg" value="names">
          <Names individualId={individualId} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

export default IndividualPage;
