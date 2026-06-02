import { useMemo } from 'react';
import { Link as RouterLink, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Flex, Link } from '@radix-ui/themes';

import { EntityTable, type EntityTableColumn } from '$components/entity-table';
import { useIndividuals } from '$hooks/useIndividuals';
import { sortByKey } from '$lib/sortByKey';
import { formatName } from '$db-tree/names';
import type { IndividualWithDetails, Name } from '$types/database';

interface IndividualsPageProps {
  treeId: string;
}

/** Year of an event, read from its normalized `YYYY-MM-DD` sort date. */
function eventYear(event: { dateSort: string | null } | null): string | null {
  return event?.dateSort ? event.dateSort.slice(0, 4) : null;
}

/**
 * Avatar initials for a name — the first given-name letter and the first
 * surname letter, uppercased; falling back to the nickname, then `?`.
 */
function initialsOf(name: Name | null): string {
  if (!name) return '?';
  const given = name.givenNames?.trim().split(/\s+/)[0]?.charAt(0) ?? '';
  const surname = name.surname?.trim().charAt(0) ?? '';
  const initials = (given + surname).toUpperCase();
  if (initials) return initials;
  const nickname = name.nickname?.trim().charAt(0);
  return nickname ? nickname.toUpperCase() : '?';
}

/**
 * The People section page — the full-width table of every person in the
 * open tree. A row click opens that individual's detail route.
 */
export function IndividualsPage({ treeId }: IndividualsPageProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { data, isLoading, isError } = useIndividuals();

  const rows = useMemo(
    () =>
      data ? sortByKey(data, (person) => formatName(person.primaryName).sortable || null) : [],
    [data]
  );

  const columns = useMemo<EntityTableColumn<IndividualWithDetails>[]>(
    () => [
      {
        key: 'name',
        header: t('table.columns.name'),
        rowHeader: true,
        cell: (person) => {
          const name = person.primaryName;
          const display = name ? formatName(name).surnameFirst : t('table.unknownName');
          return (
            <Flex align="center" gap="2">
              <Avatar
                size="1"
                radius="full"
                variant="soft"
                color="gray"
                fallback={initialsOf(name)}
              />
              <Link asChild onClick={(event) => event.stopPropagation()}>
                <RouterLink
                  to="/tree/$treeId/individual/$individualId"
                  params={{ treeId, individualId: person.id }}
                >
                  {display}
                </RouterLink>
              </Link>
            </Flex>
          );
        },
      },
      {
        key: 'sex',
        header: t('table.columns.sex'),
        width: '100px',
        cell: (person) => t(`table.sex.${person.gender}`),
      },
      {
        key: 'birth',
        header: t('table.columns.birth'),
        width: '120px',
        cell: (person) => eventYear(person.birthEvent) ?? '—',
      },
      {
        key: 'death',
        header: t('table.columns.death'),
        width: '120px',
        cell: (person) => (person.isLiving ? '—' : (eventYear(person.deathEvent) ?? '—')),
      },
    ],
    [t, treeId]
  );

  return (
    <Box p="4">
      <EntityTable
        label={tCommon('nav.individuals')}
        columns={columns}
        rows={rows}
        getRowKey={(person) => person.id}
        onRowClick={(person) =>
          navigate({
            to: '/tree/$treeId/individual/$individualId',
            params: { treeId, individualId: person.id },
          })
        }
        isLoading={isLoading}
        isError={isError}
        errorMessage={tCommon('errors.loadFailed')}
        emptyMessage={t('table.empty')}
      />
    </Box>
  );
}
