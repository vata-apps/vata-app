import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTreeById } from '$/db/system/trees';
import { openTreeDb, closeTreeDb, isTreeDbOpen, getCurrentTreePath } from '$/db/connection';
import { queryKeys } from '$lib/query-keys';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/tree/$treeId')({
  component: function TreeLayout() {
    const { t } = useTranslation('common');
    const { treeId } = Route.useParams();
    const [dbReady, setDbReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: tree, isLoading: treeLoading } = useQuery({
      queryKey: queryKeys.tree(treeId),
      queryFn: () => getTreeById(treeId),
    });

    useEffect(() => {
      if (!tree) return;

      async function ensureDbOpen() {
        try {
          if (isTreeDbOpen() && getCurrentTreePath() === tree!.path) {
            setDbReady(true);
            return;
          }

          await openTreeDb(tree!.path);
          setDbReady(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to open database');
        }
      }

      void ensureDbOpen();
    }, [tree]);

    useEffect(() => {
      return () => {
        void closeTreeDb();
      };
    }, []);

    if (treeLoading) {
      return <p>{t('tree.loading')}</p>;
    }

    if (!tree) {
      return <p>{t('tree.notFound')}</p>;
    }

    if (error) {
      return <p>{t('errors.withMessage', { message: error })}</p>;
    }

    if (!dbReady) {
      return <p>{t('tree.openingDb')}</p>;
    }

    return <Outlet />;
  },
});
