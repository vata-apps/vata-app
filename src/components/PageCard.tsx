import { Button, Card, Group, Stack, Title } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageCardProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly icon?: LucideIcon;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly headerContent?: ReactNode;
}

/**
 * A reusable card component with optional header that follows the app's design patterns.
 *
 * @example
 * // Card with header (icon + title + action button)
 * <PageCard title="Sources" icon={FileText} actionLabel="Add sources" onAction={handleAdd}>
 *   <div>Card content</div>
 * </PageCard>
 *
 * @example
 * // Card with just content (no header)
 * <PageCard>
 *   <div>Custom content layout</div>
 * </PageCard>
 *
 * @example
 * // Card with custom header content
 * <PageCard headerContent={<CustomHeader />}>
 *   <div>Card content</div>
 * </PageCard>
 */
export function PageCard({
  children,
  title,
  icon: Icon,
  actionLabel,
  onAction,
  headerContent,
}: PageCardProps) {
  const hasHeader = title || actionLabel || headerContent;

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Stack gap="lg">
        {hasHeader && (
          <Group justify="space-between">
            {(title || Icon) && (
              <Group>
                {Icon && <Icon size={24} />}
                {title && (
                  <Title order={3} fw={500}>
                    {title}
                  </Title>
                )}
              </Group>
            )}

            {headerContent}

            {actionLabel && (
              <Button size="sm" variant="subtle" onClick={onAction}>
                {actionLabel}
              </Button>
            )}
          </Group>
        )}

        {children}
      </Stack>
    </Card>
  );
}
