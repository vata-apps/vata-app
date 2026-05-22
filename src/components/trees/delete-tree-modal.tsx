import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Callout,
  Dialog,
  Flex,
  Grid,
  Switch,
  Text,
  TextField,
} from '@radix-ui/themes';

import { deleteTree as defaultDeleteTree } from '$db-system/trees';
import { GedcomManager } from '$managers/GedcomManager';
import { queryKeys } from '$lib/query-keys';

/**
 * Lightweight projection of {@link Tree} carrying just what the modal
 * needs to render. Decoupled from the DB row so tests can build
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
interface DeleteTreeModalProps {
  /** Tree to delete. The modal renders nothing when null. */
  tree: DeleteTreeTarget | null;

  /** Whether the modal is open. Controlled by the parent. */
  open: boolean;

  /** Called when the modal should open or close. */
  onOpenChange: (open: boolean) => void;

  /**
   * Override the delete function. Defaults to the DB-layer `deleteTree`.
   * Tests inject a spy here so the flow can be exercised without hitting
   * Tauri SQL.
   */
  deleteTree?: (id: string) => Promise<void>;

  /**
   * Override the export function. Defaults to
   * {@link GedcomManager.exportToFile}.
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
        // Cancelled save dialog → abort the deletion entirely. The user
        // explicitly asked to keep a backup; if we can't make one, we
        // don't proceed with the destructive action.
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

  // Reset form state every time the modal closes. `mutation` is
  // intentionally omitted from the dep array.
  useEffect(() => {
    if (!open) {
      setExportFirst(true);
      setConfirmName('');
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!tree) return null;

  // Trim both sides so accidental whitespace doesn't gate the action.
  const canSubmit = confirmName.trim() === tree.name.trim() && !mutation.isPending;

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

  const zero = (0).toLocaleString();
  const stats: { value: string; label: string }[] = [
    { value: tree.individualCount.toLocaleString(), label: t('deleteTree.statsIndividuals') },
    { value: tree.familyCount.toLocaleString(), label: t('deleteTree.statsFamilies') },
    { value: zero, label: t('deleteTree.statsSources') },
    { value: zero, label: t('deleteTree.statsMedia') },
  ];

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true);
          return;
        }
        closeModal();
      }}
    >
      <Dialog.Content maxWidth="520px">
        <Dialog.Title>{t('deleteTree.title', { treeName: tree.name })}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          {t('deleteTree.subtitle')}
        </Dialog.Description>

        <form id={formId} onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Box
              style={{
                border: '1px solid var(--red-a5)',
                background: 'var(--red-a2)',
                borderRadius: 'var(--radius-3)',
                padding: 'var(--space-4)',
              }}
            >
              <Grid columns="4" gap="3">
                {stats.map((stat, idx) => (
                  <Flex key={idx} direction="column" gap="1">
                    <Text
                      size="5"
                      weight="bold"
                      color="red"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {stat.value}
                    </Text>
                    <Text
                      size="1"
                      weight="medium"
                      style={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--gray-a10)',
                      }}
                    >
                      {stat.label}
                    </Text>
                  </Flex>
                ))}
              </Grid>
            </Box>

            <Text as="label" size="2" weight="medium">
              <Flex align="center" gap="2">
                <Switch
                  checked={exportFirst}
                  onCheckedChange={setExportFirst}
                  disabled={mutation.isPending}
                />
                {t('deleteTree.exportBeforeLabel')}
              </Flex>
            </Text>

            <Flex direction="column" gap="1">
              <Text as="label" htmlFor={confirmId} size="2" weight="medium">
                {t('deleteTree.confirmLabel')}
              </Text>
              <TextField.Root
                id={confirmId}
                value={confirmName}
                onChange={(event) => setConfirmName(event.target.value)}
                placeholder={t('deleteTree.confirmPlaceholder')}
                disabled={mutation.isPending}
                autoComplete="off"
                aria-required="true"
              />
            </Flex>

            {mutation.isError && (
              <Callout.Root color="red" size="1" role="alert">
                <Callout.Text>{t('deleteTree.errorGeneric')}</Callout.Text>
              </Callout.Root>
            )}
          </Flex>
        </form>

        <Flex gap="3" mt="4" justify="end">
          <Button variant="soft" color="gray" onClick={closeModal} disabled={mutation.isPending}>
            {t('deleteTree.cancel')}
          </Button>
          <Button type="submit" form={formId} color="red" disabled={!canSubmit}>
            {t('deleteTree.submit')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
