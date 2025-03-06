import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

/**
 * Displays a button to add a new family member
 */
export function AddFamilyMember({
  type,
}: {
  type: "father" | "mother" | "sibling";
}) {
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link
        to="/individuals"
        className="text-muted-foreground hover:text-foreground"
      >
        Add {type}
      </Link>
    </Button>
  );
}
