import { fetchFamiliesAsSpouse } from "@/api/fetchFamiliesAsSpouse";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { PageCard } from "../PageCard";
import { FamiliesAsSpouseTable } from "./FamilyAsSpouseTable";

interface FamilyAsSpouseProps {
  individualId: string;
}

/**
 * Displays the families information where the individual is a spouse
 */
export function FamilyAsSpouse({ individualId }: FamilyAsSpouseProps) {
  const {
    data: families,
    status,
    error,
  } = useQuery({
    queryKey: ["families-as-spouse", individualId],
    queryFn: () => fetchFamiliesAsSpouse(individualId),
    placeholderData: keepPreviousData,
  });

  return (
    <PageCard title="Families as Spouse" icon={User} actionLabel="Add family">
      {(() => {
        if (status === "pending") return "Loading...";

        if (status === "error") {
          return (
            <div className="text-destructive">
              Error loading families data: {error.message}
            </div>
          );
        }

        if (status === "success") {
          if (!families || families.length === 0) {
            return "No families found";
          }

          return (
            <FamiliesAsSpouseTable
              families={families}
              individualId={individualId}
            />
          );
        }

        return null;
      })()}
    </PageCard>
  );
}
