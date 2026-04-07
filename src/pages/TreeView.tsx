import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTreeById } from '$/db/system/trees';
import { queryKeys } from '$lib/query-keys';

interface TreeViewPageProps {
  treeId: string;
}

export function TreeViewPage({ treeId }: TreeViewPageProps) {
  const { t } = useTranslation('common');
  const { data: tree, isLoading } = useQuery({
    queryKey: queryKeys.tree(treeId),
    queryFn: () => getTreeById(treeId),
  });

  if (isLoading) {
    return <p className="p-6 text-muted-foreground">{t('status.loading')}</p>;
  }

  if (!tree) {
    return <p className="p-6 text-destructive">{t('errors.notFound')}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">{tree.name}</h1>
      {tree.description && <p className="mb-4 text-sm text-muted-foreground">{tree.description}</p>}
      <div className="flex gap-6 text-sm text-muted-foreground">
        <span>{tree.individualCount} individuals</span>
        <span>{tree.familyCount} families</span>
      </div>
    </div>
  );
}
