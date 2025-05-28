import { fetchEventsFiltered } from "@/api";
import { BlankState } from "@/components/BlankState";
import { EventsTable } from "@/components/events";
import { PageCard } from "@/components/PageCard";
import type { TableState } from "@/components/table-data/types";
import { supabase } from "@/lib/supabase";
import type { EventSortField } from "@/types/sort";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

type FamilyEventsProps = {
  familyId: string;
};

export function FamilyEvents({ familyId }: FamilyEventsProps) {
  const [familyName, setFamilyName] = useState("this family");
  const [hasEvents, setHasEvents] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchFamilyInfo = async () => {
      try {
        // Fetch family name (husband and wife names)
        const { data: familyData, error: familyError } = await supabase
          .from("family_sorting_view")
          .select(
            "husband_first_name, husband_last_name, wife_first_name, wife_last_name",
          )
          .eq("id", familyId)
          .single();

        if (familyError) {
          console.error("Error fetching family:", familyError);
        } else if (familyData) {
          const husbandName =
            familyData.husband_first_name && familyData.husband_last_name
              ? `${familyData.husband_first_name} ${familyData.husband_last_name}`
              : null;
          const wifeName =
            familyData.wife_first_name && familyData.wife_last_name
              ? `${familyData.wife_first_name} ${familyData.wife_last_name}`
              : null;

          if (husbandName && wifeName) {
            setFamilyName(`${husbandName} & ${wifeName} family`);
          } else if (husbandName) {
            setFamilyName(`${husbandName} family`);
          } else if (wifeName) {
            setFamilyName(`${wifeName} family`);
          }
        }

        // Check if there are any family-relevant events
        const { data: familyMembers, error: membersError } = await supabase
          .from("families")
          .select(
            `
            husband_id,
            wife_id,
            family_children(individual_id)
          `,
          )
          .eq("id", familyId)
          .single();

        if (membersError) {
          console.error("Error fetching family members:", membersError);
          setHasEvents(false);
          return;
        }

        // Collect all family member IDs for death events
        const allFamilyMemberIds: string[] = [];
        const spouseIds: string[] = [];
        if (familyMembers.husband_id) {
          spouseIds.push(familyMembers.husband_id);
          allFamilyMemberIds.push(familyMembers.husband_id);
        }
        if (familyMembers.wife_id) {
          spouseIds.push(familyMembers.wife_id);
          allFamilyMemberIds.push(familyMembers.wife_id);
        }

        const childrenIds: string[] = [];
        if (
          familyMembers.family_children &&
          familyMembers.family_children.length > 0
        ) {
          familyMembers.family_children.forEach(
            (child: { individual_id: string }) => {
              childrenIds.push(child.individual_id);
              allFamilyMemberIds.push(child.individual_id);
            },
          );
        }

        // Check for family events (marriage, divorce, etc.) involving the spouses
        let hasSpouseEvents = false;
        if (spouseIds.length > 0) {
          const { data: spouseEventsData, error: spouseEventsError } =
            await supabase
              .from("event_subjects")
              .select(
                `
              id,
              events!inner(
                event_types!inner(name)
              )
            `,
              )
              .in("individual_id", spouseIds)
              .in("events.event_types.name", [
                "marriage",
                "divorce",
                "engagement",
                "annulment",
                "separation",
              ])
              .limit(1);

          if (spouseEventsError) {
            console.error("Error checking spouse events:", spouseEventsError);
          } else {
            hasSpouseEvents = (spouseEventsData || []).length > 0;
          }
        }

        // Check for birth events of children
        let hasChildrenBirthEvents = false;
        if (childrenIds.length > 0) {
          const {
            data: childrenBirthEventsData,
            error: childrenBirthEventsError,
          } = await supabase
            .from("event_subjects")
            .select(
              `
              id,
              events!inner(
                event_types!inner(name)
              )
            `,
            )
            .in("individual_id", childrenIds)
            .eq("events.event_types.name", "birth")
            .limit(1);

          if (childrenBirthEventsError) {
            console.error(
              "Error checking children birth events:",
              childrenBirthEventsError,
            );
          } else {
            hasChildrenBirthEvents = (childrenBirthEventsData || []).length > 0;
          }
        }

        // Check for death events of all family members (spouses and children)
        let hasDeathEvents = false;
        if (allFamilyMemberIds.length > 0) {
          const { data: deathEventsData, error: deathEventsError } =
            await supabase
              .from("event_subjects")
              .select(
                `
              id,
              events!inner(
                event_types!inner(name)
              )
            `,
              )
              .in("individual_id", allFamilyMemberIds)
              .eq("events.event_types.name", "death")
              .limit(1);

          if (deathEventsError) {
            console.error("Error checking death events:", deathEventsError);
          } else {
            hasDeathEvents = (deathEventsData || []).length > 0;
          }
        }

        setHasEvents(
          hasSpouseEvents || hasChildrenBirthEvents || hasDeathEvents,
        );
      } catch (error) {
        console.error("Error fetching family info:", error);
        setHasEvents(false);
      }
    };

    fetchFamilyInfo();
  }, [familyId]);

  const fetchTableData = async (state: TableState) => {
    const response = await fetchEventsFiltered({
      page: state.pagination.pageIndex + 1,
      query: state.globalFilter,
      sort: state.sorting
        ? {
            field: state.sorting.id as EventSortField,
            direction: state.sorting.desc ? "desc" : "asc",
          }
        : { field: "date", direction: "desc" },
      familyId,
    });

    return {
      data: response.data,
      total: response.total,
    };
  };

  return (
    <PageCard title="Family Events" icon={Calendar} actionLabel="Add event">
      {(() => {
        if (hasEvents === null) {
          return <BlankState icon={Calendar} title="Loading events..." />;
        }

        if (hasEvents === false) {
          return (
            <BlankState
              icon={Calendar}
              title={`No family events for ${familyName}`}
            />
          );
        }

        return (
          <EventsTable
            queryKey={["family-events", familyId]}
            fetchData={fetchTableData}
            showPlaceColumn={true}
            showToolbar={true}
            showAddButton={false}
            defaultSorting={{ id: "date", desc: true }}
            searchPlaceholder="Search family events"
            onDeleteEvent={() => {}}
          />
        );
      })()}
    </PageCard>
  );
}

export default FamilyEvents;
