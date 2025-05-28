import { fetchEventsFiltered } from "@/api";
import { EventsTable } from "@/components/events";
import { PageCard } from "@/components/PageCard";
import type { TableState } from "@/components/table-data/types";
import type { EventSortField } from "@/types/sort";
import { Calendar } from "lucide-react";

type PlaceEventsProps = {
  placeId: string;
};

export function PlaceEvents({ placeId }: PlaceEventsProps) {
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
      placeId,
    });

    return {
      data: response.data,
      total: response.total,
    };
  };

  return (
    <PageCard title="Events" icon={Calendar} actionLabel="Add event">
      <EventsTable
        queryKey={["place-events", placeId]}
        fetchData={fetchTableData}
        showPlaceColumn={false}
        showToolbar={true}
        showAddButton={false}
        defaultSorting={{ id: "date", desc: true }}
        searchPlaceholder="Search events at this place"
        onDeleteEvent={() => {}}
        blankState={{
          icon: Calendar,
          title: "No events at this place",
        }}
      />
    </PageCard>
  );
}
