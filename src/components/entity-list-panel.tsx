import { type ReactNode } from 'react';
import { Badge, Box, Flex, Select, Text } from '@radix-ui/themes';

/** A single option offered by the {@link EntityListPanel} sort control. */
export interface EntityListSortOption {
  /** Stable value persisted as the active sort. */
  value: string;
  /** Translated, user-facing label. */
  label: string;
}

/** Configuration for the {@link EntityListPanel} sort footer. */
export interface EntityListSort {
  /** Translated label shown before the select (e.g. "Sort by"). */
  label: string;
  /** Available sort options, in display order. */
  options: EntityListSortOption[];
  /** Currently selected option value. */
  value: string;
  /** Called with the new value when the user picks an option. */
  onChange: (value: string) => void;
  /** Disables the select — e.g. while the list has no rows to sort. */
  disabled?: boolean;
}

/** Props accepted by {@link EntityListPanel}. */
export interface EntityListPanelProps {
  /** Panel title — the entity name in plural (e.g. "People"). */
  title: string;
  /**
   * Total number of entities, shown as a badge next to the title.
   * `undefined` renders a placeholder dash (e.g. while loading).
   */
  count?: number;
  /** Primary action control, rendered top-right (e.g. a "New" button). */
  action?: ReactNode;
  /** Sort footer configuration. */
  sort: EntityListSort;
  /** The list body — entity rows, or a loading / empty / error state. */
  children: ReactNode;
}

/**
 * The reusable shell for an entity list in the in-tree shell's left
 * column: a fixed header (title, count badge, primary action), a
 * scrollable body, and a fixed sort footer.
 *
 * It is entity-agnostic by composition — the body is supplied as
 * `children` and the panel never inspects row shape, so People,
 * Families, Places and Events can each render their own row markup
 * through the same frame.
 *
 * @example
 * <EntityListPanel
 *   title={t('nav.individuals')}
 *   count={people.length}
 *   action={<Button size="1" disabled>{t('sidebar.newButton')}</Button>}
 *   sort={{ label, options, value, onChange }}
 * >
 *   {people.map((person) => <PersonRow key={person.id} ... />)}
 * </EntityListPanel>
 */
export function EntityListPanel({
  title,
  count,
  action,
  sort,
  children,
}: EntityListPanelProps): JSX.Element {
  return (
    <Flex asChild direction="column" height="100%" overflow="hidden">
      <aside aria-label={title}>
        <Flex
          align="center"
          gap="2"
          flexShrink="0"
          style={{ padding: '14px 14px 12px', borderBottom: '1px solid var(--gray-a4)' }}
        >
          <Text asChild size="5" weight="bold" trim="both">
            <h2 style={{ margin: 0 }}>{title}</h2>
          </Text>
          <Badge variant="outline" color="gray" radius="full">
            {count ?? '–'}
          </Badge>
          <Box flexGrow="1" />
          {action}
        </Flex>

        <Box flexGrow="1" minHeight="0" overflow="auto">
          {children}
        </Box>

        <Flex
          align="center"
          gap="3"
          flexShrink="0"
          style={{ padding: '10px 14px', borderTop: '1px solid var(--gray-a4)' }}
        >
          <Text
            size="1"
            color="gray"
            style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            {sort.label}
          </Text>
          <Select.Root value={sort.value} onValueChange={sort.onChange} disabled={sort.disabled}>
            <Select.Trigger aria-label={sort.label} style={{ flex: 1 }} />
            <Select.Content>
              {sort.options.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>
      </aside>
    </Flex>
  );
}
