import { IndividualsTable } from "@/components/individuals/IndividualsTable";
import { PageCard } from "@/components/PageCard";
import { Baby } from "lucide-react";
import { FamilyWithRelations } from "./types";

interface FamilyChildrenProps {
  readonly family: FamilyWithRelations;
}

export function FamilyChildren({ family }: FamilyChildrenProps) {
  return (
    <PageCard title="Children" icon={Baby} actionLabel="Add child">
      <IndividualsTable
        filters={{ family: { familyId: family.id, role: "children" } }}
        showToolbar={false}
        showPagination={false}
        onDeleteIndividual={() => {}}
        columnsConfig={{
          role: { visible: false },
        }}
        blankState={{
          icon: Baby,
          title: "No children recorded",
        }}
      />
    </PageCard>
  );
}
