import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import { useIndividuals } from '$/hooks/useIndividuals';
import { formatName } from '$/db/trees/names';
import type { IndividualWithDetails } from '$/types/database';
import { DataTable } from '$components/data-table';

interface IndividualsPageProps {
  treeId: string;
}

export function IndividualsPage({ treeId }: IndividualsPageProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const { data: individuals, isLoading, isError } = useIndividuals();

  const columns = useMemo<ColumnDef<IndividualWithDetails, string>[]>(
    () => [
      {
        accessorKey: 'id',
        header: t('columns.id'),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.id}</span>,
      },
      {
        id: 'name',
        header: t('columns.name'),
        accessorFn: (row) => formatName(row.primaryName).full,
        cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
      },
      {
        accessorKey: 'gender',
        header: t('columns.gender'),
        cell: ({ row }) => t(`gender.${row.original.gender}`),
      },
      {
        id: 'birth',
        header: t('columns.birth'),
        accessorFn: (row) => row.birthEvent?.dateOriginal ?? '',
      },
      {
        id: 'death',
        header: t('columns.death'),
        accessorFn: (row) => row.deathEvent?.dateOriginal ?? '',
      },
    ],
    [t]
  );

  if (isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">{tc('status.loading')}</p>;
  }

  if (isError) {
    return <p className="p-6 text-sm text-destructive">{tc('errors.loadFailed')}</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('title')}</h1>
      </div>

      {!individuals || individuals.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <DataTable
          columns={columns}
          data={individuals}
          searchPlaceholder={t('search')}
          onRowClick={(row) =>
            navigate({
              to: '/tree/$treeId/individual/$individualId',
              params: { treeId, individualId: row.id },
            })
          }
        />
      )}
    </div>
  );
}
