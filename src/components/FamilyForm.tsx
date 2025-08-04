import { fetchIndividuals } from "@/api/individuals/fetchIndividuals";
import type { Database } from "@/database.types";
import { useTree } from "@/hooks/use-tree";
import displayName from "@/utils/displayName";
import { Button, Checkbox, Group, Select, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export interface FamilyChildData {
  individualId: string;
}

export interface FamilyFormData {
  id?: string;
  husbandId: string;
  wifeId: string;
  type: Database["public"]["Enums"]["family_type"];
  children: FamilyChildData[];
}

interface FamilyFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<FamilyFormData>;
  onSubmit: (values: FamilyFormData) => Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

/**
 * Converts the family_type enum values to the format expected by Mantine Select
 */
function getFamilyTypeOptions(): Array<{ value: string; label: string }> {
  const familyTypeLabels: Record<
    Database["public"]["Enums"]["family_type"],
    string
  > = {
    married: "Married",
    "civil union": "Civil Union",
    unknown: "Unknown",
    unmarried: "Unmarried",
  };

  return Object.entries(familyTypeLabels).map(([value, label]) => ({
    value,
    label,
  }));
}

export function FamilyForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isPending = false,
}: FamilyFormProps) {
  const { currentTreeId } = useTree();
  const [createAnother, setCreateAnother] = useState(false);

  // Fetch individuals for selection
  const individuals = useQuery({
    queryKey: ["individuals", currentTreeId],
    queryFn: () => fetchIndividuals(currentTreeId ?? "", {}),
    enabled: Boolean(currentTreeId),
  });

  const form = useForm({
    mode: "controlled",
    initialValues: {
      husbandId: "",
      wifeId: "",
      type: "married" as const,
      children: [],
      ...initialValues,
    },
    validate: {
      husbandId: (value, values) => {
        if (!value && !values.wifeId) {
          return "At least one parent (husband or wife) is required";
        }
        return null;
      },
      wifeId: (value, values) => {
        if (!value && !values.husbandId) {
          return "At least one parent (husband or wife) is required";
        }
        return null;
      },
      type: (value) => (!value ? "Family type is required" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await onSubmit(values);

    // Reset form if creating another family
    if (mode === "create" && createAnother) {
      form.setValues({
        husbandId: "",
        wifeId: "",
        type: "married",
        children: [],
      });
    }
  };

  const addChild = () => {
    form.insertListItem("children", {
      individualId: "",
    });
  };

  const removeChild = (index: number) => {
    form.removeListItem("children", index);
  };

  const getIndividualOptions = (
    gender?: "male" | "female",
    excludeIds?: string[],
  ) => {
    const data = (() => {
      let filtered = individuals.data;

      // Filter by gender if specified
      if (gender) {
        filtered = filtered?.filter(
          (individual) => individual.gender === gender,
        );
      }

      // Filter out individuals who are already selected
      if (excludeIds && excludeIds.length > 0) {
        filtered = filtered?.filter(
          (individual) => !excludeIds.includes(individual.id),
        );
      }

      return filtered;
    })();

    return (
      data?.map((individual) => ({
        value: individual.id,
        label: `${displayName(individual)} (${individual.lifeSpan})`,
      })) ?? []
    );
  };

  const getChildOptions = () => {
    const selectedParentIds = [
      form.values.husbandId,
      form.values.wifeId,
    ].filter(Boolean);

    return getIndividualOptions(undefined, selectedParentIds);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: "100%" }}>
      <Stack gap="xl" w="100%">
        <Select
          size="md"
          label="Family Type"
          placeholder="Select family type"
          data={getFamilyTypeOptions()}
          {...form.getInputProps("type")}
          required
          searchable
          maw="15rem"
          checkIconPosition="right"
        />

        <Group w="100%" grow>
          <Select
            label="Husband"
            placeholder={
              individuals.isLoading
                ? "Loading individuals..."
                : "Select husband"
            }
            data={getIndividualOptions("male", [form.values.wifeId])}
            {...form.getInputProps("husbandId")}
            searchable
            size="md"
            maw="30rem"
            selectFirstOptionOnChange
            checkIconPosition="right"
            clearable
          />
          <Select
            label="Wife"
            placeholder={
              individuals.isLoading ? "Loading individuals..." : "Select wife"
            }
            data={getIndividualOptions("female", [form.values.husbandId])}
            {...form.getInputProps("wifeId")}
            searchable
            size="md"
            maw="30rem"
            selectFirstOptionOnChange
            checkIconPosition="right"
            clearable
          />
        </Group>

        <Stack gap="sm">
          {form.values.children.map((child, index) => (
            <Group
              w="100%"
              grow
              key={`${child.individualId}-${index}`}
              align="flex-end"
            >
              <Select
                label={index === 0 ? "Child" : undefined}
                placeholder={
                  individuals.isLoading
                    ? "Loading individuals..."
                    : "Select child"
                }
                data={getChildOptions()}
                {...form.getInputProps(`children.${index}.individualId`)}
                searchable
                size="md"
                maw="30rem"
                selectFirstOptionOnChange
                checkIconPosition="right"
              />
              <Group>
                <Button
                  variant="subtle"
                  size="md"
                  color="red"
                  onClick={() => removeChild(index)}
                >
                  <IconTrash size={16} />
                </Button>
              </Group>
            </Group>
          ))}
          <Group>
            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconPlus size={16} />}
              onClick={addChild}
            >
              Add Child
            </Button>
          </Group>
        </Stack>

        {/* Form Actions */}
        <Group justify="flex-start" mt="md" align="center">
          <Button type="submit" loading={isPending} disabled={isPending}>
            {mode === "create" ? "Create Family" : "Update Family"}
          </Button>
          <Button variant="light" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          {mode === "create" && (
            <Checkbox
              label="Create another family after saving"
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
