import { Button } from "@mantine/core";
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
    <Button
      component={Link}
      size="compact-sm"
      to="/individuals"
      variant="transparent"
    >
      Add {type}
    </Button>
  );
}
