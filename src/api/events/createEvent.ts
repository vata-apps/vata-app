import type { TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface CreateEventData {
  typeId: string;
  date: string;
  placeId: string;
  description: string;
  subjects: Array<{ individualId: string }>;
  participants: Array<{ individualId: string; roleId: string }>;
}

export async function createEvent(treeId: string, data: CreateEventData) {
  // First, create the main event
  const { data: newEvent, error: eventError } = await supabase
    .from("events")
    .insert({
      type_id: data.typeId,
      date: data.date && data.date.trim() !== "" ? data.date : null,
      place_id: data.placeId || null,
      description:
        data.description && data.description.trim() !== ""
          ? data.description
          : null,
      tree_id: treeId,
    })
    .select("id")
    .single();

  if (eventError) throw eventError;

  // Create event subjects
  const validSubjects = data.subjects.filter(
    (subject) => subject.individualId && subject.individualId.trim() !== "",
  );

  if (validSubjects.length > 0) {
    const { error: subjectsError } = await supabase
      .from("event_subjects")
      .insert(
        validSubjects.map((subject) => ({
          event_id: newEvent.id,
          individual_id: subject.individualId,
          tree_id: treeId,
        })),
      );

    if (subjectsError) throw subjectsError;
  }

  // Get the event type to determine if it's a marriage event
  const { data: eventType, error: eventTypeError } = await supabase
    .from("event_types")
    .select("key")
    .eq("id", data.typeId)
    .single();

  if (eventTypeError) throw eventTypeError;

  // Get role IDs for automatic participant creation
  const { data: roles, error: rolesError } = await supabase
    .from("event_roles")
    .select("id, key")
    .eq("tree_id", treeId)
    .in("key", ["subject", "husband", "wife"]);

  if (rolesError) throw rolesError;

  const subjectRole = roles.find((role) => role.key === "subject");
  const husbandRole = roles.find((role) => role.key === "husband");
  const wifeRole = roles.find((role) => role.key === "wife");

  if (!subjectRole) throw new Error("Subject role not found");

  // Create event participants based on event type
  const allParticipants = [];

  if (eventType.key === "marriage" && validSubjects.length === 2) {
    // For marriage events, we need to get the gender of both individuals
    const { data: individuals, error: individualsError } = await supabase
      .from("individuals")
      .select("id, gender")
      .in(
        "id",
        validSubjects.map((s) => s.individualId),
      )
      .eq("tree_id", treeId);

    if (individualsError) throw individualsError;

    // Assign husband/wife roles based on gender
    const husband = individuals.find((ind) => ind.gender === "male");
    const wife = individuals.find((ind) => ind.gender === "female");

    if (husband && husbandRole) {
      allParticipants.push({
        individualId: husband.id,
        roleId: husbandRole.id,
      });
    }

    if (wife && wifeRole) {
      allParticipants.push({
        individualId: wife.id,
        roleId: wifeRole.id,
      });
    }
  } else {
    // For non-marriage events, add subjects as participants with "subject" role
    allParticipants.push(
      ...validSubjects.map((subject) => ({
        individualId: subject.individualId,
        roleId: subjectRole.id,
      })),
    );
  }

  // Add manually specified participants
  allParticipants.push(...data.participants);

  const validParticipants = allParticipants.filter(
    (participant) =>
      participant.individualId &&
      participant.individualId.trim() !== "" &&
      participant.roleId &&
      participant.roleId.trim() !== "",
  );

  if (validParticipants.length > 0) {
    const participantsData: TablesInsert<"event_participants">[] =
      validParticipants.map((participant) => ({
        event_id: newEvent.id,
        individual_id: participant.individualId,
        role_id: participant.roleId,
        tree_id: treeId,
      }));

    const { error: participantsError } = await supabase
      .from("event_participants")
      .insert(participantsData);

    if (participantsError) throw participantsError;
  }

  return newEvent;
}

export type CreateEventResult = Awaited<ReturnType<typeof createEvent>>;
