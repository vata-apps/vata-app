import { fetchPlaceTypes } from "@/api/places/fetchPlaceTypes";
import { fetchPlaces } from "@/api/places/fetchPlaces";
import { useTree } from "@/hooks/use-tree";
import {
  Button,
  Checkbox,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export interface PlaceFormData {
  id?: string;
  name: string;
  placeTypeId: string;
  parentPlaceId: string;
  latitude: string;
  longitude: string;
}

interface PlaceFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<PlaceFormData>;
  onSubmit: (values: PlaceFormData) => Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

export function PlaceForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isPending = false,
}: PlaceFormProps) {
  const { currentTreeId } = useTree();
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

  const form = useForm({
    mode: "controlled",
    initialValues: {
      name: "",
      placeTypeId: "",
      parentPlaceId: "",
      latitude: "",
      longitude: "",
      ...initialValues,
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
    await onSubmit(values);

    // Reset form if creating another place
    if (mode === "create" && createAnother) {
      form.setValues({
        name: "",
        placeTypeId: "",
        parentPlaceId: "",
        latitude: "",
        longitude: "",
      });
    }
  };

  return (
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
                // Skip the current place if editing to prevent circular references
                if (mode === "edit" && initialValues?.id === place.id) {
                  return acc;
                }

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
          <Button type="submit" loading={isPending} disabled={isPending}>
            {mode === "create" ? "Create Place" : "Update Place"}
          </Button>
          <Button variant="light" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          {mode === "create" && (
            <Checkbox
              label="Create another place after saving"
              checked={createAnother}
              onChange={(event) =>
                setCreateAnother(event.currentTarget.checked)
              }
              disabled={isPending}
            />
          )}
        </Group>
      </Stack>
    </form>
  );
}
