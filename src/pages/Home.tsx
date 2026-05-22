import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Flex, Grid, Heading, Text } from '@radix-ui/themes';

import packageJson from '../../package.json';
import { AppStatusBar } from '$components/app-status-bar';
import { Icon } from '$components/icon';
import { PreferencesPopover } from '$components/preferences-popover';
import { DeleteTreeModal } from '$components/trees/delete-tree-modal';
import { DownloadTreeModal } from '$components/trees/download-tree-modal';
import { EditTreeModal } from '$components/trees/edit-tree-modal';
import { ImportGedcomModal } from '$components/trees/import-gedcom-modal';
import { NewTreeModal } from '$components/trees/new-tree-modal';
import { TreeCard, type TreeCardLabels } from '$components/trees/tree-card';
import { TreeCardCta } from '$components/trees/tree-card-cta';
import { TreeSectionDivider } from '$components/trees/tree-section-divider';
import { getAllTrees } from '$db-system/trees';
import { TreeManager } from '$managers/TreeManager';
import { formatIsoDate } from '$lib/format';
import { queryKeys } from '$lib/query-keys';
import type { Tree } from '$types/database';

// DEV-only: lazy-loaded so the module (and its Tauri DB imports) are never
// bundled in production builds where import.meta.env.DEV is false.
const DebugDrawer = import.meta.env.DEV
  ? lazy(() => import('$components/debug-drawer').then((m) => ({ default: m.DebugDrawer })))
  : null;

type SortKey = 'recent' | 'name' | 'size';

function sortTrees(trees: Tree[], key: SortKey): Tree[] {
  const copy = [...trees];
  if (key === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else if (key === 'size') {
    copy.sort((a, b) => b.individualCount - a.individualCount);
  } else {
    copy.sort((a, b) => {
      const aTime = a.lastOpenedAt ?? a.createdAt;
      const bTime = b.lastOpenedAt ?? b.createdAt;
      return bTime.localeCompare(aTime);
    });
  }
  return copy;
}

export function HomePage(): JSX.Element {
  const { t } = useTranslation(['common', 'trees']);
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortKey>('recent');
  const [newTreeOpen, setNewTreeOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportingTree, setExportingTree] = useState<Tree | null>(null);
  const [editingTree, setEditingTree] = useState<Tree | null>(null);
  const [deletingTree, setDeletingTree] = useState<Tree | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);

  // Register ⌘D / Ctrl+D shortcut to toggle the debug drawer (DEV only)
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
    data: trees,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.trees,
    queryFn: getAllTrees,
  });

  const sortedTrees = useMemo<Tree[]>(() => (trees ? sortTrees(trees, sort) : []), [trees, sort]);

  const cardLabels: TreeCardLabels = {
    open: t('trees:card.open'),
    export: t('trees:card.export'),
    edit: t('trees:card.edit'),
    delete: t('trees:card.delete'),
    individuals: t('trees:card.individuals'),
    families: t('trees:card.families'),
    generations: t('trees:card.generations'),
    createdAt: t('trees:card.createdAt'),
    lastAccessedAt: t('trees:card.lastAccessedAt'),
  };

  const sortOptions = [
    { value: 'recent', label: t('trees:home.sortRecent') },
    { value: 'name', label: t('trees:home.sortName') },
    { value: 'size', label: t('trees:home.sortSize') },
  ];

  const handleOpen = async (treeId: string): Promise<void> => {
    try {
      await TreeManager.open(treeId);
      void navigate({ to: '/tree/$treeId', params: { treeId } });
    } catch (err) {
      console.error('Failed to open tree:', err);
      window.alert(t('common:errors.failedToOpenDatabase'));
    }
  };

  const treesContent = ((): JSX.Element => {
    if (error) return <Text color="gray">{t('common:errors.loadFailed')}</Text>;
    if (isLoading) return <Text color="gray">{t('trees:loading')}</Text>;
    return (
      <>
        <Box style={{ marginTop: 'clamp(48px, 7vw, 76px)', marginBottom: 22 }}>
          <TreeSectionDivider
            label={t('trees:home.sectionLabel')}
            count={sortedTrees.length}
            sortOptions={sortOptions}
            sortValue={sort}
            onSortChange={(next) => setSort(next as SortKey)}
            sortAriaLabel={t('trees:home.sortAriaLabel')}
          />
        </Box>

        <Grid className="trees-grid" gap="5">
          {sortedTrees.map((tree) => (
            <TreeCard
              key={tree.id}
              name={tree.name}
              description={tree.description ?? undefined}
              stats={{
                individuals: tree.individualCount,
                families: tree.familyCount,
              }}
              meta={{
                createdAt: formatIsoDate(tree.createdAt),
                lastAccessedAt: formatIsoDate(tree.lastOpenedAt),
              }}
              labels={cardLabels}
              onOpen={() => void handleOpen(tree.id)}
              onExport={() => setExportingTree(tree)}
              onEdit={() => setEditingTree(tree)}
              onDelete={() => setDeletingTree(tree)}
            />
          ))}
          <TreeCardCta
            title={t('trees:cta.title')}
            subtitle={t('trees:cta.subtitle')}
            onClick={() => setNewTreeOpen(true)}
          />
        </Grid>
      </>
    );
  })();

  return (
    <Flex direction="column" height="100vh">
      <Box
        flexGrow="1"
        overflow="auto"
        style={{
          backgroundImage:
            'radial-gradient(800px 500px at 8% 0%, var(--accent-a2), transparent 70%), ' +
            'radial-gradient(600px 400px at 100% 100%, var(--accent-a1), transparent 70%)',
        }}
      >
        <Box
          style={{
            maxWidth: 1480,
            marginInline: 'auto',
            paddingInline: 'clamp(28px, 6vw, 88px)',
            paddingTop: 'clamp(48px, 8vw, 96px)',
            paddingBottom: 56,
          }}
        >
          <Box style={{ marginBottom: 'clamp(32px, 5vw, 56px)' }}>
            <Heading
              as="h1"
              weight="regular"
              style={{
                fontSize: 'clamp(40px, 6vw, 80px)',
                lineHeight: 1.04,
                letterSpacing: '-0.035em',
                textWrap: 'balance',
              }}
            >
              {t('trees:home.title')}{' '}
              <span style={{ color: 'var(--accent-10)' }}>{t('trees:home.titleAccent')}</span>
            </Heading>
            <Flex align="center" gap="3" mt="6" wrap="wrap">
              <Button size="3" onClick={() => setNewTreeOpen(true)}>
                <Icon name="plus" size={16} />
                {t('trees:home.heroNew')}
              </Button>
              <Button size="3" variant="soft" onClick={() => setImportOpen(true)}>
                <Icon name="download" size={16} />
                {t('trees:home.heroImport')}
              </Button>
            </Flex>
          </Box>

          {treesContent}
        </Box>
      </Box>

      <AppStatusBar
        brandLabel={t('common:app.title')}
        version={packageJson.version}
        debug={
          import.meta.env.DEV
            ? {
                label: t('common:statusBar.debug'),
                shortcut: '⌘D',
                onClick: () => setDebugOpen((prev) => !prev),
              }
            : undefined
        }
        preferencesTrigger={
          <PreferencesPopover>
            <Button variant="soft" size="2" color="gray">
              <Icon name="settings" size={16} />
              {t('common:statusBar.preferences')}
            </Button>
          </PreferencesPopover>
        }
      />

      <NewTreeModal open={newTreeOpen} onOpenChange={setNewTreeOpen} />
      <ImportGedcomModal open={importOpen} onOpenChange={setImportOpen} />
      <DownloadTreeModal
        tree={exportingTree}
        open={exportingTree !== null}
        onOpenChange={(next) => {
          if (!next) setExportingTree(null);
        }}
      />
      <DeleteTreeModal
        tree={deletingTree}
        open={deletingTree !== null}
        onOpenChange={(next) => {
          if (!next) setDeletingTree(null);
        }}
      />
      {editingTree && (
        <EditTreeModal
          tree={editingTree}
          open={true}
          onOpenChange={(next) => {
            if (!next) setEditingTree(null);
          }}
        />
      )}

      {import.meta.env.DEV && DebugDrawer && (
        <Suspense fallback={null}>
          <DebugDrawer open={debugOpen} onOpenChange={setDebugOpen} />
        </Suspense>
      )}
    </Flex>
  );
}
