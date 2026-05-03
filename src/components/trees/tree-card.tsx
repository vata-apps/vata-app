import { type ReactNode } from 'react';
import { tv } from 'tailwind-variants';

import { Button } from '$components/ui/button';
import { Icon } from '$components/ui/icon';
import { StatGrid } from '$components/ui/stat-grid';

const cardBase = tv({
  base: ['flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors duration-150'],
});

const ctaCardBase = tv({
  base: [
    'flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card p-4 text-center',
    'text-muted-foreground transition-colors duration-150',
    'hover:border-primary/40 hover:text-foreground',
  ],
});

/**
 * Stats shown in the card body.
 */
export interface TreeCardStats {
  individuals: number;
  families: number;
  /** Optional generation count when computed. */
  generations?: number | null;
}

/**
 * Metadata shown at the bottom of the card.
 */
export interface TreeCardMeta {
  /** Localized "created at" caption (already formatted). */
  createdAt: ReactNode;
  /** Localized "last accessed" caption (already formatted). */
  lastAccessedAt: ReactNode;
}

/**
 * Localized labels rendered as button accessible names. Required so
 * the wrapper does not own copy.
 */
export interface TreeCardLabels {
  open: string;
  export: string;
  edit: string;
  delete: string;
  individuals: string;
  families: string;
  generations: string;
}

/**
 * Props accepted by {@link TreeCard}.
 */
export interface TreeCardProps {
  /** Tree name shown as the card heading. */
  name: ReactNode;
  /** Optional tree description. */
  description?: ReactNode;
  /** Counts displayed in the StatGrid. */
  stats: TreeCardStats;
  /** Created/last-accessed metadata. */
  meta: TreeCardMeta;
  /** Localized accessible names for the action buttons and stat labels. */
  labels: TreeCardLabels;
  /** Called when the user clicks "Open". */
  onOpen: () => void;
  /** Called when the user clicks "Export". */
  onExport: () => void;
  /** Called when the user clicks "Edit". */
  onEdit: () => void;
  /** Called when the user clicks "Delete". */
  onDelete: () => void;
}

/**
 * Domain card representing one family tree on the home page.
 *
 * Lives outside `src/components/ui/` because it is genealogy-domain
 * specific — it composes generic UI primitives (Button, Icon, StatGrid)
 * but has its own data shape and call sites. For the "Add a new tree"
 * tile, use the dedicated {@link TreeCardCta} component instead — they
 * share no real runtime code, only family resemblance.
 *
 * All textual content (name, description, button labels, meta) must be
 * localized by the caller; this component does not own copy.
 *
 * @example
 * <TreeCard
 *   name="Bourgoin family"
 *   description="Started from grandpa's notebook in 2024."
 *   stats={{ individuals: 142, families: 58 }}
 *   meta={{ createdAt: '2024-01-12', lastAccessedAt: '2 hours ago' }}
 *   labels={{
 *     open: t('trees.open'),
 *     export: t('trees.export'),
 *     edit: t('trees.edit'),
 *     delete: t('trees.delete'),
 *     individuals: t('trees.stats.individuals'),
 *     families: t('trees.stats.families'),
 *     generations: t('trees.stats.generations'),
 *   }}
 *   onOpen={...} onExport={...} onEdit={...} onDelete={...}
 * />
 */
export function TreeCard({
  name,
  description,
  stats,
  meta,
  labels,
  onOpen,
  onExport,
  onEdit,
  onDelete,
}: TreeCardProps) {
  const items = [
    { value: stats.individuals, label: labels.individuals },
    { value: stats.families, label: labels.families },
  ];
  if (stats.generations != null) {
    items.push({ value: stats.generations, label: labels.generations });
  }

  return (
    <article className={`${cardBase()} border-border hover:border-primary/40`}>
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-foreground text-base font-semibold leading-tight">{name}</h3>
          {description && (
            <p className="text-muted-foreground text-xs leading-snug">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" hideLabel leadingIcon="download" onClick={onExport}>
            {labels.export}
          </Button>
          <Button variant="ghost" size="sm" hideLabel leadingIcon="pencil" onClick={onEdit}>
            {labels.edit}
          </Button>
          <Button variant="ghost" size="sm" hideLabel leadingIcon="trash" onClick={onDelete}>
            {labels.delete}
          </Button>
        </div>
      </header>

      <StatGrid items={items} cols={items.length === 3 ? 3 : 2} />

      <footer className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="text-muted-foreground">{meta.createdAt}</span>
          <span className="text-muted-foreground">{meta.lastAccessedAt}</span>
        </div>
        <Button variant="outline" size="sm" trailingIcon="arrow-right" onClick={onOpen}>
          {labels.open}
        </Button>
      </footer>
    </article>
  );
}

/**
 * Props accepted by {@link TreeCardCta}.
 */
export interface TreeCardCtaProps {
  /** Localized label for the CTA tile. */
  label: ReactNode;
  /** Called when the CTA is clicked. */
  onClick: () => void;
}

/**
 * Dashed CTA tile used as the last cell of the trees grid to trigger
 * "Add a new tree". Renders as a `<button>` so it is keyboard-focusable
 * and announced as a button by screen readers.
 *
 * @example
 * <TreeCardCta label={t('trees.new')} onClick={() => navigate('/new')} />
 */
export function TreeCardCta({ label, onClick }: TreeCardCtaProps) {
  return (
    <button type="button" onClick={onClick} className={ctaCardBase()}>
      <Icon name="plus" size={24} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
