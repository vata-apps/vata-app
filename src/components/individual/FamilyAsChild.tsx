import { fetchFamilyAsChild } from "@/api/fetchFamilyAsChild";
import { FamilyAsChildTable } from "@/components/individual/FamilyAsChildTable";
import { Stack, Title } from "@mantine/core";
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
    <Stack gap="sm">
      <Title order={4}>Family as Child</Title>

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
    </Stack>
  );
}
