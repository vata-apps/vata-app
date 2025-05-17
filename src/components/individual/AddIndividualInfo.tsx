import { Button } from "@mantine/core";
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
    <Button
      component={Link}
      to="/individuals"
      size="compact-sm"
      variant="transparent"
    >
      Add {type} information
    </Button>
  );
}
