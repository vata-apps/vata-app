import * as RadixToggleGroup from '@radix-ui/react-toggle-group';
import { type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Recipe for the SegmentedControl wrapper.
 */
const groupRecipe = tv({
  base: [
    'inline-flex items-center rounded-md border border-border bg-card p-0.5',
    'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
  ],
});

/**
 * Recipe for an individual segment inside the control.
 */
const itemRecipe = tv({
  base: [
    'inline-flex items-center justify-center whitespace-nowrap rounded-sm font-medium',
    'transition-colors duration-150',
    'text-muted-foreground hover:text-foreground',
    'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
    'focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  variants: {
    size: {
      sm: 'h-6 px-2 text-xs',
      md: 'h-8 px-3 text-sm',
    },
  },
  defaultVariants: { size: 'md' },
});

type ItemRecipeProps = VariantProps<typeof itemRecipe>;

/**
 * One option inside a {@link SegmentedControl}.
 */
export interface SegmentedControlOption {
  /** Submitted value. */
  value: string;
  /** Localized label rendered in the segment. */
  label: ReactNode;
  /** Disables this segment. */
  disabled?: boolean;
}

/**
 * Props accepted by {@link SegmentedControl}.
 */
export interface SegmentedControlProps {
  /** Currently selected value. Controlled. Empty string means none. */
  value: string;

  /** Called when the user picks a segment. */
  onValueChange: (value: string) => void;

  /** Options to render. */
  options: SegmentedControlOption[];

  /** Visual size. Defaults to `"md"`. */
  size?: ItemRecipeProps['size'];

  /**
   * Localized accessible name for the group. Required so assistive
   * tech can announce what the segments represent (e.g., "Sort by").
   */
  'aria-label': string;
}

/**
 * Single-selection segmented control built on Radix ToggleGroup.
 *
 * Use this for compact, inline pickers where the user is choosing
 * between 2–4 short labels (sort orders, density toggles, theme
 * pickers). For richer per-option layouts, prefer {@link OptionCard}
 * with its grid of cards.
 *
 * Keyboard navigation (arrow keys), focus management, and roving
 * tabindex are handled by Radix.
 *
 * @example
 * <SegmentedControl
 *   value={sort}
 *   onValueChange={(v) => v && setSort(v)}
 *   options={[
 *     { value: 'recent', label: t('sort.recent') },
 *     { value: 'name', label: t('sort.name') },
 *     { value: 'size', label: t('sort.size') },
 *   ]}
 *   aria-label={t('sort.ariaLabel')}
 * />
 */
export function SegmentedControl({
  value,
  onValueChange,
  options,
  size,
  'aria-label': ariaLabel,
}: SegmentedControlProps) {
  return (
    <RadixToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => {
        // Radix emits an empty string when the user re-clicks the active
        // segment. We forward that through — consumers decide whether
        // to allow deselection or guard with `if (next) ...`.
        onValueChange(next);
      }}
      aria-label={ariaLabel}
      className={groupRecipe()}
    >
      {options.map((option) => (
        <RadixToggleGroup.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={itemRecipe({ size })}
        >
          {option.label}
        </RadixToggleGroup.Item>
      ))}
    </RadixToggleGroup.Root>
  );
}
