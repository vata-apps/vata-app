import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import { type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { Badge } from './badge';

/**
 * Recipe for the {@link OptionCardGroup} grid container.
 */
const groupRecipe = tv({
  base: 'grid gap-3',
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-3',
    },
  },
  defaultVariants: { cols: 2 },
});

type GroupRecipeProps = VariantProps<typeof groupRecipe>;

/**
 * Recipe for an individual {@link OptionCard}.
 *
 * Selected state uses Radix's `data-state="checked"` attribute to swap
 * the border colour and ring; disabled state dims the whole card.
 */
const cardRecipe = tv({
  base: [
    'relative flex flex-col items-start gap-1 rounded-lg border bg-card p-4 text-left',
    'transition-colors duration-150',
    'cursor-pointer',
    'border-border hover:border-primary/40',
    'data-[state=checked]:border-primary data-[state=checked]:ring-2 data-[state=checked]:ring-primary/20',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-60',
  ],
});

/**
 * Props accepted by {@link OptionCardGroup}.
 */
export interface OptionCardGroupProps {
  /** Currently selected value. Controlled. */
  value: string;

  /** Called when a card is selected. */
  onValueChange: (value: string) => void;

  /**
   * Number of columns in the responsive grid (collapses to 1 on small
   * viewports). Defaults to `2`.
   */
  cols?: GroupRecipeProps['cols'];

  /**
   * Localized accessible name for the radio group. Required so assistive
   * tech announces what the cards represent (e.g., "Starting point").
   */
  'aria-label': string;

  /** Children — typically one or more {@link OptionCard}s. */
  children: ReactNode;
}

/**
 * Grid of selectable option cards built on `@radix-ui/react-radio-group`.
 *
 * Use this when the choice between options is the *primary* decision in
 * a form — for example, "Empty tree vs Tree from me" in the New Tree
 * modal, or "GEDCOM vs JSON vs ZIP" in the Download modal. For dense or
 * inline choices, prefer a regular RadioGroup or SegmentedControl.
 *
 * Always pass `aria-label` so the group has an accessible name.
 *
 * @example
 * <OptionCardGroup
 *   value={mode}
 *   onValueChange={setMode}
 *   aria-label={t('newTree.startingPoint')}
 *   cols={2}
 * >
 *   <OptionCard value="empty" label={t('newTree.empty.label')} description={t('newTree.empty.description')} />
 *   <OptionCard value="from-me" label={t('newTree.fromMe.label')} description={t('newTree.fromMe.description')} />
 * </OptionCardGroup>
 */
export function OptionCardGroup({
  value,
  onValueChange,
  cols,
  'aria-label': ariaLabel,
  children,
}: OptionCardGroupProps): JSX.Element {
  return (
    <RadixRadioGroup.Root
      value={value}
      onValueChange={onValueChange}
      aria-label={ariaLabel}
      className={groupRecipe({ cols })}
    >
      {children}
    </RadixRadioGroup.Root>
  );
}

interface OptionCardBaseProps {
  /** Unique value submitted to {@link OptionCardGroup.onValueChange}. */
  value: string;

  /** Localized label rendered as the card heading. */
  label: ReactNode;

  /** Optional localized description rendered under the label. */
  description?: ReactNode;

  /** Disables the option (cannot be selected). */
  disabled?: boolean;
}

/**
 * Props accepted by {@link OptionCard}. Discriminated on `soon` so the
 * `soonLabel` (a client-facing string) is required precisely when the
 * Badge is rendered — never accidentally falling back to English.
 */
export type OptionCardProps = OptionCardBaseProps &
  (
    | { soon?: false; soonLabel?: never }
    | {
        /**
         * Marks the option as a coming-soon preview. Renders a Badge with
         * variant `soon` in the top-right and forces `disabled` semantics.
         */
        soon: true;
        /** Localized text for the soon badge. Required when `soon` is true. */
        soonLabel: string;
      }
  );

/**
 * Single selectable card inside an {@link OptionCardGroup}.
 *
 * Renders as a `<button role="radio">` so keyboard navigation
 * (Up/Down/Left/Right between siblings, Space to select) and screen-reader
 * announcements are handled by Radix.
 */
export function OptionCard(props: OptionCardProps): JSX.Element {
  const { value, label, description, disabled } = props;
  const soon = props.soon === true;
  return (
    <RadixRadioGroup.Item value={value} disabled={disabled || soon} className={cardRecipe()}>
      {soon && (
        <span className="absolute right-3 top-3">
          <Badge variant="soon" size="sm">
            {props.soonLabel}
          </Badge>
        </span>
      )}
      <span className="text-foreground text-sm font-medium leading-tight">{label}</span>
      {description && (
        <span className="text-muted-foreground text-xs leading-snug">{description}</span>
      )}
    </RadixRadioGroup.Item>
  );
}
