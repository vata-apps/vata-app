import type { Database } from "@/database.types";
import {
  Button,
  Checkbox,
  Grid,
  Group,
  Radio,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";

export interface IndividualNameData {
  id?: string;
  firstName: string;
  lastName: string;
  surname: string;
  type: Database["public"]["Enums"]["name_type"];
}

export interface IndividualFormData {
  id?: string;
  gender: Database["public"]["Enums"]["gender"];
  names: IndividualNameData[];
}

interface IndividualFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<IndividualFormData>;
  onSubmit: (values: IndividualFormData) => Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

/**
 * Converts the name_type enum values to the format expected by Mantine Select
 */
function getNameTypeOptions(): Array<{ value: string; label: string }> {
  const nameTypeLabels: Record<
    Database["public"]["Enums"]["name_type"],
    string
  > = {
    birth: "Birth Name",
    marriage: "Married Name",
    nickname: "Nickname",
    unknown: "Other Name",
  };

  return Object.entries(nameTypeLabels).map(([value, label]) => ({
    value,
    label,
  }));
}

export function IndividualForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isPending = false,
}: IndividualFormProps) {
  const [createAnother, setCreateAnother] = useState(false);

  const form = useForm({
    mode: "controlled",
    initialValues: {
      gender: initialValues?.gender || ("male" as const),
      names: initialValues?.names?.length
        ? initialValues.names.slice(0, 1) // Only keep the first name
        : [
            {
              firstName: "",
              lastName: "",
              surname: "",
              type: "birth" as const,
            },
          ],
    },
    validate: {
      gender: (value) => (!value ? "Gender is required" : null),
      names: {
        firstName: (value) => (!value.trim() ? "First name is required" : null),
        lastName: (value) => (!value.trim() ? "Last name is required" : null),
        type: (value) => (!value ? "Name type is required" : null),
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await onSubmit(values);

    // Reset form if creating another individual
    if (mode === "create" && createAnother) {
      form.setValues({
        gender: "male",
        names: [
          {
            firstName: "",
            lastName: "",
            surname: "",
            type: "birth",
          },
        ],
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="xl" maw={800}>
        {/* Gender Selection */}
        <Radio.Group label="Gender" {...form.getInputProps("gender")} required>
          <Group mt="xs">
            <Radio value="male" label="Male" />
            <Radio value="female" label="Female" />
          </Group>
        </Radio.Group>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="First Name"
              placeholder="First name"
              {...form.getInputProps(`names.0.firstName`)}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Last Name"
              placeholder="Last name"
              {...form.getInputProps(`names.0.lastName`)}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Surname"
              placeholder="Surname (optional)"
              {...form.getInputProps(`names.0.surname`)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Name Type"
              placeholder="Select name type"
              data={getNameTypeOptions()}
              {...form.getInputProps(`names.0.type`)}
              required
              checkIconPosition="right"
            />
          </Grid.Col>
        </Grid>

        {/* Form Actions */}
        <Group justify="flex-start" mt="md" align="center">
          <Button type="submit" loading={isPending} disabled={isPending}>
            {mode === "create" ? "Create Individual" : "Update Individual"}
          </Button>
          <Button variant="light" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          {mode === "create" && (
            <Checkbox
              label="Create another individual after saving"
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
