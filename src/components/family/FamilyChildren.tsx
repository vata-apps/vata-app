import { PageCard } from "@/components/PageCard";
import { Baby } from "lucide-react";
import { TableIndividuals } from "../TableIndividuals";
import { FamilyWithRelations } from "./types";

interface FamilyChildrenProps {
  readonly family: FamilyWithRelations;
}

export function FamilyChildren({ family }: FamilyChildrenProps) {
  const childIds = family.children?.map((child) => child.individual.id) ?? [];

  return (
    <PageCard title="Children" icon={Baby} actionLabel="Add child">
      <TableIndividuals hideToolbar individualIds={childIds} />
    </PageCard>
  );
}
