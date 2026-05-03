import { type ReactNode } from 'react';
import { tv } from 'tailwind-variants';

import { Icon } from '$components/ui/icon';

const ctaBase = tv({
  base: [
    'group relative flex min-h-[220px] flex-col items-center justify-center gap-3.5 rounded-xl border border-dashed border-foreground/15 bg-transparent p-7 text-center',
    'cursor-pointer transition-colors duration-150',
    'hover:border-primary hover:bg-primary/5',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ],
});

const ctaCircle = tv({
  base: [
    'flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-foreground/20 text-muted-foreground',
    'transition-colors duration-150',
    'group-hover:border-primary group-hover:text-primary',
  ],
});

/**
 * Props accepted by {@link TreeCardCta}.
 */
export interface TreeCardCtaProps {
  /** Localized title rendered below the plus icon. */
  title: ReactNode;
  /** Optional localized subtitle (e.g., "Or drop a .ged file"). */
  subtitle?: ReactNode;
  /** Called when the tile is clicked. */
  onClick: () => void;
}

/**
 * Dashed CTA tile used as the trailing cell of the trees grid to
 * trigger "Add a new tree". Renders as a `<button>` so it is
 * keyboard-focusable and announced as a button by screen readers.
 *
 * Visual: dashed-border tile holding a circular dashed-border plus
 * icon, a primary title, and an optional muted subtitle. Hover
 * promotes both borders to the primary colour and tints the
 * background with `primary/5`.
 *
 * @example
 * <TreeCardCta
 *   title={t('cta.title')}
 *   subtitle={t('cta.subtitle')}
 *   onClick={() => openCreateDialog()}
 * />
 */
export function TreeCardCta({ title, subtitle, onClick }: TreeCardCtaProps): JSX.Element {
  return (
    <button type="button" onClick={onClick} className={ctaBase()}>
      <span className={ctaCircle()}>
        <Icon name="plus" size={20} />
      </span>
      <span className="flex flex-col items-center gap-1">
        <span className="text-foreground text-sm font-medium">{title}</span>
        {subtitle && <span className="text-muted-foreground text-xs">{subtitle}</span>}
      </span>
    </button>
  );
}
