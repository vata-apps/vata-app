import { type ReactNode } from 'react';
import { Badge, Flex, SegmentedControl, Separator, Text } from '@radix-ui/themes';

/**
 * One option inside the sort segmented control.
 */
export interface SegmentedControlOption {
  /** Submitted value. */
  value: string;
  /** Localized label rendered in the segment. */
  label: ReactNode;
}

/**
 * Props accepted by {@link TreeSectionDivider}.
 */
export interface TreeSectionDividerProps {
  /** Localized section label (uppercase, e.g., "Your trees"). */
  label: ReactNode;
  /** Item count rendered in an outline badge next to the label. */
  count: number;
  /** Sort options rendered as a segmented control on the right. */
  sortOptions: SegmentedControlOption[];
  /** Currently selected sort value. */
  sortValue: string;
  /** Called when the user picks a different sort option. */
  onSortChange: (value: string) => void;
  /** Localized accessible name for the sort segmented control. */
  sortAriaLabel: string;
}

/**
 * Section header for the trees grid: an uppercase label, a count
 * badge, a horizontal rule that fills the available space, and a
 * segmented control bound to a sort selection.
 *
 * Owns no copy — every label is supplied by the caller.
 *
 * @example
 * <TreeSectionDivider
 *   label={t('home.sectionLabel')}
 *   count={trees.length}
 *   sortOptions={[{ value: 'recent', label: t('home.sortRecent') }]}
 *   sortValue={sort}
 *   onSortChange={setSort}
 *   sortAriaLabel={t('home.sortAriaLabel')}
 * />
 */
export function TreeSectionDivider({
  label,
  count,
  sortOptions,
  sortValue,
  onSortChange,
  sortAriaLabel,
}: TreeSectionDividerProps): JSX.Element {
  return (
    <Flex align="center" gap="3">
      <Text size="1" color="gray" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </Text>
      <Badge variant="outline" color="gray" radius="full">
        {count}
      </Badge>
      <Separator style={{ flex: 1 }} />
      <SegmentedControl.Root
        size="1"
        value={sortValue}
        onValueChange={onSortChange}
        aria-label={sortAriaLabel}
      >
        {sortOptions.map((option) => (
          <SegmentedControl.Item key={option.value} value={option.value}>
            {option.label}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl.Root>
    </Flex>
  );
}
