import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '$components/ui/badge';
import { Button } from '$components/ui/button';
import { Dialog } from '$components/ui/dialog';
import { Input } from '$components/ui/input';
import { StatGrid, type StatGridItem } from '$components/ui/stat-grid';
import { Switch } from '$components/ui/switch';
import { deleteTree as defaultDeleteTree } from '$db-system/trees';
import { GedcomManager } from '$/managers/GedcomManager';
import { queryKeys } from '$lib/query-keys';

/**
 * Lightweight projection of {@link Tree} carrying just what the modal
 * needs to render. Decoupled from the DB row so stories can build
 * fixtures without touching SQLite.
 */
interface DeleteTreeTarget {
  id: string;
  name: string;
  individualCount: number;
  familyCount: number;
}

/**
 * Props accepted by {@link DeleteTreeModal}.
 */
export interface DeleteTreeModalProps {
  /** Tree to delete. The modal renders nothing when null. */
  tree: DeleteTreeTarget | null;

  /** Whether the modal is open. Controlled by the parent. */
  open: boolean;

  /** Called when the modal should open or close. */
  onOpenChange: (open: boolean) => void;

  /**
   * Override the delete function. Defaults to the DB-layer
   * `deleteTree`. Tests/stories inject a spy here so the flow can be
   * exercised without hitting Tauri SQL.
   */
  deleteTree?: (id: string) => Promise<void>;

  /**
   * Override the export function. Defaults to
   * {@link GedcomManager.exportToFile}. Tests/stories inject a spy
   * here so the flow can be exercised without hitting Tauri's save
   * dialog.
   */
  exportTree?: (treeName: string, includePrivate: boolean) => Promise<boolean>;
}

/** Default export — wraps `GedcomManager.exportToFile`. */
const defaultExportTree = (treeName: string, includePrivate: boolean): Promise<boolean> =>
  GedcomManager.exportToFile(treeName, includePrivate);

/**
 * Hard-delete confirmation modal. Requires the user to type the tree
 * name verbatim before the destructive button enables, and offers an
 * opt-in GEDCOM export beforehand. Cancelling the native save dialog
 * aborts the deletion entirely so the user doesn't lose data.
 */
export function DeleteTreeModal({
  tree,
  open,
  onOpenChange,
  deleteTree = defaultDeleteTree,
  exportTree = defaultExportTree,
}: DeleteTreeModalProps): JSX.Element | null {
  const { t } = useTranslation('trees');
  const queryClient = useQueryClient();
  const formId = useId();
  const confirmId = useId();

  const [exportFirst, setExportFirst] = useState(true);
  const [confirmName, setConfirmName] = useState('');

  const mutation = useMutation({
    mutationFn: async ({
      treeId,
      treeName,
      shouldExport,
    }: {
      treeId: string;
      treeName: string;
      shouldExport: boolean;
    }) => {
      if (shouldExport) {
        const exported = await exportTree(treeName, true);
        // Cancelled save dialog → abort the deletion entirely. The
        // user explicitly asked to keep a backup; if we can't make
        // one, we don't proceed with the destructive action.
        if (!exported) return { deleted: false } as const;
      }
      await deleteTree(treeId);
      return { deleted: true } as const;
    },
    onSuccess: async ({ deleted }) => {
      if (!deleted) return;
      await queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      onOpenChange(false);
    },
    onError: (err) => {
      // Raw DB/Tauri errors are not translated — log them, surface a
      // generic localized message in the UI instead.
      console.error('Failed to delete tree:', err);
    },
  });

  useEffect(() => {
    if (!open) {
      setExportFirst(true);
      setConfirmName('');
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!tree) return null;

  const canSubmit = confirmName.trim() === tree.name && !mutation.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSubmit) return;
    mutation.mutate({
      treeId: tree.id,
      treeName: tree.name,
      shouldExport: exportFirst,
    });
  };

  const closeModal = (): void => {
    if (mutation.isPending) return;
    onOpenChange(false);
  };

  const statItems: StatGridItem[] = [
    {
      value: tree.individualCount.toLocaleString(),
      label: t('deleteTree.statsIndividuals'),
      accent: 'destructive',
    },
    {
      value: tree.familyCount.toLocaleString(),
      label: t('deleteTree.statsFamilies'),
      accent: 'destructive',
    },
    {
      value: 0,
      label: (
        <span className="inline-flex items-center gap-1.5">
          {t('deleteTree.statsSources')}
          <Badge variant="soon" size="sm">
            {t('deleteTree.soonLabel')}
          </Badge>
        </span>
      ),
      accent: 'destructive',
    },
    {
      value: 0,
      label: (
        <span className="inline-flex items-center gap-1.5">
          {t('deleteTree.statsMedia')}
          <Badge variant="soon" size="sm">
            {t('deleteTree.soonLabel')}
          </Badge>
        </span>
      ),
      accent: 'destructive',
    },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true);
          return;
        }
        closeModal();
      }}
      size="md"
      title={
        <span className="font-serif italic">{t('deleteTree.title', { treeName: tree.name })}</span>
      }
      description={t('deleteTree.subtitle')}
      closeLabel={t('deleteTree.closeLabel')}
      footer={
        <>
          <Button variant="ghost" onClick={closeModal} disabled={mutation.isPending}>
            {t('deleteTree.cancel')}
          </Button>
          <Button type="submit" form={formId} variant="destructive" disabled={!canSubmit}>
            {t('deleteTree.submit')}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="border-destructive/40 bg-destructive/5 rounded-lg border p-4">
          <StatGrid items={statItems} />
        </div>

        <Switch
          checked={exportFirst}
          onCheckedChange={setExportFirst}
          label={t('deleteTree.exportBeforeLabel')}
          disabled={mutation.isPending}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor={confirmId} className="text-foreground text-sm font-medium">
            {t('deleteTree.confirmLabel')}
          </label>
          <Input
            id={confirmId}
            value={confirmName}
            onChange={(event) => setConfirmName(event.target.value)}
            placeholder={tree.name}
            disabled={mutation.isPending}
            autoComplete="off"
          />
        </div>

        {mutation.isError && (
          <p role="alert" className="text-destructive text-sm">
            {t('deleteTree.errorGeneric')}
          </p>
        )}
      </form>
    </Dialog>
  );
}
