import { EventsTable } from "@/components/events";
import { PageCard } from "@/components/PageCard";
import { Calendar } from "lucide-react";

type PlaceEventsProps = {
  placeId: string;
};

export function PlaceEvents({ placeId }: PlaceEventsProps) {
  return (
    <PageCard title="Events" icon={Calendar} actionLabel="Add event">
      <EventsTable
        filters={{ placeId }}
        hideColumns={["place"]}
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
