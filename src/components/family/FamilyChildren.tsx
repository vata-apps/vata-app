import { BlankState } from "@/components/BlankState";
import { PageCard } from "@/components/PageCard";
import { Baby } from "lucide-react";
import { useState } from "react";
import { FamilyChildrenTable } from "./FamilyChildrenTable";
import { FamilyWithRelations } from "./types";

interface FamilyChildrenProps {
  family: FamilyWithRelations;
}

export function FamilyChildren({ family }: FamilyChildrenProps) {
  // TODO: Fetch data
  const [status] = useState("success");

  return (
    <PageCard title="Children" icon={Baby} actionLabel="Add child">
      {(() => {
        if (status === "pending") {
          return <BlankState icon={Baby} title="Loading children..." />;
        }

        if (status === "error") {
          return <BlankState icon={Baby} title="Error loading children data" />;
        }

        if (status === "success") {
          if (!family) {
            return <BlankState icon={Baby} title="No family found" />;
          }

          if (family.children.length === 0) {
            return <BlankState icon={Baby} title="No children recorded" />;
          }

          return <FamilyChildrenTable family={family} />;
        }

        return null;
      })()}
    </PageCard>
  );
}
