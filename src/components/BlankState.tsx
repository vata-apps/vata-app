import { Button, Center, Stack, Text, Title } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface BlankStateProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly children?: ReactNode;
}

/**
 * A reusable blank/empty state component with consistent styling.
 *
 * @example
 * <BlankState
 *   icon={FileText}
 *   title="No Sources Yet"
 *   description="Documents and records will appear here."
 *   actionLabel="Add sources"
 *   onAction={handleAdd}
 * />
 */
export function BlankState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: BlankStateProps) {
  return (
    <Center py="xl">
      <Stack align="center" gap="md">
        <Icon size={48} color="var(--mantine-color-dimmed)" />
        <Title order={4} c="dimmed">
          {title}
        </Title>
        <Text c="dimmed" ta="center" size="sm">
          {description}
        </Text>
        {actionLabel && (
          <Button size="sm" variant="subtle" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {children}
      </Stack>
    </Center>
  );
}
