/**
 * RecordRow — one selectable fact inside a {@link RecordPanel.ListCard}.
 *
 * A real `<button>` so the row is reachable by keyboard and announces its
 * selected state, which the mockup's `div` rows could not. The row owns the
 * shared anatomy — icon puck, title line, meta line, source count, chevron —
 * and leaves the tab-specific content to `title` and `meta`.
 *
 * A draft row (`isDraft`) swaps the filled puck for a dashed one, drops the
 * source count (nothing can cite a record that does not exist yet) and gains a
 * "draft" badge.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '../ui/badge';
import { Typography } from '../ui/typography';
import { Icon, type IconName } from '../icon';
import * as s from './record-row.css';

/** How many sources back this fact — neutral when cited, warned when not. */
function SourceCount({ count }: { count: number }): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Typography
      className={s.sourceCount}
      tone={count > 0 ? 'muted' : 'warn'}
      // Grayscale carries no meaning on its own — the number is the label, and
      // the title spells out the unsourced case for anyone who can't weigh ink.
      title={count > 0 ? t('records.sources', { count }) : t('records.unsourced')}
    >
      <Icon name="book-marked" size={13} />
      {count}
    </Typography>
  );
}

export interface RecordRowProps {
  /** Glyph for the record's kind, shown in the leading puck. */
  icon: IconName;
  /** Primary line — the record's own label. */
  title: ReactNode;
  /** Secondary line, e.g. the record's type. */
  meta?: ReactNode;
  /** Rendered at the end of the title line, e.g. a "primary" marker. */
  titleSuffix?: ReactNode;
  /**
   * Omit on rows whose entity cannot carry citations yet — the indicator is
   * then left out entirely rather than shown as 0, which would read as
   * "unsourced" instead of "not applicable".
   */
  sourceCount?: number;
  isDraft?: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export function RecordRow({
  icon,
  title,
  meta,
  titleSuffix,
  sourceCount,
  isDraft = false,
  isSelected,
  onSelect,
}: RecordRowProps): JSX.Element {
  const { t } = useTranslation('individuals');

  // Selection wins over the draft treatment: the row the user is editing must
  // read as the open one whether or not it has been saved.
  let variant: keyof typeof s.row = 'idle';
  if (isSelected) variant = 'selected';
  else if (isDraft) variant = 'draft';

  // A draft names its own state; nothing can cite a record that does not exist
  // yet, so the two markers never compete for the same slot.
  let marker: ReactNode = null;
  if (isDraft) marker = <Badge className={s.draftBadge}>{t('records.draft')}</Badge>;
  else if (sourceCount !== undefined) marker = <SourceCount count={sourceCount} />;

  return (
    <button
      type="button"
      className={s.row[variant]}
      // `aria-expanded` rather than `aria-pressed`: selecting a row reveals its
      // detail, either expanded below it or in the panel beside the list.
      aria-expanded={isSelected}
      onClick={onSelect}
    >
      <span className={isDraft ? s.puck.draft : s.puck.saved}>
        <Icon name={icon} size={16} />
      </span>

      <span className={s.content}>
        <span className={s.titleLine}>
          <Typography className={s.title}>{title}</Typography>
          {titleSuffix}
        </span>
        {meta ? (
          <Typography className={s.meta} size="xs" tone="muted">
            {meta}
          </Typography>
        ) : null}
      </span>

      {marker}

      <Icon
        name="chevron-right"
        size={14}
        className={isSelected ? s.chevron.selected : s.chevron.idle}
      />
    </button>
  );
}
