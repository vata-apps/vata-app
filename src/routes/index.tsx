import { Button } from '$/components/ui/button/button';
import { getAllTrees } from '$/db/system/trees';
import { queryKeys } from '$/lib/query-keys';
import { TreeManager } from '$/managers/TreeManager';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'trees']);

  const {
    data: trees,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.trees,
    queryFn: getAllTrees,
  });

  const handleOpen = async (treeId: string): Promise<void> => {
    try {
      await TreeManager.open(treeId);
      void navigate({ to: '/tree/$treeId', params: { treeId } });
    } catch (err) {
      console.error('Failed to open tree:', err);
      window.alert(t('common:errors.failedToOpenDatabase'));
    }
  };

  return (
    <div style={{ padding: '3rem' }}>
      {isLoading && <div>Loading trees...</div>}
      {error && (
        <div>
          Error: {error.name} - {error.message}
        </div>
      )}

      {trees?.map((tree) => (
        <Button onClick={() => void handleOpen(tree.id)}>{tree.name}</Button>
      ))}
    </div>
  );
}
