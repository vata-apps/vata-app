import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Callout,
  Card,
  Dialog,
  Flex,
  Grid,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';

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
   * Tests inject a spy here so the flow can be exercised without hitting
   * Tauri SQL.
   */
  updateTree?: (id: string, input: UpdateTreeInput) => Promise<void>;
}

/**
 * Form host for renaming a tree and adjusting its description. Calls
 * `updateTree` and invalidates both `queryKeys.trees` and
 * `queryKeys.tree(id)` on success so the home grid and the tree shell
 * pick up the new values.
 *
 * The Save button stays disabled until something actually changes.
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
        <Dialog.Title>{t('editTree.title')}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          {t('editTree.subtitle')}
        </Dialog.Description>

        <form id={formId} onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor={nameId} size="2" weight="medium">
                {t('editTree.nameLabel')}{' '}
                <Text
                  size="2"
                  weight="regular"
                  aria-hidden="true"
                  style={{ color: 'var(--accent-11)' }}
                >
                  {t('editTree.nameRequired')}
                </Text>
              </Text>
              <TextField.Root
                id={nameId}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={mutation.isPending}
              />
            </Flex>

            <Flex direction="column" gap="1">
              <Text as="label" htmlFor={descriptionId} size="2" weight="medium">
                {t('editTree.descriptionLabel')}{' '}
                <Text size="2" color="gray" weight="regular">
                  — {t('editTree.descriptionOptional')}
                </Text>
              </Text>
              <TextArea
                id={descriptionId}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={mutation.isPending}
              />
            </Flex>

            <Card>
              <Grid columns="3" gap="4">
                <SummaryStat
                  label={t('editTree.summaryIndividuals')}
                  value={tree.individualCount.toLocaleString()}
                />
                <SummaryStat
                  label={t('editTree.summaryCreated')}
                  value={formatIsoDate(tree.createdAt)}
                />
                <SummaryStat label={t('editTree.summaryLastOpened')} value={lastOpenedDisplay} />
              </Grid>
            </Card>

            {mutation.isError && (
              <Callout.Root color="red" size="1" role="alert">
                <Callout.Text>{t('editTree.errorGeneric')}</Callout.Text>
              </Callout.Root>
            )}
          </Flex>
        </form>

        <Flex gap="3" mt="4" justify="end">
          <Button variant="soft" color="gray" onClick={closeModal} disabled={mutation.isPending}>
            {t('editTree.cancel')}
          </Button>
          <Button type="submit" form={formId} disabled={!canSubmit}>
            {t('editTree.submit')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function SummaryStat({ label, value }: { label: ReactNode; value: ReactNode }): JSX.Element {
  return (
    <Flex direction="column" gap="1">
      <Text
        size="1"
        weight="medium"
        style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-a10)' }}
      >
        {label}
      </Text>
      <Text size="2" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
    </Flex>
  );
}
