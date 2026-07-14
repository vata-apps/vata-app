import { useMemo } from 'react';
import { Link as RouterLink } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { EntityTable, rowLink, type EntityTableColumn } from '$components/entity-table';
import { Badge } from '$components/ui/badge';
import { Typography } from '$components/ui/typography';
import type { RelationRow } from '$components/person-relations/relations-types';
import { usePersonRelations } from '$hooks/usePersonRelations';

import * as styles from './list-page.css';

interface PersonRelationsPageProps {
  treeId: string;
  individualId: string;
}

/** The Name cell: a link to that person's Overview, or the missing-parent state for an unrecorded Father/Mother slot. */
function NameCell({ row, treeId }: { row: RelationRow; treeId: string }): JSX.Element {
  const { t } = useTranslation('individuals');

  if (row.id === null) {
    const missingKey = row.relation === 'father' ? 'missingFather' : 'missingMother';
    return (
      <Typography tone="muted" size="13">
        {t(`overview.parents.${missingKey}`)}
      </Typography>
    );
  }

  return (
    <RouterLink
      to="/tree/$treeId/individual/$individualId"
      params={{ treeId, individualId: row.id }}
      className={rowLink}
    >
      {row.name}
    </RouterLink>
  );
}

/** The Relation cell: the sex-specific label, a paternal/maternal badge for half-siblings, and a `via` note. */
function RelationCell({ row }: { row: RelationRow }): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Typography size="13">{t(`relations.labels.${row.relation}`)}</Typography>
        {row.side && <Badge>{t(`relations.side.${row.side}`)}</Badge>}
      </div>
      {row.viaName && (
        <Typography tone="muted" size="12.5">
          {t('relations.via', { name: row.viaName })}
        </Typography>
      )}
    </div>
  );
}

/**
 * The Relations tab of a person: every direct relation (parents, siblings,
 * half-siblings, spouses, children) in one sortable table. Read-only —
 * rows with a recorded person link to that person's Overview; Father/Mother
 * are fixed slots that always render, even when unrecorded.
 */
export function PersonRelationsPage({
  treeId,
  individualId,
}: PersonRelationsPageProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isError } = usePersonRelations(individualId);

  const columns = useMemo<EntityTableColumn<RelationRow>[]>(
    () => [
      {
        key: 'name',
        header: t('relations.table.columns.name'),
        rowHeader: true,
        cell: (row) => <NameCell row={row} treeId={treeId} />,
        sortValue: (row) => row.name || null,
      },
      {
        key: 'relation',
        header: t('relations.table.columns.relation'),
        cell: (row) => <RelationCell row={row} />,
      },
      {
        key: 'born',
        header: t('relations.table.columns.born'),
        cell: (row) => row.bornYear ?? '—',
        sortValue: (row) => row.bornYear ?? null,
      },
      {
        key: 'died',
        header: t('relations.table.columns.died'),
        cell: (row) => row.deathYear ?? '—',
        sortValue: (row) => row.deathYear ?? null,
      },
    ],
    [t, treeId]
  );

  return (
    <div className={styles.tableWrapper}>
      <EntityTable
        label={t('overview.tabs.relations')}
        columns={columns}
        rows={data ?? []}
        getRowKey={(row) => row.id ?? row.relation}
        isLoading={isLoading}
        isError={isError}
        errorMessage={tCommon('errors.loadFailed')}
        emptyMessage={t('relations.table.empty')}
        defaultSort={{ columnKey: 'name', direction: 'asc' }}
      />
    </div>
  );
}
