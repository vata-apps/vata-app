import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '$components/ui/button';
import { Dialog } from '$components/ui/dialog';
import { Input } from '$components/ui/input';
import { Textarea } from '$components/ui/textarea';
import { updateTree as defaultUpdateTree } from '$db-system/trees';
import { formatIsoDate } from '$lib/format';
import { queryKeys } from '$lib/query-keys';
import type { Tree } from '$/types/database';

interface UpdateTreeInput {
  name: string;
  description: string | null;
}

/**
 * Props accepted by {@link EditTreeModal}.
 */
export interface EditTreeModalProps {
  /** The tree being edited. Drives pre-fill values and the read-only summary. */
  tree: Tree;

  /** Whether the modal is open. Controlled by the parent. */
  open: boolean;

  /** Called when the modal should open or close. */
  onOpenChange: (open: boolean) => void;

  /** Called with the tree id after a successful update. */
  onUpdated?: (treeId: string) => void;

  /**
   * Override the update function. Defaults to the DB-layer `updateTree`.
   * Tests/stories inject a spy here so the flow can be exercised without
   * hitting Tauri SQL.
   */
  updateTree?: (id: string, input: UpdateTreeInput) => Promise<void>;
}

/**
 * Form host for renaming a tree and adjusting its description. Calls
 * `updateTree` and invalidates both `queryKeys.trees` and
 * `queryKeys.tree(id)` on success so the home grid and the tree shell
 * pick up the new values.
 *
 * The Save button stays disabled until something actually changes — there
 * is no value in submitting a no-op.
 */
export function EditTreeModal({
  tree,
  open,
  onOpenChange,
  onUpdated,
  updateTree = defaultUpdateTree,
}: EditTreeModalProps): JSX.Element {
  const { t } = useTranslation('trees');
  const queryClient = useQueryClient();
  const formId = useId();
  const nameId = useId();
  const descriptionId = useId();

  const [name, setName] = useState(tree.name);
  const [description, setDescription] = useState(tree.description ?? '');

  const mutation = useMutation({
    mutationFn: (input: UpdateTreeInput) => updateTree(tree.id, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trees }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tree(tree.id) }),
      ]);
      onUpdated?.(tree.id);
      onOpenChange(false);
    },
    onError: (err) => {
      // Raw DB/Tauri errors are not translated — log them, surface a
      // generic localized message in the UI instead.
      console.error('Failed to update tree:', err);
    },
  });

  useEffect(() => {
    if (!open) {
      setName(tree.name);
      setDescription(tree.description ?? '');
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tree.id]);

  const trimmedName = name.trim();
  const trimmedDescription = description.trim();
  const nameChanged = trimmedName !== tree.name;
  const descriptionChanged = trimmedDescription !== (tree.description ?? '').trim();
  const hasChanges = nameChanged || descriptionChanged;
  const canSubmit = trimmedName.length > 0 && hasChanges && !mutation.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSubmit) return;
    mutation.mutate({
      name: trimmedName,
      description: trimmedDescription.length > 0 ? trimmedDescription : null,
    });
  };

  const closeModal = (): void => {
    if (mutation.isPending) return;
    mutation.reset();
    onOpenChange(false);
  };

  const lastOpenedDisplay: ReactNode = tree.lastOpenedAt
    ? formatIsoDate(tree.lastOpenedAt)
    : t('editTree.summaryNever');

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
      title={<span className="font-serif italic">{t('editTree.title')}</span>}
      description={t('editTree.subtitle')}
      closeLabel={t('editTree.closeLabel')}
      footer={
        <>
          <Button variant="ghost" onClick={closeModal} disabled={mutation.isPending}>
            {t('editTree.cancel')}
          </Button>
          <Button type="submit" form={formId} disabled={!canSubmit}>
            {t('editTree.submit')}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={nameId} className="text-foreground text-sm font-medium">
            {t('editTree.nameLabel')}{' '}
            <span aria-hidden className="text-primary font-normal">
              {t('editTree.nameRequired')}
            </span>
          </label>
          <Input
            id={nameId}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={mutation.isPending}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={descriptionId} className="text-foreground text-sm font-medium">
            {t('editTree.descriptionLabel')}{' '}
            <span className="text-muted-foreground font-normal">
              — {t('editTree.descriptionOptional')}
            </span>
          </label>
          <Textarea
            id={descriptionId}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={mutation.isPending}
          />
        </div>

        <div className="border-border bg-muted/30 grid grid-cols-3 gap-4 rounded-lg border p-4">
          <SummaryStat
            label={t('editTree.summaryIndividuals')}
            value={tree.individualCount.toLocaleString()}
          />
          <SummaryStat label={t('editTree.summaryCreated')} value={formatIsoDate(tree.createdAt)} />
          <SummaryStat label={t('editTree.summaryLastOpened')} value={lastOpenedDisplay} />
        </div>

        {mutation.isError && (
          <p role="alert" className="text-destructive text-sm">
            {t('editTree.errorGeneric')}
          </p>
        )}
      </form>
    </Dialog>
  );
}

interface SummaryStatProps {
  label: ReactNode;
  value: ReactNode;
}

function SummaryStat({ label, value }: SummaryStatProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground font-mono text-[10px] leading-none tracking-wider uppercase">
        {label}
      </span>
      <span className="text-foreground font-mono text-base leading-none tabular-nums">{value}</span>
    </div>
  );
}
