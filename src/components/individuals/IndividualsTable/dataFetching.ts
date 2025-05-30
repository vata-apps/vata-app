import { fetchIndividuals } from "@/api";
import type { TableState } from "@/components/table-data/types";
import { supabase } from "@/lib/supabase";
import { IndividualSortField } from "@/types/sort";
import type { Individual, IndividualsTableProps } from "./types";
import { getFirstOrValue } from "./utils";

/**
 * Creates the fetch function for the IndividualsTable
 */
export function createFetchTableData(
  filters: IndividualsTableProps["filters"],
) {
  return async (state: TableState) => {
    const response = await fetchIndividuals({
      page: state.pagination.pageIndex + 1,
      query: state.globalFilter,
      sort: state.sorting
        ? {
            field: state.sorting.id as IndividualSortField,
            direction: state.sorting.desc ? "desc" : "asc",
          }
        : { field: "last_name", direction: "asc" },
      filters,
    });

    // Transform the data to handle Supabase's array returns for joined data
    let transformedData = response.data.map((individual: unknown) => {
      const ind = individual as Record<string, unknown>;
      return {
        ...ind,
        individual_events: ((ind.individual_events as unknown[]) || []).map(
          (event: unknown) => {
            const evt = event as Record<string, unknown>;
            return {
              ...evt,
              individual_event_types: getFirstOrValue(
                evt.individual_event_types as
                  | { id: string; name: string }
                  | { id: string; name: string }[],
              ),
              places: getFirstOrValue(
                evt.places as
                  | { id: string; name: string }
                  | { id: string; name: string }[]
                  | null,
              ),
            };
          },
        ),
      };
    }) as Individual[];

    let finalTotal = response.total ?? 0;

    // If filtering by event, add role information and update total
    if (filters?.event) {
      const { eventId, role } = filters.event;

      if (role === "subject") {
        // Get event participants who are also subjects (with roles)
        const { data: eventParticipants } = await supabase
          .from("event_participants")
          .select(
            `
            individual_id,
            event_roles!inner(name)
          `,
          )
          .eq("event_id", eventId)
          .in(
            "individual_id",
            response.data.map((ind: { id: string }) => ind.id),
          );

        // Also check which ones are subjects
        const { data: eventSubjects } = await supabase
          .from("event_subjects")
          .select("individual_id")
          .eq("event_id", eventId);

        const subjectIds = new Set(
          eventSubjects?.map(
            (es: { individual_id: string }) => es.individual_id,
          ) || [],
        );

        const roleMap = new Map(
          eventParticipants?.map((ep: unknown) => {
            const participant = ep as {
              individual_id: string;
              event_roles: { name: string };
            };
            return [participant.individual_id, participant.event_roles.name];
          }) || [],
        );

        // Only include those who are actually subjects
        transformedData = transformedData
          .filter((individual) => subjectIds.has(individual.id))
          .map((individual) => ({
            ...individual,
            role_name: roleMap.get(individual.id),
          }));

        // Update total to reflect filtered data
        finalTotal = transformedData.length;
      } else if (role === "participant") {
        // Get event participants who are NOT subjects
        const { data: eventParticipants } = await supabase
          .from("event_participants")
          .select(
            `
            individual_id,
            event_roles!inner(name)
          `,
          )
          .eq("event_id", eventId)
          .in(
            "individual_id",
            response.data.map((ind: { id: string }) => ind.id),
          );

        // Also check which ones are subjects
        const { data: eventSubjects } = await supabase
          .from("event_subjects")
          .select("individual_id")
          .eq("event_id", eventId);

        const subjectIds = new Set(
          eventSubjects?.map(
            (es: { individual_id: string }) => es.individual_id,
          ) || [],
        );

        const roleMap = new Map(
          eventParticipants?.map((ep: unknown) => {
            const participant = ep as {
              individual_id: string;
              event_roles: { name: string };
            };
            return [participant.individual_id, participant.event_roles.name];
          }) || [],
        );

        // Only include those who are NOT subjects
        transformedData = transformedData
          .filter((individual) => !subjectIds.has(individual.id))
          .map((individual) => ({
            ...individual,
            role_name: roleMap.get(individual.id),
          }));

        // Update total to reflect filtered data
        finalTotal = transformedData.length;
      }
    }

    return {
      data: transformedData,
      total: finalTotal,
    };
  };
}
