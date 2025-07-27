import { fetchPlace } from "@/api/places/fetchPlace";
import { ErrorState, LoadingState, PageHeader, PlaceForm } from "@/components";
import { useTree } from "@/hooks/use-tree";
import { Container, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  createLazyFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";

export const Route = createLazyFileRoute("/places/$placeId_/edit")({
  component: PlaceEditPage,
});

function PlaceEditPage() {
  const { placeId } = useParams({ from: "/places/$placeId_/edit" });
  const { currentTreeId } = useTree();
  const navigate = useNavigate();

  // Fetch the current place data
  const {
    data: place,
    status,
    error,
  } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => fetchPlace(currentTreeId ?? "", placeId),
    enabled: Boolean(currentTreeId && placeId),
  });

  if (status === "pending") {
    return <LoadingState message="Loading place details..." />;
  }

  if (status === "error") {
    return <ErrorState error={error} backTo="/places" />;
  }

  if (!place) {
    return <ErrorState error={new Error("Place not found")} backTo="/places" />;
  }

  // Transform place data to match PlaceForm format
  const initialValues = {
    name: place.name,
    placeTypeId: place.placeType.id,
    parentPlaceId: place.parentId || "",
    latitude: place.latitude?.toString() || "",
    longitude: place.longitude?.toString() || "",
  };

  const handleCancel = () => {
    navigate({ to: `/places/${placeId}` });
  };

  const handleSuccess = () => {
    navigate({ to: `/places/${placeId}` });
  };

  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader title={`Edit Place: ${place.name}`} />
        <PlaceForm
          mode="edit"
          placeId={placeId}
          initialValues={initialValues}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Stack>
    </Container>
  );
}
