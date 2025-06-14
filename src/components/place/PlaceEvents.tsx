import { PageCard } from "@/components/PageCard";
import { Calendar } from "lucide-react";
import { TableEvents } from "../TableEvents/TableEvents";

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
