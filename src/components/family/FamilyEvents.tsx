import { EventsTable } from "@/components/events";
import { PageCard } from "@/components/PageCard";
import { Calendar } from "lucide-react";

type FamilyEventsProps = {
  familyId: string;
};

export function FamilyEvents({ familyId }: FamilyEventsProps) {
  return (
    <PageCard title="Family Events" icon={Calendar} actionLabel="Add event">
      <EventsTable
        filters={{ familyId }}
        hideColumns={["place"]}
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
