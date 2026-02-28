import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getTreeById } from '$/db/system/trees';
import { openTreeDb, isTreeDbOpen, getCurrentTreeFilename } from '$/db/connection';
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
          // Check if the correct tree DB is already open
          if (isTreeDbOpen() && getCurrentTreeFilename() === tree!.filename) {
            setDbReady(true);
            return;
          }

          // Open the tree database
          await openTreeDb(tree!.filename);
          setDbReady(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to open database');
        }
      }

      void ensureDbOpen();
    }, [tree]);

    if (treeLoading) {
      return <div style={{ padding: '2rem', color: '#666' }}>Loading tree...</div>;
    }

    if (!tree) {
      return <div style={{ padding: '2rem', color: '#c00' }}>Tree not found.</div>;
    }

    if (error) {
      return <div style={{ padding: '2rem', color: '#c00' }}>Error: {error}</div>;
    }

    if (!dbReady) {
      return <div style={{ padding: '2rem', color: '#666' }}>Opening database...</div>;
    }

    return <Outlet />;
  },
});
