import { Stack, Title } from "@mantine/core";
import { useState } from "react";
import { FamilyChildrenTable } from "./FamilyChildrenTable";
import { FamilyWithRelations } from "./types";

interface FamilyChildrenProps {
  family: FamilyWithRelations;
}

export function FamilyChildren({ family }: FamilyChildrenProps) {
  // TODO: Fetch data
  const [status] = useState("success");
  const error = { message: "Error loading children data" };

  return (
    <Stack gap="sm">
      <Title order={4}>Children</Title>

      {(() => {
        if (status === "pending") return "Loading...";

        if (status === "error") {
          return <div>Error loading children data: {error.message}</div>;
        }

        if (status === "success") {
          if (!family) {
            return <div>No family found</div>;
          }

          return <FamilyChildrenTable family={family} />;
        }

        return null;
      })()}
    </Stack>
  );
}
