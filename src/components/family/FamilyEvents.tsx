import { fetchEventsFiltered } from "@/api";
import { EventsTable } from "@/components/events";
import { PageCard } from "@/components/PageCard";
import type { TableState } from "@/components/table-data/types";
import type { EventSortField } from "@/types/sort";
import { Calendar } from "lucide-react";

type FamilyEventsProps = {
  familyId: string;
};

export function FamilyEvents({ familyId }: FamilyEventsProps) {
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
      <EventsTable
        queryKey={["family-events", familyId]}
        fetchData={fetchTableData}
        showPlaceColumn={true}
        showToolbar={true}
        showAddButton={false}
        defaultSorting={{ id: "date", desc: true }}
        searchPlaceholder="Search family events"
        onDeleteEvent={() => {}}
        blankState={{
          icon: Calendar,
          title: "No family events",
        }}
      />
    </PageCard>
  );
}

export default FamilyEvents;
