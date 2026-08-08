/**
 * RecordSources — the read-only list of citations backing a record, shared by
 * every record-panel detail body (Names, Events, …). No add/remove UI yet;
 * citation management stays out of scope per the parent PRD.
 */
import { useTranslation } from 'react-i18next';

import { Icon } from '../icon';
import { Typography } from '../ui/typography';
import * as s from './record-sources.css';
import type { SourceCitationWithSource } from '$types/database';

export interface RecordSourcesProps {
  /** Section heading, e.g. "Sources" — tab-specific so each detail body owns its own copy. */
  title: string;
  count: number;
  /** `undefined` while the citations query is still loading. */
  citations: SourceCitationWithSource[] | undefined;
}

export function RecordSources({ title, count, citations }: RecordSourcesProps): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <div className={s.section}>
      <Typography weight="semibold">{title}</Typography>
      {count === 0 ? (
        <Typography size="xs" tone="muted">
          {t('records.unsourced')}
        </Typography>
      ) : (
        <ul className={s.sourcesList}>
          {(citations ?? []).map((citation) => (
            <li key={citation.id} className={s.sourceItem}>
              <Icon name="book-marked" size={14} />
              <Typography size="sm">{citation.source.title}</Typography>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
