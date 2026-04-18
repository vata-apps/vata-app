import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import { useFamilies } from '$/hooks/useFamilies';
import { formatName } from '$/db/trees/names';
import type { FamilyWithMembers } from '$/types/database';
import { DataTable } from '$components/data-table';

interface FamiliesPageProps {
  treeId: string;
}

export function FamiliesPage({ treeId }: FamiliesPageProps): JSX.Element {
  const { t } = useTranslation('families');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const { data: families, isLoading, isError } = useFamilies();

  const columns = useMemo<ColumnDef<FamilyWithMembers, string>[]>(
    () => [
      {
        accessorKey: 'id',
        header: t('columns.id'),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.id}</span>,
      },
      {
        id: 'husband',
        header: t('columns.husband'),
        accessorFn: (row) => formatName(row.husband?.primaryName ?? null).full,
        cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
      },
      {
        id: 'wife',
        header: t('columns.wife'),
        accessorFn: (row) => formatName(row.wife?.primaryName ?? null).full,
        cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
      },
      {
        id: 'children',
        header: t('columns.children'),
        accessorFn: (row) => String(row.children.length),
        cell: ({ row }) => row.original.children.length,
      },
      {
        id: 'marriage',
        header: t('columns.marriage'),
        accessorFn: (row) => row.marriageEvent?.dateOriginal ?? '',
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

      {!families || families.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <DataTable
          columns={columns}
          data={families}
          searchPlaceholder={t('search')}
          onRowClick={(row) =>
            navigate({
              to: '/tree/$treeId/family/$familyId',
              params: { treeId, familyId: row.id },
            })
          }
        />
      )}
    </div>
  );
}
