import { PageCard } from "@/components/PageCard";
import { TableIndividuals } from "@/components/tables/TableIndividuals";
import { FamilyWithRelations } from "@/types";
import { Baby } from "lucide-react";

interface FamilyChildrenProps {
  readonly family: FamilyWithRelations;
}

export function FamilyChildren({ family }: FamilyChildrenProps) {
  const childIds = family.children?.map((child) => child.individual.id) ?? [];

  return (
    <PageCard title="Children" icon={Baby}>
      <TableIndividuals individualIds={childIds} />
    </PageCard>
  );
}
