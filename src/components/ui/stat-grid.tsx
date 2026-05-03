import { type HTMLAttributes, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Recipe for the StatGrid container.
 */
const gridRecipe = tv({
  base: 'grid gap-3',
  variants: {
    cols: {
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-2 sm:grid-cols-4',
    },
  },
  defaultVariants: { cols: 4 },
});

/**
 * Recipe for the value-text colour. Label colour is shared (always
 * `muted-foreground`).
 */
const valueRecipe = tv({
  base: 'font-mono text-2xl font-semibold leading-none tabular-nums',
  variants: {
    accent: {
      default: 'text-foreground',
      destructive: 'text-destructive',
      success: 'text-success',
      warning: 'text-warning',
    },
  },
  defaultVariants: { accent: 'default' },
});

type GridRecipeProps = VariantProps<typeof gridRecipe>;
type ValueRecipeProps = VariantProps<typeof valueRecipe>;

/**
 * One cell in a {@link StatGrid}.
 */
export interface StatGridItem {
  /** Numeric or pre-formatted value rendered large in mono font. */
  value: string | number;
  /** Localized label rendered below the value. */
  label: ReactNode;
  /** Colour accent for the value. Defaults to `default` (foreground). */
  accent?: ValueRecipeProps['accent'];
}

/**
 * Props accepted by {@link StatGrid}.
 */
export interface StatGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Cells to render. */
  items: StatGridItem[];

  /**
   * Number of columns. Defaults to `4`. With `4`, the grid collapses to
   * 2 columns under the `sm` breakpoint.
   */
  cols?: GridRecipeProps['cols'];
}

/**
 * Compact grid of metrics — used in:
 * - Import GEDCOM modal (scan summary: Individuals / Families / Events / Sources)
 * - Edit Tree modal (read-only stats)
 * - Download Tree modal (file size + row counts)
 * - Delete Tree modal (loss preview, accent="destructive")
 *
 * Each cell shows a large mono value above a small uppercase label.
 * Colour accents are tokenised; the wrapper does not own copy.
 *
 * @example
 * <StatGrid
 *   items={[
 *     { value: 142, label: t('stats.individuals') },
 *     { value: 58, label: t('stats.families') },
 *     { value: 412, label: t('stats.events') },
 *     { value: 23, label: t('stats.sources') },
 *   ]}
 * />
 *
 * @example
 * // Loss preview in Delete modal — destructive accent
 * <StatGrid
 *   cols={3}
 *   items={[
 *     { value: '142', label: t('delete.lossIndividuals'), accent: 'destructive' },
 *     { value: '58', label: t('delete.lossFamilies'), accent: 'destructive' },
 *     { value: '412', label: t('delete.lossEvents'), accent: 'destructive' },
 *   ]}
 * />
 */
export function StatGrid({ items, cols, className, ...props }: StatGridProps): JSX.Element {
  return (
    <div className={gridRecipe({ cols, className })} {...props}>
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col gap-1.5">
          <span className={valueRecipe({ accent: item.accent })}>{item.value}</span>
          <span className="text-muted-foreground text-[11px] uppercase tracking-widest">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
