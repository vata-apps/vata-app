import { Button } from "@/components/ui/button";
import { Tables } from "@/database.types";
import displayName from "@/utils/displayName";
import { Link } from "@tanstack/react-router";

type Name = Pick<Tables<"names">, "first_name" | "last_name" | "is_primary">;

export type IndividualWithNames = {
  id: string;
  names: Name | Name[];
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
    <div className="flex items-center gap-2">
      <Button variant="link" size="sm" asChild className="h-6 p-0">
        <Link
          to="/individuals/$individualId"
          params={{ individualId: individual.id }}
        >
          {displayName(individual.names)}
        </Link>
      </Button>
      <span className="text-sm text-muted-foreground">(xxxx-xxxx)</span>
    </div>
  );
}
