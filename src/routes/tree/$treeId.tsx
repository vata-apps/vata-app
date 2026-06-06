import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { lazy, Suspense, useEffect, useState } from 'react';
import { getTreeById } from '$/db/system/trees';
import { openTreeDb, closeTreeDb, isTreeDbOpen, getCurrentTreePath } from '$/db/connection';
import { TreeShell } from '$components/tree-shell';
import { queryKeys } from '$lib/query-keys';

// DEV-only: lazy-loaded so the module is never bundled in production builds.
const DebugDrawer = import.meta.env.DEV
  ? lazy(() => import('$components/debug-drawer').then((m) => ({ default: m.DebugDrawer })))
  : null;

export const Route = createFileRoute('/tree/$treeId')({
  component: function TreeLayout() {
    const { t } = useTranslation(['common', 'trees']);
    const { treeId } = Route.useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [dbReady, setDbReady] = useState(false);
    const [dbError, setDbError] = useState(false);
    const [debugOpen, setDebugOpen] = useState(false);

    useEffect(() => {
      if (!import.meta.env.DEV) return;
      const handler = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
          e.preventDefault();
          setDebugOpen((prev) => !prev);
        }
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, []);

    const {
      data: tree,
      isLoading: treeLoading,
      error: treeQueryError,
    } = useQuery({
      queryKey: queryKeys.tree(treeId),
      queryFn: () => getTreeById(treeId),
    });

    useEffect(() => {
      if (!tree) return;
      setDbReady(false);
      setDbError(false);
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
          console.error('Failed to open tree database:', err);
          if (!cancelled) setDbError(true);
        }
      }

      void ensureDbOpen();
      return () => {
        cancelled = true;
      };
    }, [tree]);

    // Entity query keys (individuals, families, events, places, …) are not
    // tree-scoped, so the cache from one tree would be served for the next.
    // Vata is single-tree-at-a-time: when the open tree closes, its cached
    // data is void — clear it so the next tree fetches fresh.
    useEffect(() => {
      return () => {
        void closeTreeDb();
        queryClient.clear();
      };
    }, [queryClient]);

    useEffect(() => {
      let unlisten: UnlistenFn | undefined;
      let cancelled = false;
      let enabled = false;

      void listen('menu:close-tree', () => {
        void navigate({ to: '/' });
      })
        .then((fn) => {
          if (cancelled) {
            fn();
            return;
          }
          unlisten = fn;
          return invoke('set_close_tree_enabled', { enabled: true }).then(() => {
            if (cancelled) {
              void invoke('set_close_tree_enabled', { enabled: false }).catch(() => {});
            } else {
              enabled = true;
            }
          });
        })
        .catch((err) => {
          console.error('Failed to register Close Tree menu handler:', err);
        });

      return () => {
        cancelled = true;
        unlisten?.();
        if (enabled) {
          invoke('set_close_tree_enabled', { enabled: false }).catch((err) => {
            console.error('Failed to disable Close Tree menu item:', err);
          });
        }
      };
    }, [navigate]);

    if (treeLoading) {
      return <p>{t('trees:loadingOne')}</p>;
    }

    if (treeQueryError) {
      console.error('Failed to load tree:', treeQueryError);
      return <p>{t('common:errors.loadFailed')}</p>;
    }

    if (!tree) {
      return <p>{t('trees:notFound')}</p>;
    }

    if (dbError) {
      return <p>{t('common:errors.failedToOpenDatabase')}</p>;
    }

    if (!dbReady) {
      return <p>{t('trees:openingDb')}</p>;
    }

    return (
      <>
        <TreeShell>
          <Outlet />
        </TreeShell>
        {import.meta.env.DEV && DebugDrawer && (
          <Suspense fallback={null}>
            <DebugDrawer open={debugOpen} onOpenChange={setDebugOpen} />
          </Suspense>
        )}
      </>
    );
  },
});
