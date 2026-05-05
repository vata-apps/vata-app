import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '$components/ui/button';
import { Dialog } from '$components/ui/dialog';
import { Input } from '$components/ui/input';
import { OptionCard, OptionCardGroup } from '$components/ui/option-card';
import { Textarea } from '$components/ui/textarea';
import { TreeManager } from '$/managers/TreeManager';
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
   * Tests/stories inject a spy here so the flow can be exercised without
   * hitting Tauri SQL.
   */
  createTree?: (input: CreateTreeInput) => Promise<string>;
}

const defaultCreateTree = (input: CreateTreeInput): Promise<string> => TreeManager.create(input);

/**
 * Form host for creating a blank tree. Calls `TreeManager.create` and
 * invalidates the `trees` query on success. The "From me" starting
 * point renders a `Soon` badge and is disabled until pre-population
 * lands.
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
      title={<span className="font-serif italic">{t('newTree.title')}</span>}
      description={t('newTree.subtitle')}
      closeLabel={t('newTree.closeLabel')}
      footer={
        <>
          <Button variant="ghost" onClick={closeModal} disabled={mutation.isPending}>
            {t('newTree.cancel')}
          </Button>
          <Button type="submit" form={formId} disabled={!canSubmit}>
            {t('newTree.submit')}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={nameId} className="text-foreground text-sm font-medium">
            {t('newTree.nameLabel')}
          </label>
          <Input
            id={nameId}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('newTree.namePlaceholder')}
            disabled={mutation.isPending}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={descriptionId} className="text-foreground text-sm font-medium">
            {t('newTree.descriptionLabel')}{' '}
            <span className="text-muted-foreground font-normal">
              ({t('newTree.descriptionOptional')})
            </span>
          </label>
          <Textarea
            id={descriptionId}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('newTree.descriptionPlaceholder')}
            disabled={mutation.isPending}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">
            {t('newTree.startingPointLabel')}
          </span>
          <OptionCardGroup
            value="blank"
            onValueChange={() => undefined}
            aria-label={t('newTree.startingPointLabel')}
            cols={2}
          >
            <OptionCard
              value="blank"
              label={t('newTree.blankLabel')}
              description={t('newTree.blankDescription')}
            />
            <OptionCard
              value="from-me"
              label={t('newTree.fromMeLabel')}
              description={t('newTree.fromMeDescription')}
              soon
              soonLabel={t('newTree.soonLabel')}
            />
          </OptionCardGroup>
        </div>

        {mutation.isError && (
          <p role="alert" className="text-destructive text-sm">
            {t('newTree.errorGeneric')}
          </p>
        )}
      </form>
    </Dialog>
  );
}
