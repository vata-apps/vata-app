import { type ReactNode } from 'react';
import { tv } from 'tailwind-variants';

import { Button } from '$components/ui/button';

const cardBase = tv({
  base: [
    'relative flex min-h-[220px] flex-col gap-3.5 rounded-xl border border-border bg-card p-[18px] pb-4',
    'transition-colors duration-150',
    'hover:border-foreground/20 hover:shadow-sm',
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
 * Metadata shown in the card body. Values are pre-formatted by the caller.
 */
export interface TreeCardMeta {
  /** Formatted "created at" value (e.g., a localised date string). */
  createdAt: ReactNode;
  /** Formatted "last accessed" value. */
  lastAccessedAt: ReactNode;
}

/**
 * Localized labels rendered inside the card. Required so the wrapper
 * does not own copy.
 */
export interface TreeCardLabels {
  open: string;
  export: string;
  edit: string;
  delete: string;
  individuals: string;
  families: string;
  generations: string;
  createdAt: string;
  lastAccessedAt: string;
}

/**
 * Props accepted by {@link TreeCard}.
 */
export interface TreeCardProps {
  /** Tree name shown as the card heading. */
  name: ReactNode;
  /** Optional tree description. */
  description?: ReactNode;
  /** Counts displayed in the stats row. */
  stats: TreeCardStats;
  /** Created/last-accessed metadata. */
  meta: TreeCardMeta;
  /** Localized labels for stats, metadata keys, and action buttons. */
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

interface StatProps {
  value: ReactNode;
  label: ReactNode;
}

function Stat({ value, label }: StatProps): JSX.Element {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-lg leading-none font-medium tabular-nums tracking-tight">
        {value}
      </span>
      <span className="text-muted-foreground font-mono text-[10px] leading-none tracking-wider uppercase">
        {label}
      </span>
    </div>
  );
}

function StatDivider(): JSX.Element {
  return <span aria-hidden className="bg-border h-6 w-px flex-none" />;
}

interface MetaRowProps {
  label: ReactNode;
  value: ReactNode;
}

function MetaRow({ label, value }: MetaRowProps): JSX.Element {
  return (
    <div className="flex items-center gap-2 font-mono text-[11.5px] leading-snug">
      <span className="text-muted-foreground w-[120px] flex-none whitespace-nowrap">{label}</span>
      <span className="text-foreground tabular-nums">{value}</span>
    </div>
  );
}

/**
 * Domain card representing one family tree on the home page.
 *
 * Lives outside `src/components/ui/` because it is genealogy-domain
 * specific — it composes generic UI primitives (Button) but has its
 * own data shape and call sites. For the "Add a new tree" tile, use
 * the dedicated `TreeCardCta` component instead — they share no real
 * runtime code, only family resemblance.
 *
 * All textual content (name, description, button labels, meta) must be
 * localized by the caller; this component does not own copy.
 *
 * Visual layout (top-to-bottom):
 * 1. Title row — serif italic name + 2-line clamped description.
 * 2. Stats row — inline figures (individuals, families, optional generations) separated by vertical rules.
 * 3. Meta block — dashed top border, mono key/value rows (created, last opened).
 * 4. Action row — outline "Open" button (flex-1) followed by ghost icon-only buttons (export, edit, delete).
 *
 * @example
 * <TreeCard
 *   name="Bourgoin family"
 *   description="Started from grandpa's notebook in 2024."
 *   stats={{ individuals: 142, families: 58 }}
 *   meta={{ createdAt: '2024-01-12', lastAccessedAt: '2 hours ago' }}
 *   labels={{
 *     open: t('card.open'),
 *     export: t('card.export'),
 *     edit: t('card.edit'),
 *     delete: t('card.delete'),
 *     individuals: t('card.individuals'),
 *     families: t('card.families'),
 *     generations: t('card.generations'),
 *     createdAt: t('card.createdAt'),
 *     lastAccessedAt: t('card.lastAccessedAt'),
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
}: TreeCardProps): JSX.Element {
  return (
    <article className={cardBase()}>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-foreground truncate font-serif text-[19px] leading-tight font-medium tracking-tight italic">
          {name}
        </h3>
        {description && (
          <p className="text-muted-foreground line-clamp-2 text-[13px] leading-snug">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <Stat value={stats.individuals} label={labels.individuals} />
        <StatDivider />
        <Stat value={stats.families} label={labels.families} />
        {stats.generations != null && (
          <>
            <StatDivider />
            <Stat value={stats.generations} label={labels.generations} />
          </>
        )}
      </div>

      <div className="border-border flex flex-col gap-1 border-t border-dashed pt-2.5">
        <MetaRow label={labels.createdAt} value={meta.createdAt} />
        <MetaRow label={labels.lastAccessedAt} value={meta.lastAccessedAt} />
      </div>

      <div className="mt-auto flex items-center gap-1.5 pt-2.5">
        <Button
          variant="outline"
          size="sm"
          leadingIcon="folder-open"
          trailingIcon="arrow-right"
          onClick={onOpen}
          className="flex-1"
        >
          {labels.open}
        </Button>
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
    </article>
  );
}
