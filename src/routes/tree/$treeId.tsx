import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTreeById } from '$/db/system/trees';
import { openTreeDb, closeTreeDb, isTreeDbOpen, getCurrentTreePath } from '$/db/connection';
import { queryKeys } from '$lib/query-keys';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/tree/$treeId')({
  component: function TreeLayout() {
    const { t } = useTranslation(['common', 'trees']);
    const { treeId } = Route.useParams();
    const [dbReady, setDbReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: tree, isLoading: treeLoading } = useQuery({
      queryKey: queryKeys.tree(treeId),
      queryFn: () => getTreeById(treeId),
    });

    useEffect(() => {
      if (!tree) return;
      setDbReady(false);
      setError(null);
      let cancelled = false;

      async function ensureDbOpen(): Promise<void> {
        try {
          if (isTreeDbOpen() && getCurrentTreePath() === tree!.path) {
            if (!cancelled) setDbReady(true);
            return;
          }

          await openTreeDb(tree!.path);
          if (!cancelled) setDbReady(true);
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : t('common:errors.failedToOpenDatabase'));
          }
        }
      }

      void ensureDbOpen();
      return () => {
        cancelled = true;
      };
    }, [tree, t]);

    useEffect(() => {
      return () => {
        void closeTreeDb();
      };
    }, []);

    if (treeLoading) {
      return <p>{t('trees:loadingOne')}</p>;
    }

    if (!tree) {
      return <p>{t('trees:notFound')}</p>;
    }

    if (error) {
      return <p>{t('common:errors.withMessage', { message: error })}</p>;
    }

    if (!dbReady) {
      return <p>{t('trees:openingDb')}</p>;
    }

    return <Outlet />;
  },
});
