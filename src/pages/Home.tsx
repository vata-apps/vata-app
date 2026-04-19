import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { remove } from '@tauri-apps/plugin-fs';
import { ArrowRight, Bug, Download, FolderOpen, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { createTree, deleteTree, getAllTrees, markTreeOpened, updateTree } from '$/db/system/trees';
import type { Tree } from '$/types/database';
import { formatIsoDate } from '$lib/format';
import { openTreeDb } from '$/db/connection';
import { useAppStore } from '$/store/app-store';
import { useThemeSync } from '$hooks/useThemeSync';
import { queryKeys } from '$lib/query-keys';
import { getTreePathForSlug, slugifyTreeName } from '$lib/tree-paths';
import { GedcomManager } from '$/managers/GedcomManager';
import { NewTreeModal } from '$components/home/NewTreeModal';
import { ImportTreeModal } from '$components/home/ImportTreeModal';
import { EditTreeModal } from '$components/home/EditTreeModal';
import { DownloadTreeModal } from '$components/home/DownloadTreeModal';
import { DeleteTreeModal } from '$components/home/DeleteTreeModal';
import { PreferencesMenu } from '$components/home/PreferencesMenu';
import { DebugDrawer } from '$components/home/DebugDrawer';
import { Shortcut } from '$components/ui/shortcut';

type SortKey = 'recent' | 'name' | 'size';

function sortTrees(trees: Tree[], key: SortKey): Tree[] {
  const copy = [...trees];
  if (key === 'name') return copy.sort((a, b) => a.name.localeCompare(b.name));
  if (key === 'size') return copy.sort((a, b) => b.individualCount - a.individualCount);
  return copy.sort((a, b) => {
    const aT = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0;
    const bT = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0;
    return bT - aT;
  });
}

export function HomePage() {
  const { t } = useTranslation('home');
  useThemeSync();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setCurrentTree = useAppStore((s) => s.setCurrentTree);

  const [sort, setSort] = useState<SortKey>('recent');
  const [modal, setModal] = useState<
    | { kind: 'none' }
    | { kind: 'new' }
    | { kind: 'import' }
    | { kind: 'edit'; treeId: string }
    | { kind: 'download'; treeId: string }
    | { kind: 'delete'; treeId: string }
  >({ kind: 'none' });

  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setShowDebug((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const { data: trees = [] } = useQuery({
    queryKey: queryKeys.trees,
    queryFn: getAllTrees,
  });

  const sortedTrees = useMemo(() => sortTrees(trees, sort), [trees, sort]);

  const selectedTree =
    (modal.kind === 'edit' || modal.kind === 'download' || modal.kind === 'delete'
      ? trees.find((tr) => tr.id === modal.treeId)
      : null) ?? null;

  const closeModal = () => {
    createMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
    setModal({ kind: 'none' });
  };

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const slug = slugifyTreeName(data.name) || crypto.randomUUID();
      const treePath = await getTreePathForSlug(slug);
      return createTree({ name: data.name, path: treePath, description: data.description });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; name: string; description?: string }) =>
      updateTree(data.id, { name: data.name, description: data.description }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      treePath,
      exportBefore,
      treeName,
    }: {
      id: string;
      treePath: string;
      exportBefore: boolean;
      treeName: string;
    }): Promise<{ deleted: boolean }> => {
      if (exportBefore) {
        await openTreeDb(treePath);
        const saved = await GedcomManager.exportToFile(treeName, false);
        if (!saved) return { deleted: false };
      }
      await deleteTree(id);
      try {
        await remove(treePath, { recursive: true });
      } catch {
        // Folder may not exist.
      }
      return { deleted: true };
    },
    onSuccess: (result) => {
      if (!result.deleted) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      closeModal();
    },
  });

  const openMutation = useMutation({
    mutationFn: async (tree: { id: string; path: string }) => {
      await openTreeDb(tree.path);
      await markTreeOpened(tree.id);
      setCurrentTree(tree.id);
      return tree.id;
    },
    onSuccess: (treeId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      void navigate({ to: '/tree/$treeId', params: { treeId } });
    },
  });

  return (
    <>
      <div className="home-frame">
        <div className="home-window">
          <div className="home-body">
            <div className="home-container">
              <section className="home-hero">
                <h1 className="home-display">
                  {t('hero.titleLead')}{' '}
                  <span className="home-display-accent">{t('hero.titleAccent')}</span>
                  {t('hero.titleTail') ? ` ${t('hero.titleTail')}` : ''}
                </h1>
                <div className="home-hero-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setModal({ kind: 'new' })}
                  >
                    <Plus strokeWidth={1.8} />
                    {t('actions.newTree')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setModal({ kind: 'import' })}
                  >
                    <Upload strokeWidth={1.6} />
                    {t('actions.importGedcom')}
                  </button>
                </div>
              </section>

              <div className="home-meta-divider">
                <span className="home-meta-label">{t('sectionLabel')}</span>
                <span className="badge badge-outline badge-mono">{trees.length}</span>
                <span className="home-meta-rule" />
                <div className="home-seg">
                  <button
                    type="button"
                    className={sort === 'recent' ? 'on' : ''}
                    onClick={() => setSort('recent')}
                  >
                    {t('sort.recent')}
                  </button>
                  <button
                    type="button"
                    className={sort === 'name' ? 'on' : ''}
                    onClick={() => setSort('name')}
                  >
                    {t('sort.name')}
                  </button>
                  <button
                    type="button"
                    className={sort === 'size' ? 'on' : ''}
                    onClick={() => setSort('size')}
                  >
                    {t('sort.size')}
                  </button>
                </div>
              </div>

              <div className="home-grid">
                {sortedTrees.map((tree) => (
                  <article key={tree.id} className="tcard">
                    <div className="tcard-title-row">
                      <h3 className="tcard-h3">{tree.name}</h3>
                      {tree.description && <p className="tcard-desc">{tree.description}</p>}
                    </div>

                    <div className="tcard-stats">
                      <Stat n={tree.individualCount} l={t('treeCard.individuals')} />
                      <span className="tcard-vrule" />
                      <Stat n={tree.familyCount} l={t('treeCard.families')} />
                      <span className="tcard-vrule" />
                      <Stat n="—" l={t('treeCard.generations')} />
                    </div>

                    <div className="tcard-meta-rows">
                      <MetaRow k={t('treeCard.created')} v={formatIsoDate(tree.createdAt)} />
                      <MetaRow
                        k={t('treeCard.lastOpened')}
                        v={
                          tree.lastOpenedAt
                            ? formatIsoDate(tree.lastOpenedAt)
                            : t('treeCard.neverOpened')
                        }
                      />
                    </div>

                    <div className="tcard-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm tcard-open"
                        onClick={() => {
                          if (openMutation.isPending) return;
                          openMutation.mutate({ id: tree.id, path: tree.path });
                        }}
                        aria-disabled={openMutation.isPending}
                      >
                        <FolderOpen strokeWidth={1.6} />
                        {t('treeCard.cardActions.open')}
                        <ArrowRight strokeWidth={1.6} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-icon btn-ghost btn-sm"
                        aria-label={t('treeCard.cardActions.export')}
                        onClick={() => setModal({ kind: 'download', treeId: tree.id })}
                      >
                        <Download strokeWidth={1.6} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-icon btn-ghost btn-sm"
                        aria-label={t('treeCard.cardActions.rename')}
                        onClick={() => setModal({ kind: 'edit', treeId: tree.id })}
                      >
                        <Pencil strokeWidth={1.6} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-icon btn-ghost btn-sm"
                        aria-label={t('treeCard.cardActions.delete')}
                        onClick={() => setModal({ kind: 'delete', treeId: tree.id })}
                      >
                        <Trash2 strokeWidth={1.6} />
                      </button>
                    </div>
                  </article>
                ))}

                <article
                  className="tcard tcard-cta"
                  role="button"
                  tabIndex={0}
                  onClick={() => setModal({ kind: 'new' })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setModal({ kind: 'new' });
                    }
                  }}
                >
                  <div>
                    <div className="tcard-cta-plus">
                      <Plus size={20} strokeWidth={1.6} />
                    </div>
                    <div className="tcard-cta-title">{t('cta.title')}</div>
                    <div className="tcard-cta-subtitle">{t('cta.subtitle')}</div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div className="home-statusbar">
            <span>{t('statusbar.appName')}</span>
            <span>·</span>
            <span>{t('statusbar.version', { version: __APP_VERSION__ })}</span>
            <span className="home-statusbar-spacer" />
            {import.meta.env.DEV && (
              <button
                type="button"
                className="statusbar-btn"
                onClick={() => setShowDebug((v) => !v)}
                aria-pressed={showDebug}
              >
                <Bug size={12} strokeWidth={1.6} />
                {t('statusbar.debug')}
                <Shortcut keys={['⌘', 'D']} />
              </button>
            )}
            <PreferencesMenu />
          </div>
        </div>
      </div>

      <NewTreeModal
        open={modal.kind === 'new'}
        onClose={closeModal}
        onSubmit={(data) =>
          createMutation.mutate({ name: data.name, description: data.description })
        }
        isPending={createMutation.isPending}
        error={createMutation.error ? String(createMutation.error) : null}
      />

      <ImportTreeModal
        open={modal.kind === 'import'}
        onClose={closeModal}
        onSuccess={(treeId) => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
          closeModal();
          void navigate({ to: '/tree/$treeId', params: { treeId } });
        }}
      />

      <EditTreeModal
        open={modal.kind === 'edit'}
        onClose={closeModal}
        tree={selectedTree}
        onSubmit={(data) =>
          selectedTree &&
          updateMutation.mutate({
            id: selectedTree.id,
            name: data.name,
            description: data.description,
          })
        }
        isPending={updateMutation.isPending}
        error={updateMutation.error ? String(updateMutation.error) : null}
      />

      <DownloadTreeModal
        open={modal.kind === 'download'}
        onClose={closeModal}
        tree={selectedTree}
        onSuccess={closeModal}
      />

      <DeleteTreeModal
        open={modal.kind === 'delete'}
        onClose={closeModal}
        tree={selectedTree}
        onConfirm={({ exportBefore }) =>
          selectedTree &&
          deleteMutation.mutate({
            id: selectedTree.id,
            treePath: selectedTree.path,
            exportBefore,
            treeName: selectedTree.name,
          })
        }
        isPending={deleteMutation.isPending}
        error={deleteMutation.error ? String(deleteMutation.error) : null}
      />

      {import.meta.env.DEV && <DebugDrawer open={showDebug} onClose={() => setShowDebug(false)} />}
    </>
  );
}

function Stat({ n, l }: { n: number | string; l: string }) {
  return (
    <div className="tcard-stat">
      <span className="tcard-stat-n">{n}</span>
      <span className="tcard-stat-l">{l}</span>
    </div>
  );
}

function MetaRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="tcard-meta-row">
      <span className="tcard-meta-k">{k}</span>
      <span className="tcard-meta-v">{v}</span>
    </div>
  );
}
