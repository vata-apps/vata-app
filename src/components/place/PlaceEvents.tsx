import { PageCard } from "@/components/PageCard";
import { TableEvents } from "@/components/tables/TableEvents";
import { Calendar } from "lucide-react";

type PlaceEventsProps = {
  placeId: string;
};

export function PlaceEvents({ placeId }: PlaceEventsProps) {
  return (
    <PageCard title="Events" icon={Calendar} actionLabel="Add event">
      <TableEvents hideColumns={["place"]} placeIds={[placeId]} />
    </PageCard>
  );
}
