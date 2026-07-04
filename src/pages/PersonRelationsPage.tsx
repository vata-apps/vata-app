import { useMemo } from 'react';
import { Link as RouterLink, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Badge, Flex, Link, Text } from '@radix-ui/themes';

import { EntityTable, type EntityTableColumn } from '$components/entity-table';
import type { RelationRow } from '$components/person-relations/relations-types';
import { usePersonRelations } from '$hooks/usePersonRelations';

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
      <Text color="gray" size="2">
        {t(`overview.parents.${missingKey}`)}
      </Text>
    );
  }

  return (
    <Link
      asChild
      color="gray"
      highContrast
      underline="none"
      onClick={(domEvent) => domEvent.stopPropagation()}
    >
      <RouterLink
        to="/tree/$treeId/individual/$individualId"
        params={{ treeId, individualId: row.id }}
      >
        {row.name}
      </RouterLink>
    </Link>
  );
}

/** The Relation cell: the sex-specific label, a paternal/maternal badge for half-siblings, and a `via` note. */
function RelationCell({ row }: { row: RelationRow }): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <Flex direction="column" gap="1">
      <Flex align="center" gap="2">
        <Text size="2">{t(`relations.labels.${row.relation}`)}</Text>
        {row.side && (
          <Badge variant="soft" color="indigo" radius="full">
            {t(`relations.side.${row.side}`)}
          </Badge>
        )}
      </Flex>
      {row.viaName && (
        <Text size="1" color="gray">
          {t('relations.via', { name: row.viaName })}
        </Text>
      )}
    </Flex>
  );
}

/**
 * The Relations tab of a person: every direct relation (parents, siblings,
 * half-siblings, spouses, children) in one sortable table. Read-only —
 * a row click opens that person's Overview; Father/Mother are fixed slots
 * that always render, even when unrecorded.
 */
export function PersonRelationsPage({
  treeId,
  individualId,
}: PersonRelationsPageProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
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
    <EntityTable
      label={t('overview.tabs.relations')}
      columns={columns}
      rows={data ?? []}
      getRowKey={(row) => row.id ?? row.relation}
      onRowClick={(row) => {
        if (!row.id) return;
        navigate({
          to: '/tree/$treeId/individual/$individualId',
          params: { treeId, individualId: row.id },
        });
      }}
      isLoading={isLoading}
      isError={isError}
      errorMessage={tCommon('errors.loadFailed')}
      emptyMessage={t('relations.table.empty')}
    />
  );
}
