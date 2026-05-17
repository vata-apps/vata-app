import { type ReactNode } from 'react';
import { Box, Flex, SegmentedControl, Text } from '@radix-ui/themes';

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
  /** Item count rendered in a circular badge next to the label. */
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
 * Section header for the trees grid: a mono uppercase label, a circular
 * count badge, a horizontal rule that fades into the available space,
 * and a segmented control bound to a sort selection.
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
      <Text size="1" className="mono-label" style={{ color: 'var(--accent-11)' }}>
        {label}
      </Text>
      <Flex
        align="center"
        justify="center"
        aria-hidden
        style={{
          width: 24,
          height: 24,
          flex: 'none',
          borderRadius: '50%',
          border: '1px solid var(--accent-a5)',
          fontFamily: 'var(--code-font-family)',
          fontSize: 11,
          color: 'var(--accent-11)',
        }}
      >
        {count}
      </Flex>
      <Box
        style={{
          flex: 1,
          height: 1,
          background: 'linear-gradient(90deg, var(--accent-a4), transparent 80%)',
        }}
      />
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
