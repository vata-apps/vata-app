import { fetchFamiliesAsSpouse } from "@/api/fetchFamiliesAsSpouse";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { FamiliesAsSpouseTable } from "./FamiliesAsSpouseTable";

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Families as Spouse</CardTitle>
        <Button variant="secondary" size="sm" asChild>
          <Link to="/families">Add Family</Link>
        </Button>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
