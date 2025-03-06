import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

/**
 * Displays a button to add individual information
 */
export function AddIndividualInfo({
  type,
}: {
  type: "birth" | "death" | string;
}) {
  return (
    <Button variant="ghost" size="sm" asChild className="h-6">
      <Link
        to="/individuals"
        className="text-muted-foreground hover:text-foreground"
      >
        Add {type} information
      </Link>
    </Button>
  );
}
