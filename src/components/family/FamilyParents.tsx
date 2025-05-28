import { BlankState } from "@/components/BlankState";
import { PageCard } from "@/components/PageCard";
import { Users } from "lucide-react";
import { useState } from "react";
import { FamilyParentsTable } from "./FamilyParentsTable";
import { FamilyWithRelations } from "./types";

interface FamilyParentsProps {
  family: FamilyWithRelations;
}

export function FamilyParents({ family }: FamilyParentsProps) {
  // TODO: Fetch data
  const [status] = useState("success");

  return (
    <PageCard title="Parents" icon={Users} actionLabel="Add parent">
      {(() => {
        if (status === "pending") {
          return <BlankState icon={Users} title="Loading parents..." />;
        }

        if (status === "error") {
          return <BlankState icon={Users} title="Error loading parents data" />;
        }

        if (status === "success") {
          if (!family) {
            return <BlankState icon={Users} title="No family found" />;
          }

          if (!family.husband && !family.wife) {
            return <BlankState icon={Users} title="No parents recorded" />;
          }

          return <FamilyParentsTable family={family} />;
        }

        return null;
      })()}
    </PageCard>
  );
}
