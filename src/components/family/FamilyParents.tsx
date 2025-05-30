import { IndividualsTable } from "@/components/individuals/IndividualsTable";
import { PageCard } from "@/components/PageCard";
import { Users } from "lucide-react";
import { FamilyWithRelations } from "./types";

interface FamilyParentsProps {
  readonly family: FamilyWithRelations;
}

export function FamilyParents({ family }: FamilyParentsProps) {
  return (
    <PageCard title="Parents" icon={Users} actionLabel="Add parent">
      <IndividualsTable
        filters={{ family: { familyId: family.id, role: "parent" } }}
        showToolbar={false}
        showPagination={false}
        onDeleteIndividual={() => {}}
        columnsConfig={{
          role: { visible: false },
        }}
        blankState={{
          icon: Users,
          title: "No parents recorded",
        }}
      />
    </PageCard>
  );
}
