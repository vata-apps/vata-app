import { forwardRef, type HTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Recipe for the Badge component.
 *
 * Variants describe the badge's *intent*, not just its colour:
 * - `default` — neutral metadata (count, generic label).
 * - `primary` — brand emphasis ("Active", "Selected").
 * - `success` — positive signal ("Ready", "Done").
 * - `warning` — needs attention but not destructive ("Pending").
 * - `danger` — error/blocked state.
 * - `info` — neutral informative.
 * - `outline` — low-emphasis count chip; pairs well with section headings.
 * - `soon` — dashed serif/italic indicator on disabled/preview options.
 *
 * Sizes:
 * - `sm` — inline next to body text.
 * - `md` — default — section headers, file rows.
 */
export const badgeRecipe = tv({
  base: [
    'inline-flex items-center gap-1 whitespace-nowrap rounded-full',
    'font-medium leading-none',
  ],
  variants: {
    variant: {
      default: 'bg-secondary text-secondary-foreground',
      primary: 'bg-primary text-primary-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      danger: 'bg-destructive text-destructive-foreground',
      info: 'bg-info text-info-foreground',
      outline: 'border border-border bg-transparent text-muted-foreground',
      soon: 'border border-dashed border-border bg-transparent font-serif text-xs italic text-muted-foreground',
    },
    size: {
      sm: 'h-5 px-2 text-[11px]',
      md: 'h-6 px-2.5 text-xs',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

type BadgeRecipeProps = VariantProps<typeof badgeRecipe>;

/**
 * Props accepted by {@link Badge}. Extends the native `<span>` props.
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, BadgeRecipeProps {
  /**
   * When `true`, renders a small status dot before the label. Useful for
   * live-status badges (e.g., a "Ready" pastille on a file row).
   */
  dot?: boolean;
}

/**
 * Inline status / count chip.
 *
 * Non-interactive by default — renders a `<span>` so it can sit inside
 * any inline context (table cell, list row, button). Pass an
 * `aria-label` when the badge is not paired with adjacent context that
 * makes its meaning clear.
 *
 * @example
 * <Badge variant="success" dot>Ready</Badge>
 *
 * @example
 * <Badge variant="outline">{trees.length}</Badge>
 *
 * @example
 * // Disabled/preview indicator
 * <Badge variant="soon">Soon</Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant, size, dot = false, className, children, ...props },
  ref
) {
  return (
    <span ref={ref} className={badgeRecipe({ variant, size, className })} {...props}>
      {dot && <span aria-hidden className="bg-current size-1.5 rounded-full opacity-80" />}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
