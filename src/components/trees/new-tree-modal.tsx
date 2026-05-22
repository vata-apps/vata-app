import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Callout,
  Dialog,
  Flex,
  RadioCards,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';

import { TreeManager } from '$managers/TreeManager';
import { queryKeys } from '$lib/query-keys';

interface CreateTreeInput {
  name: string;
  description?: string;
}

/**
 * Props accepted by {@link NewTreeModal}.
 */
export interface NewTreeModalProps {
  /** Whether the modal is open. Controlled by the parent. */
  open: boolean;

  /** Called when the modal should open or close. */
  onOpenChange: (open: boolean) => void;

  /** Called with the new tree's id after a successful creation. */
  onCreated?: (treeId: string) => void;

  /**
   * Override the create function. Defaults to {@link TreeManager.create}.
   * Tests inject a spy here so the flow can be exercised without hitting
   * Tauri SQL.
   */
  createTree?: (input: CreateTreeInput) => Promise<string>;
}

const defaultCreateTree = (input: CreateTreeInput): Promise<string> => TreeManager.create(input);

/**
 * Form host for creating a blank tree. Calls `TreeManager.create` and
 * invalidates the `trees` query on success. The "From me" starting
 * point is disabled until pre-population lands.
 */
export function NewTreeModal({
  open,
  onOpenChange,
  onCreated,
  createTree = defaultCreateTree,
}: NewTreeModalProps): JSX.Element {
  const { t } = useTranslation('trees');
  const queryClient = useQueryClient();
  const formId = useId();
  const nameId = useId();
  const descriptionId = useId();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: (input: CreateTreeInput) => createTree(input),
    onSuccess: async (treeId) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      onCreated?.(treeId);
      onOpenChange(false);
    },
    onError: (err) => {
      // Raw DB/Tauri errors are not translated — log them, surface a
      // generic localized message in the UI instead.
      console.error('Failed to create tree:', err);
    },
  });

  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
    }
  }, [open]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !mutation.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSubmit) return;
    mutation.mutate({
      name: trimmedName,
      description: description.trim() || undefined,
    });
  };

  const closeModal = (): void => {
    if (mutation.isPending) return;
    mutation.reset();
    onOpenChange(false);
  };

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
        <Dialog.Title>{t('newTree.title')}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          {t('newTree.subtitle')}
        </Dialog.Description>

        <form id={formId} onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor={nameId} size="2" weight="medium">
                {t('newTree.nameLabel')}
              </Text>
              <TextField.Root
                id={nameId}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('newTree.namePlaceholder')}
                disabled={mutation.isPending}
              />
            </Flex>

            <Flex direction="column" gap="1">
              <Text as="label" htmlFor={descriptionId} size="2" weight="medium">
                {t('newTree.descriptionLabel')}{' '}
                <Text size="2" color="gray" weight="regular">
                  ({t('newTree.descriptionOptional')})
                </Text>
              </Text>
              <TextArea
                id={descriptionId}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t('newTree.descriptionPlaceholder')}
                disabled={mutation.isPending}
              />
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                {t('newTree.startingPointLabel')}
              </Text>
              <RadioCards.Root
                defaultValue="blank"
                columns="2"
                aria-label={t('newTree.startingPointLabel')}
              >
                <RadioCards.Item value="blank">
                  <Flex direction="column" align="start" gap="1">
                    <Text size="2" weight="medium">
                      {t('newTree.blankLabel')}
                    </Text>
                    <Text size="1" color="gray">
                      {t('newTree.blankDescription')}
                    </Text>
                  </Flex>
                </RadioCards.Item>
                <RadioCards.Item value="from-me" disabled>
                  <Flex direction="column" align="start" gap="1">
                    <Flex align="center" gap="2">
                      <Text size="2" weight="medium">
                        {t('newTree.fromMeLabel')}
                      </Text>
                      <Badge variant="outline" color="gray">
                        {t('newTree.soonLabel')}
                      </Badge>
                    </Flex>
                    <Text size="1" color="gray">
                      {t('newTree.fromMeDescription')}
                    </Text>
                  </Flex>
                </RadioCards.Item>
              </RadioCards.Root>
            </Flex>

            {mutation.isError && (
              <Callout.Root color="red" size="1" role="alert">
                <Callout.Text>{t('newTree.errorGeneric')}</Callout.Text>
              </Callout.Root>
            )}
          </Flex>
        </form>

        <Flex gap="3" mt="4" justify="end">
          <Button variant="soft" color="gray" onClick={closeModal} disabled={mutation.isPending}>
            {t('newTree.cancel')}
          </Button>
          <Button type="submit" form={formId} disabled={!canSubmit}>
            {t('newTree.submit')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
