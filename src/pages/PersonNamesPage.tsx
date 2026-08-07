import { Fragment, useState, type ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CenteredMessage } from '$components/centered-message';
import { Icon } from '$components/icon';
import { NameDetail } from '$components/person-names/name-detail';
import {
  emptyNameForm,
  isNameFormComplete,
  isSameNamePayload,
  toNameForm,
  toNameParts,
  toNamePayload,
  type NameForm,
} from '$components/person-names/name-form';
import { DraftFooter, InlineDelete } from '$components/record-panel/record-actions';
import { DRAFT_ID, RecordPanel } from '$components/record-panel/record-panel';
import { RecordRow } from '$components/record-panel/record-row';
import { Button } from '$components/ui/button';
import { Typography } from '$components/ui/typography';
import {
  useCreateName,
  useDeleteName,
  usePersonNames,
  useSetPrimaryName,
  useUpdateName,
  type PersonName,
} from '$hooks/usePersonNames';
import { formatName } from '$db-tree/names';

/**
 * The Names tab: every name record of one person, edited through the shared
 * {@link RecordPanel}.
 *
 * Edits to a saved name commit when the field loses focus — there is no save
 * button, matching the mockup, where the only explicit commit is a draft's
 * "create". A draft lives entirely in this component until then.
 */
export function PersonNamesPage(): JSX.Element {
  const { individualId } = useParams({
    from: '/tree/$treeId/individual/$individualId/names',
  });
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');

  const { data: names, isLoading, isError } = usePersonNames(individualId);

  const createName = useCreateName(individualId);
  const updateName = useUpdateName(individualId);
  const deleteName = useDeleteName(individualId);
  const setPrimaryName = useSetPrimaryName(individualId);

  const [draft, setDraft] = useState<NameForm | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Editing buffer for the selected saved name. Re-seeded during render when
  // the selection moves, so the fields never show the previous record's values
  // for a frame the way an effect would.
  const [buffer, setBuffer] = useState<NameForm | null>(null);
  const [bufferFor, setBufferFor] = useState<string | null>(null);

  if (isLoading) return <CenteredMessage>{t('overview.loading')}</CenteredMessage>;
  if (isError) return <CenteredMessage>{tCommon('errors.loadFailed')}</CenteredMessage>;

  const rows = names ?? [];
  // Falling back to the first row keeps a record open at all times, which is
  // what makes the side panel worth its width.
  const activeId = selectedId ?? rows[0]?.id ?? null;
  const isDraftSelected = activeId === DRAFT_ID;
  const selectedName = rows.find((name) => name.id === activeId);

  if (!isDraftSelected && bufferFor !== activeId) {
    setBufferFor(activeId);
    setBuffer(selectedName ? toNameForm(selectedName) : null);
  }

  const value = isDraftSelected ? draft : buffer;

  function patchValue(patch: Partial<NameForm>): void {
    if (isDraftSelected) {
      setDraft((current) => (current ? { ...current, ...patch } : current));
    } else {
      setBuffer((current) => (current ? { ...current, ...patch } : current));
    }
  }

  function commitEdit(patch?: Partial<NameForm>): void {
    if (isDraftSelected || !activeId || !buffer || !selectedName) return;
    const next = { ...buffer, ...patch };
    // Blur fires whether or not the user typed anything, so an unchanged field
    // must not cost a write and a round of cache invalidation.
    if (isSameNamePayload(toNameForm(selectedName), next)) return;
    updateName.mutate({
      id: activeId,
      input: toNamePayload(next),
      isPrimary: selectedName.isPrimary,
    });
  }

  function startDraft(): void {
    setDraft((current) => current ?? emptyNameForm());
    setSelectedId(DRAFT_ID);
  }

  function cancelDraft(): void {
    setDraft(null);
    setSelectedId(null);
  }

  function submitDraft(): void {
    if (!draft) return;
    createName.mutate(
      { ...toNamePayload(draft), isPrimary: draft.isPrimary },
      {
        onSuccess: (newId) => {
          setDraft(null);
          setSelectedId(newId);
        },
      }
    );
  }

  function removeName(name: PersonName): void {
    deleteName.mutate(
      { id: name.id, isPrimary: name.isPrimary },
      { onSuccess: () => setSelectedId(null) }
    );
  }

  const addButton = (
    <Button variant="ghost" onClick={startDraft}>
      <Icon name="plus" size={15} />
      {t('namesTab.add')}
    </Button>
  );

  let footer: ReactNode = null;
  if (isDraftSelected && value) {
    footer = (
      <DraftFooter
        createLabel={t('namesTab.create')}
        canCreate={isNameFormComplete(value)}
        isCreating={createName.isPending}
        onCancel={cancelDraft}
        onCreate={submitDraft}
      />
    );
  } else if (selectedName && rows.length > 1) {
    // The last remaining name has no delete: a person always keeps one.
    footer = (
      <InlineDelete
        // A fresh instance per record, so an armed confirmation never carries
        // over to the name selected next.
        key={selectedName.id}
        triggerLabel={t('namesTab.delete.trigger')}
        question={t('namesTab.delete.question', { name: rowLabel(selectedName, t) })}
        isDeleting={deleteName.isPending}
        onDelete={() => removeName(selectedName)}
      />
    );
  }

  const detail = value ? (
    <NameDetail
      value={value}
      onChange={patchValue}
      onCommit={commitEdit}
      onPrimaryChange={() => {
        if (isDraftSelected) {
          patchValue({ isPrimary: true });
        } else if (activeId) {
          setPrimaryName.mutate(activeId);
        }
      }}
      footer={footer}
    />
  ) : null;

  return (
    <RecordPanel.Root>
      <RecordPanel.Toolbar>
        <Typography size="xs" tone="muted">
          {t('namesTab.hint')}
        </Typography>
        {addButton}
      </RecordPanel.Toolbar>

      <RecordPanel.Body>
        <RecordPanel.List>
          <RecordPanel.ListCard
            title={t('overview.names.title')}
            count={rows.length + (draft ? 1 : 0)}
            footer={addButton}
          >
            {rows.map((name) => (
              <Fragment key={name.id}>
                <RecordRow
                  icon="signature"
                  title={rowLabel(name, t)}
                  titleSuffix={
                    name.isPrimary ? (
                      <Typography size="xs" tone="muted">
                        {t('overview.names.primary')}
                      </Typography>
                    ) : null
                  }
                  meta={t(`overview.names.types.${name.type}`)}
                  sourceCount={name.sourceCount}
                  isSelected={name.id === activeId}
                  onSelect={() => setSelectedId(name.id)}
                />
                {name.id === activeId && detail ? (
                  <RecordPanel.InlineDetail>{detail}</RecordPanel.InlineDetail>
                ) : null}
              </Fragment>
            ))}

            {draft ? (
              <>
                <RecordRow
                  icon="signature"
                  title={
                    <Typography family="serif" tone="muted">
                      {draftLabel(draft, t)}
                    </Typography>
                  }
                  meta={t(`overview.names.types.${draft.type}`)}
                  isDraft
                  isSelected={isDraftSelected}
                  onSelect={() => setSelectedId(DRAFT_ID)}
                />
                {isDraftSelected && detail ? (
                  <RecordPanel.InlineDetail>{detail}</RecordPanel.InlineDetail>
                ) : null}
              </>
            ) : null}
          </RecordPanel.ListCard>
        </RecordPanel.List>

        {detail ? (
          <RecordPanel.Detail
            title={isDraftSelected ? t('namesTab.newName') : t('namesTab.detailTitle')}
            isDraft={isDraftSelected}
          >
            {detail}
          </RecordPanel.Detail>
        ) : null}
      </RecordPanel.Body>
    </RecordPanel.Root>
  );
}

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

/** A saved name's row label, falling back when every part is blank. */
function rowLabel(name: PersonName | undefined, t: TranslateFn): string {
  if (!name) return t('table.unknownName');
  return formatName(name).full;
}

/**
 * A draft shows what has been typed so far, formatted by the same rules as a
 * saved name so the row does not change shape the moment it is created.
 */
function draftLabel(draft: NameForm, t: TranslateFn): string {
  const parts = toNameParts(draft);
  const isBlank = Object.values(parts).every((part) => part === null);
  return isBlank ? t('namesTab.untitled') : formatName(parts).full;
}
