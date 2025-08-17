import { getPlace } from "@/api/places/getPlace";
import {
  ErrorState,
  LoadingState,
  PageHeader,
  PlaceForm,
  type PlaceFormData,
} from "@/components";
import { updatePlace } from "@/db";
import { useTree } from "@/hooks/use-tree";
import { Container, Stack } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  // Fetch the current place data
  const {
    data: place,
    status,
    error,
  } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => getPlace(currentTreeId ?? "", placeId),
    enabled: Boolean(currentTreeId && placeId),
  });

  const updatePlaceMutation = useMutation({
    mutationFn: async (data: PlaceFormData) => {
      return updatePlace({
        placeId,
        name: data.name,
        typeId: data.placeTypeId,
        parentId: data.parentPlaceId || undefined,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
      });
    },
    onSuccess: async (_, variables) => {
      showNotification({
        title: "Success",
        message: `Place "${variables.name}" updated successfully`,
        color: "green",
      });

      // Invalidate all related queries that could be affected by the place update
      queryClient.invalidateQueries({ queryKey: ["placeForPage", placeId] });
      queryClient.invalidateQueries({ queryKey: ["place", placeId] });
      queryClient.invalidateQueries({ queryKey: ["places", currentTreeId] });

      navigate({ to: `/places/${placeId}` });
    },
    onError: (error) => {
      const errorMessage = (() => {
        if (error instanceof Error) return error.message;
        return "An unknown error occurred";
      })();

      showNotification({
        title: "Error",
        message: `Failed to update place: ${errorMessage}`,
        color: "red",
      });
    },
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
    id: place.id,
    name: place.name,
    placeTypeId: place.placeType.id,
    parentPlaceId: place.parentId || "",
    latitude: place.latitude?.toString() || "",
    longitude: place.longitude?.toString() || "",
  };

  const handleSubmit = async (values: PlaceFormData) => {
    await updatePlaceMutation.mutateAsync(values);
  };

  const handleCancel = () => {
    navigate({ to: `/places/${placeId}` });
  };

  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader title={`Edit Place: ${place.name}`} />
        <PlaceForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={updatePlaceMutation.isPending}
        />
      </Stack>
    </Container>
  );
}
