import { fetchFamily } from "@/api/fetchFamily";
import { ErrorState, LoadingState, NotFoundState } from "@/components";
import { FamilyChildren } from "@/components/family/FamilyChildren";
import { FamilyEvents } from "@/components/family/FamilyEvents";
import FamilyHeader from "@/components/family/FamilyHeader";
import { FamilyParents } from "@/components/family/FamilyParents";
import displayName from "@/utils/displayName";
import { Anchor, Breadcrumbs, Container, Stack, Text } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

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
    return <LoadingState message="Loading family details..." />;
  }

  if (status === "error") {
    return (
      <ErrorState
        error={error}
        title="Something went wrong"
        backTo="/families"
        backLabel="← Back to families"
      />
    );
  }

  if (!family) {
    return (
      <NotFoundState
        title="Family Not Found"
        description="This family doesn't exist or may have been removed."
        backTo="/families"
        backLabel="← Back to families"
      />
    );
  }

  const husbandName = family.husband
    ? displayName(family.husband.names)
    : "Unknown";
  const wifeName = family.wife ? displayName(family.wife.names) : "Unknown";
  const familyName = `${husbandName} & ${wifeName}`;

  return (
    <Container fluid py="md">
      <Stack gap="xl">
        <Breadcrumbs>
          <Anchor component={Link} to="/families">
            Families
          </Anchor>
          <Text c="dimmed">{familyName}</Text>
        </Breadcrumbs>

        <FamilyHeader family={family} />

        <FamilyParents family={family} />

        <FamilyChildren family={family} />

        <FamilyEvents family={family} />
      </Stack>
    </Container>
  );
}

export default FamilyPage;
