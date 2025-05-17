import { GenderIcon } from "@/components/GenderIcon";
import { Enums, Tables } from "@/database.types";
import displayName from "@/utils/displayName";
import { Button, Group } from "@mantine/core";
import { Link } from "@tanstack/react-router";

type Name = Pick<Tables<"names">, "first_name" | "last_name" | "is_primary">;

export type IndividualWithNames = {
  id: string;
  names: Name | Name[];
  gender: Enums<"gender">;
};

/**
 * Displays an individual family member with name and lifespan
 */
export function FamilyMember({
  individual,
}: {
  individual: IndividualWithNames;
}) {
  return (
    <Group align="center" gap={0}>
      <GenderIcon gender={individual.gender} size={16} />
      <Button
        variant="transparent"
        size="compact-sm"
        component={Link}
        to={`/individuals/${individual.id}`}
      >
        {displayName(individual.names)}
      </Button>
      <span className="text-sm text-muted-foreground">(xxxx-xxxx)</span>
    </Group>
  );
}
