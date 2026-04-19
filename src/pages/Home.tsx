import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { remove } from '@tauri-apps/plugin-fs';
import { useTranslation } from 'react-i18next';
import { VataIcon } from '$components/ui/vata-icon';
import { getAllTrees, createTree, updateTree, deleteTree, markTreeOpened } from '$/db/system/trees';
import { getSystemDebugData, listTreeDatabaseFiles } from '$/db/system/debug';
import { openTreeDb } from '$/db/connection';
import { useAppStore } from '$/store/app-store';
import { queryKeys } from '$lib/query-keys';
import { getTreePathForSlug, slugifyTreeName } from '$lib/tree-paths';
import { ConfirmDialog } from '$components/ConfirmDialog';
import { ImportGedcomModal } from '$components/ImportGedcomModal';
import { ExportGedcomModal } from '$components/ExportGedcomModal';
import { Button } from '$components/ui/button';
import { Input } from '$components/ui/input';
import { Label } from '$components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '$components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '$components/ui/dialog';

export function HomePage() {
  const { t } = useTranslation('home');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setCurrentTree = useAppStore((s) => s.setCurrentTree);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [exportTreeId, setExportTreeId] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const { data: trees, isLoading } = useQuery({
    queryKey: queryKeys.trees,
    queryFn: getAllTrees,
  });

  const { data: systemDebugData } = useQuery({
    queryKey: queryKeys.systemDebugData,
    queryFn: getSystemDebugData,
    enabled: showDebug,
  });

  const { data: treeFiles } = useQuery({
    queryKey: queryKeys.treeFiles,
    queryFn: listTreeDatabaseFiles,
    enabled: showDebug,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const slug = slugifyTreeName(data.name) || crypto.randomUUID();
      const treePath = await getTreePathForSlug(slug);
      return createTree({ name: data.name, path: treePath, description: data.description });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      setShowNewForm(false);
      setNewName('');
      setNewDescription('');
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

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate({
      name: newName.trim(),
      description: newDescription.trim() || undefined,
    });
  }

  function handleRenameSubmit(e: React.FormEvent, id: string) {
    e.preventDefault();
    if (!renameValue.trim()) return;
    renameMutation.mutate({ id, name: renameValue.trim() });
  }

  function handleDeleteConfirm() {
    if (!confirmDeleteId || !trees) return;
    const tree = trees.find((t) => t.id === confirmDeleteId);
    if (!tree) return;
    deleteMutation.mutate({ id: tree.id, treePath: tree.path });
    setConfirmDeleteId(null);
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-5xl font-medium italic tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="mb-6 flex gap-2">
        <Button size="sm" onClick={() => setShowNewForm(true)}>
          <VataIcon name="plus" size={14} className="mr-1.5" />
          {t('newTree')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowImportModal(true)}>
          <VataIcon name="file-up" size={14} className="mr-1.5" />
          {t('importGedcom')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">{tc('status.loading')}</p>
      ) : trees && trees.length > 0 ? (
        <>
          <h2 className="mb-3 text-lg font-semibold">{t('yourTrees')}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
            {trees.map((tree) => (
              <Card key={tree.id}>
                <CardHeader className="pb-2">
                  {renamingId === tree.id ? (
                    <form onSubmit={(e) => handleRenameSubmit(e, tree.id)} className="space-y-2">
                      <Input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={renameMutation.isPending || !renameValue.trim()}
                        >
                          {tc('actions.save')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRenamingId(null);
                            setRenameValue('');
                          }}
                        >
                          {tc('actions.cancel')}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <CardTitle className="text-base">{tree.name}</CardTitle>
                  )}
                  {tree.description && <CardDescription>{tree.description}</CardDescription>}
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-xs text-muted-foreground">
                    {t('treeCard.individuals', { count: tree.individualCount })} ·{' '}
                    {t('treeCard.families', { count: tree.familyCount })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('treeCard.created', {
                      date: new Date(tree.createdAt).toLocaleDateString(),
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('treeCard.lastOpened', {
                      date: tree.lastOpenedAt
                        ? new Date(tree.lastOpenedAt).toLocaleDateString()
                        : t('treeCard.neverOpened'),
                    })}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => openMutation.mutate({ id: tree.id, path: tree.path })}
                    disabled={openMutation.isPending}
                    className="flex-1"
                  >
                    <VataIcon name="folder-open" size={14} className="mr-1.5" />
                    {tc('actions.open')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExportTreeId(tree.id)}
                    title={tc('actions.export')}
                  >
                    <VataIcon name="download" size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRenamingId(tree.id);
                      setRenameValue(tree.name);
                    }}
                    disabled={renamingId !== null}
                    title={tc('actions.rename')}
                  >
                    <VataIcon name="pencil" size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmDeleteId(tree.id)}
                    disabled={deleteMutation.isPending}
                    title={tc('actions.delete')}
                    className="text-destructive hover:text-destructive"
                  >
                    <VataIcon name="trash" size={14} />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-sm text-muted-foreground">{t('emptyState')}</p>
      )}

      {/* Create Tree Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('createForm.title')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tree-name">{t('createForm.name')}</Label>
              <Input
                id="tree-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('createForm.namePlaceholder')}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tree-description">{t('createForm.description')}</Label>
              <Input
                id="tree-description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder={t('createForm.descriptionPlaceholder')}
              />
            </div>
            {createMutation.isError && (
              <p className="text-sm text-destructive">{String(createMutation.error)}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewForm(false)}>
                {tc('actions.cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !newName.trim()}>
                {createMutation.isPending ? tc('status.creating') : t('createForm.submit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

      {import.meta.env.DEV && (
        <div className="mt-8 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => setShowDebug((v) => !v)}>
            {showDebug ? t('debug.hide') : t('debug.show')}
          </Button>

          {showDebug && (
            <div className="mt-4 flex flex-wrap gap-8">
              <div className="min-w-[200px] flex-1">
                <h3 className="mb-2 text-sm font-semibold">{t('debug.treeFiles')}</h3>
                {treeFiles && treeFiles.length > 0 ? (
                  <ul className="list-inside list-disc">
                    {treeFiles.map((filename) => (
                      <li key={filename} className="font-mono text-xs">
                        {filename}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('debug.noTreeFiles')}</p>
                )}
              </div>

              <div className="min-w-[400px] flex-[2]">
                <h3 className="mb-2 text-sm font-semibold">{t('debug.rawContent')}</h3>
                {systemDebugData ? (
                  <pre className="max-h-[400px] overflow-auto rounded-md bg-muted p-4 font-mono text-xs">
                    {JSON.stringify(systemDebugData, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">{tc('status.loading')}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
