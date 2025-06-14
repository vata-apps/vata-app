import { PageCard } from "@/components/PageCard";
import { TableIndividuals } from "@/components/tables/TableIndividuals";
import { FamilyWithRelations } from "@/types";
import { Users } from "lucide-react";

interface FamilyParentsProps {
  readonly family: FamilyWithRelations;
}

export function FamilyParents({ family }: FamilyParentsProps) {
  const parentIds = [family.husband?.id, family.wife?.id].filter(
    Boolean,
  ) as string[];

  return (
    <PageCard title="Parents" icon={Users} actionLabel="Add parent">
      <TableIndividuals hideToolbar individualIds={parentIds} />
    </PageCard>
  );
}
