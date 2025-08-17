import { fetchEventRoles } from "@/api/events/fetchEventRoles";
import { fetchEventTypes } from "@/api/events/fetchEventTypes";
import { fetchIndividuals } from "@/api/individuals/fetchIndividuals";
import { getPlaces } from "@/api/places/getPlaces";
import { useTree } from "@/hooks/use-tree";
import displayName from "@/utils/displayName";
import {
  Button,
  Checkbox,
  Group,
  Select,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export interface EventSubjectData {
  individualId: string;
}

export interface EventParticipantData {
  individualId: string;
  roleId: string;
}

export interface EventFormData {
  id?: string;
  typeId: string;
  date: string;
  placeId: string;
  description: string;
  subjects: EventSubjectData[];
  participants: EventParticipantData[];
}

interface EventFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<EventFormData>;
  preselectedIndividualId?: string;
  preselectedPlaceId?: string;
  onSubmit: (values: EventFormData) => Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

export function EventForm({
  mode,
  initialValues,
  preselectedIndividualId,
  preselectedPlaceId,
  onSubmit,
  onCancel,
  isPending = false,
}: EventFormProps) {
  const { currentTreeId } = useTree();
  const [createAnother, setCreateAnother] = useState(false);

  // Fetch event types
  const eventTypes = useQuery({
    queryKey: ["eventTypes", currentTreeId],
    queryFn: () => fetchEventTypes(currentTreeId ?? ""),
    enabled: Boolean(currentTreeId),
  });

  // Fetch event roles
  const eventRoles = useQuery({
    queryKey: ["eventRoles", currentTreeId],
    queryFn: () => fetchEventRoles(currentTreeId ?? ""),
    enabled: Boolean(currentTreeId),
  });

  // Fetch individuals for selection
  const individuals = useQuery({
    queryKey: ["individuals", currentTreeId],
    queryFn: () => fetchIndividuals(currentTreeId ?? "", {}),
    enabled: Boolean(currentTreeId),
  });

  // Fetch places for selection
  const places = useQuery({
    queryKey: ["places", currentTreeId],
    queryFn: () => getPlaces(currentTreeId ?? ""),
    enabled: Boolean(currentTreeId),
  });

  // Get the preselected individual's gender for proper placement in marriage events
  const preselectedIndividual = individuals.data?.find(
    (individual) => individual.id === preselectedIndividualId,
  );
  const preselectedGender = preselectedIndividual?.gender;

  const form = useForm({
    mode: "controlled",
    initialValues: {
      typeId: "",
      date: "",
      placeId: preselectedPlaceId || "",
      description: "",
      subjects: [{ individualId: preselectedIndividualId || "" }],
      participants: [],
      ...initialValues,
    },
    validate: {
      typeId: (value) => (!value ? "Event type is required" : null),
    },

    onValuesChange(values, previous) {
      if (values.typeId !== previous.typeId) {
        const isMarriageEvent =
          eventTypes.data?.find((type) => type.id === values.typeId)?.key ===
          "marriage";

        if (isMarriageEvent) {
          // For marriage events, place the preselected individual in the correct field based on gender
          if (preselectedIndividualId && preselectedGender) {
            if (preselectedGender === "male") {
              form.setFieldValue("subjects", [
                { individualId: preselectedIndividualId },
                { individualId: "" },
              ]);
            } else {
              form.setFieldValue("subjects", [
                { individualId: "" },
                { individualId: preselectedIndividualId },
              ]);
            }
          } else {
            form.setFieldValue("subjects", [
              { individualId: "" },
              { individualId: "" },
            ]);
          }
        } else {
          form.setFieldValue("subjects", [
            { individualId: preselectedIndividualId || "" },
          ]);
        }
      }
    },
  });

  // Get the selected event type to determine if it's a marriage event
  const selectedEventType = eventTypes.data?.find(
    (type) => type.id === form.values.typeId,
  );
  const isMarriageEvent = selectedEventType?.key === "marriage";

  const handleSubmit = async (values: typeof form.values) => {
    await onSubmit(values);

    // Reset form if creating another event
    if (mode === "create" && createAnother) {
      form.setValues({
        typeId: "",
        date: "",
        placeId: "",
        description: "",
        subjects: [],
        participants: [],
      });
    }
  };

  const addParticipant = () => {
    form.insertListItem("participants", {
      individualId: "",
      roleId: "",
    });
  };

  const removeParticipant = (index: number) => {
    form.removeListItem("participants", index);
  };

  const getIndividualOptions = (
    gender?: "male" | "female",
    excludeSubjectIds?: string[],
    forSubjects = false,
  ) => {
    const data = (() => {
      let filtered = individuals.data;

      // Filter by gender if specified
      if (gender) {
        filtered = filtered?.filter(
          (individual) => individual.gender === gender,
        );
      }

      // Filter out individuals who are already subjects
      if (excludeSubjectIds && excludeSubjectIds.length > 0) {
        filtered = filtered?.filter(
          (individual) => !excludeSubjectIds.includes(individual.id),
        );
      }

      // Filter out preselected individual from participants, but not from subjects
      if (preselectedIndividualId && !forSubjects) {
        filtered = filtered?.filter(
          (individual) => individual.id !== preselectedIndividualId,
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

  const getRoleOptions = (selectedIndividualId?: string) => {
    // Get the selected individual's gender
    const selectedIndividual = individuals.data?.find(
      (individual) => individual.id === selectedIndividualId,
    );
    const selectedGender = selectedIndividual?.gender;

    return (
      eventRoles.data
        ?.filter((role) => {
          // Always filter out subject-related roles (these are handled in subjects section)
          if (
            role.key === "subject" ||
            role.key === "husband" ||
            role.key === "wife"
          )
            return false;

          // For system roles, filter based on gender
          if (role.is_system && selectedGender) {
            const maleOnlyRoles = [
              "father",
              "godfather",
              "father_of_husband",
              "father_of_wife",
            ];
            const femaleOnlyRoles = [
              "mother",
              "godmother",
              "mother_of_husband",
              "mother_of_wife",
            ];

            if (
              selectedGender === "male" &&
              femaleOnlyRoles.includes(role.key || "")
            ) {
              return false;
            }
            if (
              selectedGender === "female" &&
              maleOnlyRoles.includes(role.key || "")
            ) {
              return false;
            }
          }

          return true;
        })
        .map((role) => ({
          value: role.id,
          label: role.name,
        })) ?? []
    );
  };

  const getPlaceOptions = () => {
    return (
      places.data?.map((place) => ({
        value: place.id,
        label: place.name,
      })) ?? []
    );
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: "100%" }}>
      <Stack gap="xl" w="100%">
        <Select
          size="md"
          label="Event Type"
          placeholder={
            eventTypes.isLoading
              ? "Loading event types..."
              : "Select event type"
          }
          data={
            eventTypes.data?.map((type) => ({
              value: type.id,
              label: type.name,
            })) ?? []
          }
          {...form.getInputProps("typeId")}
          required
          searchable
          maw="15rem"
          checkIconPosition="right"
        />

        <TextInput
          label="Date"
          placeholder="e.g., 15 Mar 1985"
          {...form.getInputProps("date")}
          size="md"
          maw="15rem"
        />

        <Select
          clearable
          label="Place"
          data={getPlaceOptions()}
          placeholder={places.isLoading ? "Loading places..." : "Select place"}
          {...form.getInputProps("placeId")}
          size="md"
          maw="30rem"
          checkIconPosition="right"
          disabled={Boolean(preselectedPlaceId)}
        />

        <Textarea
          label="Description"
          placeholder="Additional details about the event"
          {...form.getInputProps("description")}
          rows={3}
          size="md"
          maw={800}
        />

        {isMarriageEvent && (
          <Group w="100%" grow>
            <Select
              label="Husband"
              data={getIndividualOptions("male", undefined, true)}
              {...form.getInputProps("subjects.0.individualId")}
              required
              searchable
              size="md"
              maw="30rem"
              selectFirstOptionOnChange
              checkIconPosition="right"
              disabled={
                preselectedIndividualId ===
                  form.values.subjects[0]?.individualId &&
                preselectedGender === "male"
              }
            />
            <Select
              label="Wife"
              data={getIndividualOptions("female", undefined, true)}
              {...form.getInputProps("subjects.1.individualId")}
              required
              searchable
              size="md"
              maw="30rem"
              selectFirstOptionOnChange
              checkIconPosition="right"
              disabled={
                preselectedIndividualId ===
                  form.values.subjects[1]?.individualId &&
                preselectedGender === "female"
              }
            />
          </Group>
        )}

        {!isMarriageEvent && (
          <Group w="100%" grow>
            <Select
              label="Subject"
              placeholder={
                individuals.isLoading
                  ? "Loading individuals..."
                  : "Select individual"
              }
              data={getIndividualOptions(undefined, undefined, true)}
              {...form.getInputProps("subjects.0.individualId")}
              searchable
              size="md"
              maw="30rem"
              selectFirstOptionOnChange
              checkIconPosition="right"
              disabled={
                preselectedIndividualId ===
                form.values.subjects[0]?.individualId
              }
            />
          </Group>
        )}

        <Stack gap="sm">
          {form.values.participants.map((individual, index) => (
            <Group
              w="100%"
              grow
              key={`${individual.individualId}-${index}`}
              align="flex-end"
            >
              <Select
                label={index === 0 ? "Participant" : undefined}
                placeholder={
                  individuals.isLoading
                    ? "Loading individuals..."
                    : "Select individual"
                }
                data={getIndividualOptions(
                  undefined,
                  form.values.subjects
                    .map((s) => s.individualId)
                    .filter(Boolean),
                )}
                {...form.getInputProps(`participants.${index}.individualId`)}
                searchable
                size="md"
                maw="30rem"
                selectFirstOptionOnChange
                checkIconPosition="right"
              />
              <Select
                size="md"
                label={index === 0 ? "Role" : undefined}
                placeholder={
                  eventRoles.isLoading ? "Loading roles..." : "Select role"
                }
                data={getRoleOptions(individual.individualId)}
                {...form.getInputProps(`participants.${index}.roleId`)}
                searchable
                maw="20rem"
                checkIconPosition="right"
              />
              <Group>
                <Button
                  variant="subtle"
                  size="md"
                  color="red"
                  onClick={() => removeParticipant(index)}
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
              onClick={addParticipant}
            >
              Add Participant
            </Button>
          </Group>
        </Stack>

        {/* Form Actions */}
        <Group justify="flex-start" mt="md" align="center">
          <Button type="submit" loading={isPending} disabled={isPending}>
            {mode === "create" ? "Create Event" : "Update Event"}
          </Button>
          <Button variant="light" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          {mode === "create" && (
            <Checkbox
              label="Create another event after saving"
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
