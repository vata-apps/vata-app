import { Group } from "@mantine/core";

interface ToolbarProps {
  children: React.ReactNode;
}

export function Toolbar({ children }: ToolbarProps) {
  return <Group gap="md">{children}</Group>;
}
