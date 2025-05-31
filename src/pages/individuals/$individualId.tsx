import { fetchIndividual } from "@/api/fetchIndividual";
import { ErrorState, LoadingState, NotFoundState } from "@/components";
import { FamilyAsChild } from "@/components/individual/FamilyAsChild";
import { FamilyAsSpouse } from "@/components/individual/FamilyAsSpouse";
import { IndividualHeader } from "@/components/individual/IndividualHeader";
import { Names } from "@/components/individual/Names";
import displayName from "@/utils/displayName";
import { Anchor, Breadcrumbs, Container, Stack, Text } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/individuals/$individualId")({
  component: IndividualDetailPage,
});

/**
 * Displays the individual page with details, family relationships, and names
 */
function IndividualDetailPage() {
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
    return <LoadingState message="Loading individual details..." />;
  }

  if (status === "error") {
    return (
      <ErrorState
        error={error}
        title="Something went wrong"
        backTo="/individuals"
        backLabel="← Back to individuals"
      />
    );
  }

  if (!individual) {
    return (
      <NotFoundState
        title="Individual Not Found"
        description="This individual doesn't exist or may have been removed."
        backTo="/individuals"
        backLabel="← Back to individuals"
      />
    );
  }

  return (
    <Container fluid py="md">
      <Stack gap="xl">
        <Breadcrumbs>
          <Anchor component={Link} to="/individuals">
            Individuals
          </Anchor>
          <Text c="dimmed">
            {displayName(individual.names) || "Unknown Individual"}
          </Text>
        </Breadcrumbs>

        <IndividualHeader individual={individual} />

        <FamilyAsChild individualId={individualId} />

        <FamilyAsSpouse individualId={individualId} />

        <Names individualId={individualId} />
      </Stack>
    </Container>
  );
}

export default IndividualDetailPage;
