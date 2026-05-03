import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import packageJson from '../../package.json';
import { AppStatusBar } from '$components/app-status-bar';
import { PreferencesPopover } from '$components/preferences-popover';
import { TreeCard, type TreeCardLabels } from '$components/trees/tree-card';
import { TreeCardCta } from '$components/trees/tree-card-cta';
import { TreeSectionDivider } from '$components/trees/tree-section-divider';
import { Button } from '$components/ui/button';
import { getAllTrees } from '$db-system/trees';
import { GedcomManager } from '$/managers/GedcomManager';
import { TreeManager } from '$/managers/TreeManager';
import { formatIsoDate } from '$lib/format';
import { queryKeys } from '$lib/query-keys';
import type { Tree } from '$/types/database';

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
  const queryClient = useQueryClient();
  const [sort, setSort] = useState<SortKey>('recent');
  const [importError, setImportError] = useState<string | null>(null);

  const {
    data: trees,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.trees,
    queryFn: getAllTrees,
  });

  const importMutation = useMutation({
    mutationFn: () => GedcomManager.importFromFile(),
    onSuccess: () => {
      setImportError(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
    },
    onError: (err) => {
      console.error('GEDCOM import failed:', err);
      setImportError(err instanceof Error ? err.message : t('common:errors.importFailed'));
    },
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

  const comingSoon = (): void => {
    window.alert(t('trees:actions.comingSoon'));
  };

  const handleOpen = async (treeId: string): Promise<void> => {
    try {
      await TreeManager.open(treeId);
      void navigate({ to: '/tree/$treeId', params: { treeId } });
    } catch (err) {
      console.error('Failed to open tree:', err);
      window.alert(t('common:errors.failedToOpenDatabase'));
    }
  };

  let treesContent: JSX.Element;
  if (error) {
    treesContent = <p className="text-muted-foreground">{t('common:errors.loadFailed')}</p>;
  } else if (isLoading) {
    treesContent = <p className="text-muted-foreground">{t('trees:loading')}</p>;
  } else {
    treesContent = (
      <>
        <div className="mt-9 mb-[18px]">
          <TreeSectionDivider
            label={t('trees:home.sectionLabel')}
            count={sortedTrees.length}
            sortOptions={sortOptions}
            sortValue={sort}
            onSortChange={(next) => setSort(next as SortKey)}
            sortAriaLabel={t('trees:home.sortAriaLabel')}
          />
        </div>

        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
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
              onExport={comingSoon}
              onEdit={comingSoon}
              onDelete={comingSoon}
            />
          ))}
          <TreeCardCta
            title={t('trees:cta.title')}
            subtitle={t('trees:cta.subtitle')}
            onClick={comingSoon}
          />
        </div>
      </>
    );
  }

  return (
    <div className="bg-background flex h-screen flex-col">
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1080px] px-14 pt-14 pb-10">
          <section className="mb-9 flex flex-col gap-1.5">
            <h1 className="text-foreground font-serif text-[56px] leading-none font-medium tracking-tight italic">
              {t('trees:home.title')}{' '}
              <span className="text-primary italic">{t('trees:home.titleAccent')}</span>
            </h1>
            <div className="mt-5 flex items-center gap-2.5">
              <Button leadingIcon="plus" onClick={comingSoon}>
                {t('trees:home.heroNew')}
              </Button>
              <Button
                variant="outline"
                leadingIcon="download"
                onClick={() => importMutation.mutate()}
                disabled={importMutation.isPending}
              >
                {t('trees:home.heroImport')}
              </Button>
            </div>
            {importError && (
              <p role="alert" className="text-destructive mt-2 text-sm">
                {importError}
              </p>
            )}
          </section>

          {treesContent}
        </div>
      </div>

      <AppStatusBar
        brandLabel={t('common:app.title')}
        version={packageJson.version}
        debugLabel={t('common:statusBar.debug')}
        debugShortcut="⌘D"
        onDebugClick={comingSoon}
        preferencesTrigger={
          <PreferencesPopover>
            <Button variant="outline" size="sm" leadingIcon="settings" className="font-mono">
              {t('common:statusBar.preferences')}
            </Button>
          </PreferencesPopover>
        }
      />
    </div>
  );
}
