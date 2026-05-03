import { type ReactNode } from 'react';

import { Badge } from '$components/ui/badge';
import { SegmentedControl, type SegmentedControlOption } from '$components/ui/segmented-control';

/**
 * Props accepted by {@link TreeSectionDivider}.
 */
export interface TreeSectionDividerProps {
  /** Localized section label (mono uppercase, e.g., "Your trees"). */
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
 * Section header for the trees grid: a mono uppercase label, a count
 * badge, a thin horizontal rule that fills the available space, and a
 * segmented control bound to a sort selection.
 *
 * Composes existing primitives ({@link Badge}, {@link SegmentedControl})
 * and owns no copy — every label is supplied by the caller.
 *
 * @example
 * <TreeSectionDivider
 *   label={t('home.sectionLabel')}
 *   count={trees.length}
 *   sortOptions={[
 *     { value: 'recent', label: t('home.sortRecent') },
 *     { value: 'name', label: t('home.sortName') },
 *     { value: 'size', label: t('home.sortSize') },
 *   ]}
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
    <div className="flex items-center gap-3.5">
      <span className="text-muted-foreground font-mono text-[10.5px] tracking-wider uppercase">
        {label}
      </span>
      <Badge variant="outline" size="sm" className="font-mono">
        {count}
      </Badge>
      <span aria-hidden className="bg-border h-px flex-1" />
      <SegmentedControl
        size="sm"
        options={sortOptions}
        value={sortValue}
        onValueChange={(next) => {
          if (next) onSortChange(next);
        }}
        aria-label={sortAriaLabel}
      />
    </div>
  );
}
