import { PageCard } from "@/components/PageCard";
import { Users } from "lucide-react";
import { TableIndividuals } from "../TableIndividuals";
import { FamilyWithRelations } from "./types";

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
