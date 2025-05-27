import { fetchEventsFiltered } from "@/api";
import { BlankState } from "@/components/BlankState";
import { EventsTable } from "@/components/events";
import { PageCard } from "@/components/PageCard";
import type { TableState } from "@/components/table-data/types";
import { supabase } from "@/lib/supabase";
import type { EventSortField } from "@/types/sort";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

type PlaceEventsProps = {
  placeId: string;
};

export function PlaceEvents({ placeId }: PlaceEventsProps) {
  const [placeName, setPlaceName] = useState("this place");
  const [hasEvents, setHasEvents] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchPlaceInfo = async () => {
      try {
        // Fetch place name
        const { data: placeData, error: placeError } = await supabase
          .from("places")
          .select("name")
          .eq("id", placeId)
          .single();

        if (placeError) {
          console.error("Error fetching place:", placeError);
        } else if (placeData) {
          setPlaceName(placeData.name);
        }

        // Check if there are any events for this place
        const { data: eventsData, error: eventsError } = await supabase
          .from("event_details")
          .select("id")
          .eq("place_id", placeId)
          .limit(1);

        if (eventsError) {
          console.error("Error checking events:", eventsError);
          setHasEvents(false);
        } else {
          setHasEvents((eventsData || []).length > 0);
        }
      } catch (error) {
        console.error("Error fetching place info:", error);
        setHasEvents(false);
      }
    };

    fetchPlaceInfo();
  }, [placeId]);

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
      {(() => {
        if (hasEvents === null) {
          return (
            <BlankState
              icon={Calendar}
              title="Loading..."
              description="Loading events..."
            />
          );
        }

        if (hasEvents === false) {
          return (
            <BlankState
              icon={Calendar}
              title="No Events"
              description={`No events found at ${placeName}.`}
            />
          );
        }

        return (
          <EventsTable
            queryKey={["place-events", placeId]}
            fetchData={fetchTableData}
            showPlaceColumn={false}
            showToolbar={true}
            showAddButton={false}
            defaultSorting={{ id: "date", desc: true }}
            searchPlaceholder="Search events at this place"
          />
        );
      })()}
    </PageCard>
  );
}
