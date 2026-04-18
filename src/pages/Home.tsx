import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { remove } from '@tauri-apps/plugin-fs';
import { Trans, useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Check,
  Download,
  FileUp,
  FolderOpen,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import { createTree, deleteTree, getAllTrees, markTreeOpened, updateTree } from '$/db/system/trees';
import { openTreeDb } from '$/db/connection';
import { useAppStore } from '$/store/app-store';
import { queryKeys } from '$lib/query-keys';
import { getTreePathForSlug, slugifyTreeName } from '$lib/tree-paths';
import { cn } from '$lib/utils';
import type { Tree } from '$/types/database';
import { ConfirmDialog } from '$components/ConfirmDialog';
import { ExportGedcomModal } from '$components/ExportGedcomModal';
import { ImportGedcomModal } from '$components/ImportGedcomModal';
import { NewTreeModal } from '$components/NewTreeModal';
import { Button } from '$components/ui/button';
import { Input } from '$components/ui/input';

type SortMode = 'recent' | 'name' | 'size';

export function HomePage() {
  const { t } = useTranslation('home');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setCurrentTree = useAppStore((s) => s.setCurrentTree);

  const [showNewForm, setShowNewForm] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportTreeId, setExportTreeId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const { data: trees, isLoading } = useQuery({
    queryKey: queryKeys.trees,
    queryFn: getAllTrees,
  });

  const sortedTrees = useMemo(() => {
    if (!trees) return [] as Tree[];
    const copy = [...trees];
    switch (sortMode) {
      case 'name':
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case 'size':
        return copy.sort(
          (a, b) => b.individualCount + b.familyCount - (a.individualCount + a.familyCount)
        );
      case 'recent':
      default:
        return copy.sort((a, b) => {
          const aKey = a.lastOpenedAt ?? a.createdAt;
          const bKey = b.lastOpenedAt ?? b.createdAt;
          return bKey.localeCompare(aKey);
        });
    }
  }, [trees, sortMode]);

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const slug = slugifyTreeName(data.name) || crypto.randomUUID();
      const treePath = await getTreePathForSlug(slug);
      return createTree({ name: data.name, path: treePath, description: data.description });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      setShowNewForm(false);
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateTree(id, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      setRenamingId(null);
      setRenameValue('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, treePath }: { id: string; treePath: string }) => {
      await deleteTree(id);
      try {
        await remove(treePath, { recursive: true });
      } catch {
        // Folder may not exist
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
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

  function handleRenameSubmit(e: React.FormEvent, id: string) {
    e.preventDefault();
    if (!renameValue.trim()) return;
    renameMutation.mutate({ id, name: renameValue.trim() });
  }

  function handleDeleteConfirm() {
    if (!confirmDeleteId || !trees) return;
    const tree = trees.find((tr) => tr.id === confirmDeleteId);
    if (!tree) return;
    deleteMutation.mutate({ id: tree.id, treePath: tree.path });
    setConfirmDeleteId(null);
  }

  const hasTrees = sortedTrees.length > 0;

  return (
    <div className="mx-auto max-w-[1080px] px-14 pb-10 pt-14">
      <section className="mb-9 flex flex-col gap-1.5">
        <h1 className="font-serif text-[56px] font-medium italic leading-none tracking-tight text-foreground">
          <Trans
            i18nKey="home:hero.title"
            components={{ 1: <span className="text-primary italic" /> }}
          />
        </h1>
        <p className="mt-1 max-w-[540px] text-[15px] leading-relaxed text-muted-foreground">
          {t('hero.lede')}
        </p>
        <div className="mt-5 flex items-center gap-2.5">
          <Button onClick={() => setShowNewForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            {t('newTree')}
          </Button>
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <FileUp className="h-3.5 w-3.5" />
            {t('importGedcom')}
          </Button>
        </div>
      </section>

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">{tc('status.loading')}</p>
      ) : (
        <>
          <div className="mb-4 mt-9 flex items-center gap-3.5">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
              {t('yourTrees')}
            </span>
            <span className="rounded-full border border-border bg-muted/40 px-1.5 py-[2px] font-mono text-[11px] text-muted-foreground">
              {sortedTrees.length}
            </span>
            <span className="h-px flex-1 bg-border" />
            <div className="inline-flex rounded-md border border-border bg-muted/40 p-[2px]">
              {(['recent', 'name', 'size'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSortMode(mode)}
                  className={cn(
                    'rounded px-2.5 py-1 text-[11.5px] font-medium transition-colors',
                    sortMode === mode
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t(`sort.${mode}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[18px]">
            {sortedTrees.map((tree) => {
              const isRenaming = renamingId === tree.id;
              return (
                <article
                  key={tree.id}
                  className="group relative flex min-h-[220px] flex-col gap-3.5 rounded-xl border border-border bg-card p-[18px] pb-4 shadow-xs transition-all hover:border-foreground/15 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      {isRenaming ? (
                        <form
                          onSubmit={(e) => handleRenameSubmit(e, tree.id)}
                          className="flex items-center gap-1.5"
                        >
                          <Input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            autoFocus
                            className="h-8 text-sm"
                          />
                          <Button
                            type="submit"
                            size="icon"
                            className="h-8 w-8"
                            disabled={renameMutation.isPending || !renameValue.trim()}
                            title={tc('actions.save')}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => {
                              setRenamingId(null);
                              setRenameValue('');
                            }}
                            title={tc('actions.cancel')}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      ) : (
                        <h3 className="truncate font-serif text-[19px] font-medium italic leading-tight tracking-tight text-foreground">
                          {tree.name}
                        </h3>
                      )}
                      {tree.description && !isRenaming && (
                        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                          {tree.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Stat value={tree.individualCount} label={t('statLabels.individuals')} />
                    <span className="h-6 w-px bg-border" />
                    <Stat value={tree.familyCount} label={t('statLabels.families')} />
                    <span className="h-6 w-px bg-border" />
                    <Stat value="—" label={t('statLabels.generations')} />
                  </div>

                  <div className="flex flex-col gap-1 border-t border-dashed border-border pt-2.5">
                    <MetaRow label={t('meta.created')} value={formatDate(tree.createdAt)} />
                    <MetaRow
                      label={t('meta.lastOpened')}
                      value={
                        tree.lastOpenedAt
                          ? formatDate(tree.lastOpenedAt)
                          : t('treeCard.neverOpened')
                      }
                    />
                  </div>

                  <div className="mt-auto flex items-center gap-1.5 pt-2.5">
                    <button
                      type="button"
                      onClick={() => openMutation.mutate({ id: tree.id, path: tree.path })}
                      disabled={openMutation.isPending || isRenaming}
                      className={cn(
                        'flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 text-[12.5px] font-medium text-foreground transition-colors',
                        'hover:border-foreground/15 hover:bg-accent',
                        'disabled:pointer-events-none disabled:opacity-50'
                      )}
                    >
                      <FolderOpen className="h-[13px] w-[13px]" />
                      {tc('actions.open')}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <IconButton
                      onClick={() => setExportTreeId(tree.id)}
                      title={tc('actions.export')}
                      disabled={isRenaming}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setRenamingId(tree.id);
                        setRenameValue(tree.name);
                      }}
                      disabled={renamingId !== null}
                      title={tc('actions.rename')}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton
                      onClick={() => setConfirmDeleteId(tree.id)}
                      disabled={deleteMutation.isPending || isRenaming}
                      title={tc('actions.delete')}
                      variant="danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                </article>
              );
            })}

            <button
              type="button"
              onClick={() => setShowNewForm(true)}
              className={cn(
                'group/cta flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-foreground/15 p-7 text-center transition-colors',
                'hover:border-primary hover:bg-primary/[0.04]'
              )}
            >
              <span
                aria-hidden
                className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-foreground/20 text-muted-foreground transition-colors group-hover/cta:border-primary group-hover/cta:text-primary"
              >
                <Plus className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-medium text-foreground">{t('cta.title')}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t('cta.subtitle')}</div>
              </div>
            </button>
          </div>

          {!hasTrees && (
            <p className="mt-6 text-center text-sm text-muted-foreground">{t('emptyState')}</p>
          )}
        </>
      )}

      <NewTreeModal
        isOpen={showNewForm}
        isPending={createMutation.isPending}
        error={createMutation.isError ? String(createMutation.error) : null}
        onSubmit={(values) => createMutation.mutate(values)}
        onCancel={() => setShowNewForm(false)}
      />

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title={t('deleteConfirm.title')}
        message={t('deleteConfirm.message', {
          name: trees?.find((tr) => tr.id === confirmDeleteId)?.name ?? '',
        })}
        confirmLabel={tc('actions.delete')}
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <ImportGedcomModal
        isOpen={showImportModal}
        onSuccess={(treeId) => {
          setShowImportModal(false);
          void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
          void navigate({ to: '/tree/$treeId', params: { treeId } });
        }}
        onCancel={() => setShowImportModal(false)}
      />

      <ExportGedcomModal
        isOpen={exportTreeId !== null}
        treeName={trees?.find((tr) => tr.id === exportTreeId)?.name ?? ''}
        treePath={trees?.find((tr) => tr.id === exportTreeId)?.path ?? ''}
        onSuccess={() => setExportTreeId(null)}
        onCancel={() => setExportTreeId(null)}
      />
    </div>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[18px] font-medium tabular-nums tracking-tight text-foreground">
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[11.5px] text-muted-foreground">
      <span className="w-[110px] shrink-0 whitespace-nowrap">{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'danger';
}

function IconButton({ children, className, variant = 'default', ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors',
        variant === 'default' && 'hover:border-border hover:bg-accent hover:text-foreground',
        variant === 'danger' &&
          'hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      {children}
    </button>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
