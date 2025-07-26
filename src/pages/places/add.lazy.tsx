import { createPlace } from "@/api/places/createPlace";
import { fetchPlaceTypes } from "@/api/places/fetchPlaceTypes";
import { fetchPlaces } from "@/api/places/fetchPlaces";
import { PageHeader } from "@/components/PageHeader";
import { useTree } from "@/hooks/use-tree";
import {
  Button,
  Checkbox,
  Container,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createLazyFileRoute("/places/add")({
  component: AddPlacePage,
});

function AddPlacePage() {
  const { currentTreeId } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createAnother, setCreateAnother] = useState(false);

  // Fetch place types from the database
  const placeTypes = useQuery({
    queryKey: ["placeTypes", currentTreeId],
    queryFn: () => fetchPlaceTypes(currentTreeId ?? ""),
    enabled: Boolean(currentTreeId),
  });

  // Fetch places from the database for parent selection
  const places = useQuery({
    queryKey: ["places", currentTreeId],
    queryFn: () => fetchPlaces(currentTreeId ?? ""),
    enabled: Boolean(currentTreeId),
  });

  // Create place mutation
  const createPlaceMutation = useMutation({
    mutationFn: (data: {
      name: string;
      placeTypeId: string;
      parentPlaceId: string;
      latitude: string;
      longitude: string;
    }) => {
      return createPlace(currentTreeId!, {
        name: data.name,
        typeId: data.placeTypeId,
        parentId: data.parentPlaceId || undefined,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["places", currentTreeId] });

      showNotification({
        title: "Success",
        message: `Place "${variables.name}" created successfully`,
        color: "green",
      });

      if (createAnother) {
        form.setValues({
          name: "",
          placeTypeId: "",
          parentPlaceId: "",
          latitude: "",
          longitude: "",
        });
      } else {
        navigate({ to: "/places" });
      }
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

  const form = useForm({
    mode: "controlled",
    initialValues: {
      name: "",
      placeTypeId: "",
      parentPlaceId: "",
      latitude: "",
      longitude: "",
    },
    validate: {
      name: (value) => (!value.trim() ? "Name is required" : null),
      placeTypeId: (value) => (!value ? "Type is required" : null),
      latitude: (value) => {
        if (!value) return null;
        const num = Number(value);
        if (isNaN(num) || num < -90 || num > 90) {
          return "Latitude must be between -90 and 90";
        }
        return null;
      },
      longitude: (value) => {
        if (!value) return null;
        const num = Number(value);
        if (isNaN(num) || num < -180 || num > 180) {
          return "Longitude must be between -180 and 180";
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await createPlaceMutation.mutateAsync(values);
  };

  const handleCancel = () => {
    navigate({ to: "/places" });
  };

  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader title="Add Place" />

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md" maw={600} pos="relative">
            <TextInput
              label="Name"
              placeholder="Enter place name"
              {...form.getInputProps("name")}
              required
            />

            <Select
              label="Type"
              placeholder={
                placeTypes.isLoading
                  ? "Loading place types..."
                  : "Search and select place type"
              }
              data={[
                { value: "", label: "Select a type" },
                ...(placeTypes.data?.map((type) => ({
                  value: type.id,
                  label: type.name,
                })) ?? []),
              ]}
              {...form.getInputProps("placeTypeId")}
              required
              searchable
            />

            <Select
              label="Located in"
              placeholder={
                places.isLoading
                  ? "Loading places..."
                  : "Search and select parent place (optional)"
              }
              data={[
                { value: "", label: "Select a place" },
                ...(places.data?.reduce(
                  (acc, place) => {
                    // Add group for each place type
                    if (!acc.find((p) => p.group === place.placeType.name)) {
                      acc.push({
                        group: place.placeType.name,
                        items: [],
                      });
                    }

                    // Add place to the group
                    acc
                      .find((p) => p.group === place.placeType.name)!
                      .items.push({
                        value: place.id,
                        label: place.name,
                      });
                    return acc;
                  },
                  [] as {
                    group: string;
                    items: { value: string; label: string }[];
                  }[],
                ) ?? []),
              ]}
              {...form.getInputProps("parentPlaceId")}
              clearable
              searchable
            />

            <Group grow>
              <NumberInput
                label="Latitude"
                placeholder="e.g., 37.7749"
                {...form.getInputProps("latitude")}
                min={-90}
                max={90}
                decimalScale={6}
                allowNegative
              />

              <NumberInput
                label="Longitude"
                placeholder="e.g., -122.4194"
                {...form.getInputProps("longitude")}
                min={-180}
                max={180}
                decimalScale={6}
                allowNegative
              />
            </Group>

            <Group justify="flex-start" mt="md" align="center">
              <Button
                type="submit"
                loading={createPlaceMutation.isPending}
                disabled={createPlaceMutation.isPending}
              >
                Create Place
              </Button>
              <Button
                variant="light"
                onClick={handleCancel}
                disabled={createPlaceMutation.isPending}
              >
                Cancel
              </Button>
              <Checkbox
                label="Create another place after saving"
                checked={createAnother}
                onChange={(event) =>
                  setCreateAnother(event.currentTarget.checked)
                }
                disabled={createPlaceMutation.isPending}
              />
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}

export default AddPlacePage;
