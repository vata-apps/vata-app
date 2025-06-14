import { PageCard } from "@/components/PageCard";
import { FamilyWithRelations } from "@/types";
import { Calendar } from "lucide-react";
import { TableEvents } from "../tables/TableEvents";

interface FamilyEventsProps {
  readonly family: FamilyWithRelations;
}

export function FamilyEvents({ family }: FamilyEventsProps) {
  const childIds = family.children?.map((child) => child.individual.id) ?? [];
  const parentIds = [family.husband?.id, family.wife?.id].filter(
    Boolean,
  ) as string[];

  return (
    <PageCard title="Family Events" icon={Calendar} actionLabel="Add event">
      <TableEvents individualIds={[...parentIds, ...childIds]} />
    </PageCard>
  );
}
