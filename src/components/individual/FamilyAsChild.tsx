import { fetchFamilyAsChild } from "@/api/fetchFamilyAsChild";
import { FamilyAsChildTable } from "@/components/individual/FamilyAsChildTable";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Baby } from "lucide-react";
import { PageCard } from "../PageCard";

interface FamilyAsChildProps {
  individualId: string;
}

/**
 * Displays the family information where the individual is a child
 */
export function FamilyAsChild({ individualId }: FamilyAsChildProps) {
  const {
    data: family,
    status,
    error,
  } = useQuery({
    queryKey: ["family-as-child", individualId],
    queryFn: () => fetchFamilyAsChild(individualId),
    placeholderData: keepPreviousData,
  });

  return (
    <PageCard title="Family as Child" icon={Baby} actionLabel="Edit family">
      {(() => {
        if (status === "pending") return "Loading...";

        if (status === "error") {
          return (
            <div className="text-destructive">
              Error loading family data: {error.message}
            </div>
          );
        }

        if (status === "success") {
          return (
            <FamilyAsChildTable family={family} individualId={individualId} />
          );
        }

        return null;
      })()}
    </PageCard>
  );
}
