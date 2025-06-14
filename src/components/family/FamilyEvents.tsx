import { PageCard } from "@/components/PageCard";
import { Calendar } from "lucide-react";
import { TableEvents } from "../TableEvents/TableEvents";
import { FamilyWithRelations } from "./types";

interface FamilyEventsProps {
  readonly family: FamilyWithRelations;
}

export function FamilyEvents({ family }: FamilyEventsProps) {
  const childIds = family.children?.map((child) => child.individual.id) ?? [];
  const parentIds = [family.husband?.id, family.wife?.id].filter(
    Boolean,
  ) as string[];
  const individualIds = [...parentIds, ...childIds];

  return (
    <PageCard title="Family Events" icon={Calendar} actionLabel="Add event">
      <TableEvents individualIds={individualIds} />
    </PageCard>
  );
}
