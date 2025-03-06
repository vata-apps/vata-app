import { fetchFamilyAsChild } from "@/api/fetchFamilyAsChild";
import { FamilyTable } from "@/components/individual/FamilyTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Family as Child</CardTitle>
      </CardHeader>
      <CardContent>
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
            return <FamilyTable family={family} individualId={individualId} />;
          }

          return null;
        })()}
      </CardContent>
    </Card>
  );
}
