import { Button } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

interface AddButtonProps {
  to: string;
}

export function AddButton({ to }: AddButtonProps) {
  return (
    <Button
      w={{ base: "100%", xs: "auto" }}
      component={Link}
      leftSection={<PlusIcon width={16} />}
      size="sm"
      to={to}
      variant="primary"
      radius="xl"
    >
      Add
    </Button>
  );
}
