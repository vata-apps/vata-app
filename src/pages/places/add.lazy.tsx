import { createPlace } from "@/api/places/createPlace";
import { PageHeader, PlaceForm, type PlaceFormData } from "@/components";
import { useTree } from "@/hooks/use-tree";
import { Container, Stack } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/places/add")({
  component: AddPlacePage,
});

function AddPlacePage() {
  const { currentTreeId } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createPlaceMutation = useMutation({
    mutationFn: (data: PlaceFormData) => {
      return createPlace(currentTreeId!, {
        name: data.name,
        typeId: data.placeTypeId,
        parentId: data.parentPlaceId || undefined,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate all related queries that could be affected by the place creation
      queryClient.invalidateQueries({ queryKey: ["places", currentTreeId] });

      showNotification({
        title: "Success",
        message: `Place "${variables.name}" created successfully`,
        color: "green",
      });

      navigate({ to: "/places" });
    },
    onError: (error) => {
      const errorMessage = (() => {
        if (error instanceof Error) return error.message;
        return "An unknown error occurred";
      })();

      showNotification({
        title: "Error",
        message: `Failed to create place: ${errorMessage}`,
        color: "red",
      });
    },
  });

  const handleSubmit = async (values: PlaceFormData) => {
    await createPlaceMutation.mutateAsync(values);
  };

  const handleCancel = () => {
    navigate({ to: "/places" });
  };

  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader title="Add Place" />
        <PlaceForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={createPlaceMutation.isPending}
        />
      </Stack>
    </Container>
  );
}
