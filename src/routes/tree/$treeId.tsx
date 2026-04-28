import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getTreeById } from '$/db/system/trees';
import { openTreeDb, closeTreeDb, isTreeDbOpen, getCurrentTreePath } from '$/db/connection';
import { queryKeys } from '$lib/query-keys';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/tree/$treeId')({
  component: function TreeLayout() {
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
      return <p>Loading tree...</p>;
    }

    if (!tree) {
      return <p>Tree not found.</p>;
    }

    if (error) {
      return <p>Error: {error}</p>;
    }

    if (!dbReady) {
      return <p>Opening database...</p>;
    }

    return <Outlet />;
  },
});
