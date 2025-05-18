import { Stack, Title } from "@mantine/core";
import { useState } from "react";
import { FamilyParentsTable } from "./FamilyParentsTable";
import { FamilyWithRelations } from "./types";

interface FamilyParentsProps {
  family: FamilyWithRelations;
}

export function FamilyParents({ family }: FamilyParentsProps) {
  // TODO: Fetch data
  const [status] = useState("success");
  const error = { message: "Error loading parents data" };

  return (
    <Stack gap="sm">
      <Title order={4}>Parents</Title>

      {(() => {
        if (status === "pending") return "Loading...";

        if (status === "error") {
          return <div>Error loading parents data: {error.message}</div>;
        }

        if (status === "success") {
          if (!family) {
            return <div>No family found</div>;
          }

          return <FamilyParentsTable family={family} />;
        }

        return null;
      })()}
    </Stack>
  );
}
