import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CenteredMessage } from '$components/centered-message';
import { Icon, type IconName } from '$components/icon';
import { NoteDetail, type NoteTargetInfo } from '$components/person-notes/note-detail';
import {
  emptyNoteForm,
  isNoteFormComplete,
  isSameNotePayload,
  toNoteForm,
  toNotePayload,
  type NoteForm,
} from '$components/person-notes/note-form';
import {
  NoteTargetPicker,
  type NoteTargetOption,
} from '$components/person-notes/note-target-picker';
import { PersonNotesFilterToolbar, type PersonNoteFilter } from '$components/person-notes-filters';
import {
  childLabel,
  siblingLabel,
  spouseLabel,
  type RelationLabelKey,
} from '$components/person-relations/relation-label';
import * as card from '$components/ui/card.css';
import { button } from '$components/ui/button.css';
import { DraftFooter, InlineDelete } from '$components/record-panel/record-actions';
import { DRAFT_ID, RecordPanel } from '$components/record-panel/record-panel';
import { RecordRow } from '$components/record-panel/record-row';
import { Button } from '$components/ui/button';
import { Typography } from '$components/ui/typography';
import { useCreateNote, useDeleteNote, usePersonNotes, useUpdateNote } from '$hooks/usePersonNotes';
import { useIndividual } from '$hooks/useIndividuals';
import { usePersonEvents, type PersonEventRow } from '$hooks/usePersonEvents';
import { usePersonRelations, type PersonRelationsResult } from '$hooks/usePersonRelations';
import { formatName } from '$db-tree/names';
import { eventDateDisplay } from '$lib/event-columns';
import { eventTypeLabel } from '$lib/eventTypeLabel';
import type { Note, NoteScope } from '$types/database';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

const SCOPE_ORDER: readonly NoteScope[] = ['person', 'event', 'relation'];
const SCOPE_ICON: Record<NoteScope, IconName> = {
  person: 'user',
  event: 'calendar',
  relation: 'link',
};

/** A note's fixed icon + "kind" line, e.g. the "Événement" under an event note's target label. */
function scopeTargetMeta(scope: NoteScope, t: TranslateFn): { icon: IconName; kind: string } {
  return { icon: SCOPE_ICON[scope], kind: t(`notesTab.target.${scope}`) };
}

/** A note's fixed target, resolved to display fields — see `note-detail.tsx`'s doc comment on why it is never editable. */
interface NoteTarget {
  scope: NoteScope;
  eventId?: string;
  familyMemberId?: string;
  info: NoteTargetInfo;
}

interface NoteDraft {
  target: NoteTarget;
  form: NoteForm;
}

/**
 * One of this person's own relations, flattened into a pickable target.
 *
 * `id` is unique per option (father/mother share one `family_members` row —
 * see `person-relations.ts`'s doc comment — so it cannot double as the
 * picker's key); `memberId` is the actual storage target a note attaches to.
 */
interface RelationTargetOption {
  id: string;
  memberId: string;
  personName: string;
  relationLabel: string;
}

function relationLabelText(key: RelationLabelKey, t: TranslateFn): string {
  return t(`relations.labels.${key}`);
}

function flattenRelationTargets(
  data: PersonRelationsResult | undefined,
  t: TranslateFn
): RelationTargetOption[] {
  if (!data) return [];
  const options: RelationTargetOption[] = [];

  // Father and mother are offered as one target, never two: both edit the
  // subject's own row in their parent family (see `person-relations.ts`'s
  // doc comment) — there is no separate "father" vs "mother" fact to attach
  // a note to, only the one membership. Splitting them into two picker
  // options would let a note say "about the mother" while actually storing
  // the shared `memberId`, which always resolves back to whichever parent
  // was pushed first.
  if (data.parentMembership) {
    const parents = [data.father, data.mother].filter(
      (person): person is NonNullable<typeof person> => person !== null
    );
    if (parents.length > 0) {
      options.push({
        id: 'parents',
        memberId: data.parentMembership.memberId,
        personName: parents.map((person) => formatName(person.primaryName).full).join(', '),
        relationLabel: t('overview.parents.title'),
      });
    }
  }

  for (const sibling of data.siblings) {
    options.push({
      id: `sibling:${sibling.id}`,
      memberId: sibling.memberId,
      personName: formatName(sibling.primaryName).full,
      relationLabel: relationLabelText(siblingLabel(sibling, data.parentFamilyId), t),
    });
  }

  for (const union of data.spouseUnions) {
    if (union.spouse) {
      options.push({
        id: `spouse:${union.familyId}`,
        memberId: union.spouse.memberId,
        personName: formatName(union.spouse.primaryName).full,
        relationLabel: relationLabelText(spouseLabel(union.spouse.gender), t),
      });
    }
    for (const child of union.children) {
      options.push({
        id: `child:${child.id}`,
        memberId: child.memberId,
        personName: formatName(child.primaryName).full,
        relationLabel: relationLabelText(childLabel(child.gender), t),
      });
    }
  }

  return options;
}

function eventTargetLabel(event: PersonEventRow, tEvents: TranslateFn): string {
  const date = eventDateDisplay(event);
  const type = eventTypeLabel(event.eventType, tEvents);
  return date ? `${type} · ${date}` : type;
}

/** A note's own row/detail excerpt: its text, or a placeholder for a still-empty draft. */
function noteExcerpt(text: string, t: TranslateFn): string {
  return text.trim() || t('notesTab.untitled');
}

/**
 * The Notes tab: every note connected to one person — about themself, about
 * one of their own events, or about one of their own relations — grouped
 * into three scope cards and edited through the shared {@link RecordPanel}.
 *
 * A note's target is fixed at creation: the person-scope "add" always
 * targets this tab's own person; the event/relation "add" opens a
 * {@link NoteTargetPicker} over this person's own events/relations (loaded
 * for their own tabs already) and submits the draft in the same step —
 * mirroring `PersonRelationsPage`'s pick-and-submit flow. See
 * `note-detail.tsx` for why the target cannot change afterward.
 */
export function PersonNotesPage(): JSX.Element {
  const { individualId } = useParams({
    from: '/tree/$treeId/individual/$individualId/notes',
  });
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const { t: tEvents } = useTranslation('events');

  const { data: notes, isLoading, isError } = usePersonNotes(individualId);
  const { data: individual } = useIndividual(individualId);
  const { data: events } = usePersonEvents(individualId);
  const { data: relationsData } = usePersonRelations(individualId);

  const createNote = useCreateNote(individualId);
  const updateNote = useUpdateNote(individualId);
  const deleteNote = useDeleteNote(individualId);

  const [filter, setFilter] = useState<PersonNoteFilter>('all');
  const [draft, setDraft] = useState<NoteDraft | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Editing buffer for the selected saved note — see PersonNamesPage's identical pattern for why it is re-seeded during render.
  const [buffer, setBuffer] = useState<NoteForm | null>(null);
  const [bufferFor, setBufferFor] = useState<string | null>(null);

  const rows = useMemo(() => notes ?? [], [notes]);
  const personName = individual ? formatName(individual.primaryName).full : '';
  const eventOptions = useMemo(() => events ?? [], [events]);
  const relationOptions = useMemo(
    () => flattenRelationTargets(relationsData, t),
    [relationsData, t]
  );

  // O(1) target lookups for `resolveTarget`, rebuilt only when the underlying
  // events/relations actually change — not on every keystroke elsewhere on
  // the page (see the file's PR discussion: a per-note `.find()` scan was an
  // O(notes × events) re-render cost).
  const eventById = useMemo(
    () => new Map(eventOptions.map((event) => [event.id, event])),
    [eventOptions]
  );
  // First match wins for a shared `memberId` (father/mother — see
  // `RelationTargetOption`'s doc comment), matching the previous `.find()`.
  const relationByMemberId = useMemo(() => {
    const map = new Map<string, RelationTargetOption>();
    for (const option of relationOptions) {
      if (!map.has(option.memberId)) map.set(option.memberId, option);
    }
    return map;
  }, [relationOptions]);
  const relationByOptionId = useMemo(
    () => new Map(relationOptions.map((option) => [option.id, option])),
    [relationOptions]
  );
  const eventPickerOptions: NoteTargetOption[] = useMemo(
    () =>
      eventOptions.map((event) => ({
        id: event.id,
        title: eventTypeLabel(event.eventType, tEvents),
        meta: eventDateDisplay(event) ?? undefined,
      })),
    [eventOptions, tEvents]
  );
  const relationPickerOptions: NoteTargetOption[] = useMemo(
    () =>
      relationOptions.map((option) => ({
        id: option.id,
        title: option.personName,
        meta: option.relationLabel,
      })),
    [relationOptions]
  );

  function resolveTarget(note: Note): NoteTargetInfo {
    const meta = scopeTargetMeta(note.scope, t);
    if (note.scope === 'event') {
      const event = eventById.get(note.eventId ?? '');
      return {
        ...meta,
        label: event ? eventTargetLabel(event, tEvents) : t('notesTab.target.unknownEvent'),
      };
    }
    if (note.scope === 'relation') {
      const relation = relationByMemberId.get(note.familyMemberId ?? '');
      return {
        ...meta,
        label: relation
          ? `${relation.personName} · ${relation.relationLabel}`
          : t('notesTab.target.unknownRelation'),
      };
    }
    return { ...meta, label: personName };
  }

  const notesByScope = useMemo(() => {
    const grouped: Record<NoteScope, Note[]> = { person: [], event: [], relation: [] };
    for (const note of rows) grouped[note.scope].push(note);
    return grouped;
  }, [rows]);

  // A draft always stays visible once started, like PersonEventsPage's — its own card is forced open even if the filter would otherwise hide it.
  function isScopeVisible(scope: NoteScope): boolean {
    return filter === 'all' || filter === scope || draft?.target.scope === scope;
  }

  const isDraftSelected = selectedId === DRAFT_ID && draft !== null;
  const visibleRows = SCOPE_ORDER.filter(isScopeVisible).flatMap((scope) => notesByScope[scope]);
  const isSelectionHidden =
    selectedId !== null &&
    selectedId !== DRAFT_ID &&
    !visibleRows.some((note) => note.id === selectedId);
  const activeId = isDraftSelected
    ? DRAFT_ID
    : ((isSelectionHidden ? null : selectedId) ?? visibleRows[0]?.id ?? null);
  const savedNote = isDraftSelected ? undefined : rows.find((note) => note.id === activeId);

  if (isLoading) return <CenteredMessage>{t('overview.loading')}</CenteredMessage>;
  if (isError) return <CenteredMessage>{tCommon('errors.loadFailed')}</CenteredMessage>;

  const needsBufferSeed = bufferFor !== activeId || (buffer === null && savedNote !== undefined);
  if (!isDraftSelected && needsBufferSeed) {
    setBufferFor(activeId ?? null);
    setBuffer(savedNote ? toNoteForm(savedNote) : null);
  }

  const value = isDraftSelected ? (draft?.form ?? null) : buffer;

  function patchValue(patch: Partial<NoteForm>): void {
    if (isDraftSelected) {
      setDraft((current) =>
        current ? { ...current, form: { ...current.form, ...patch } } : current
      );
    } else {
      setBuffer((current) => (current ? { ...current, ...patch } : current));
    }
  }

  function commitEdit(patch?: Partial<NoteForm>): void {
    if (isDraftSelected || !activeId || !buffer || !savedNote) return;
    const next = { ...buffer, ...patch };
    if (isSameNotePayload(toNoteForm(savedNote), next)) return;
    updateNote.mutate({ id: activeId, input: toNotePayload(next) });
  }

  function startDraft(target: NoteTarget): void {
    setDraft({ target, form: emptyNoteForm() });
    setSelectedId(DRAFT_ID);
  }

  function cancelDraft(): void {
    setDraft(null);
    setSelectedId(null);
  }

  function submitDraft(): void {
    if (!draft) return;
    createNote.mutate(
      {
        scope: draft.target.scope,
        eventId: draft.target.eventId,
        familyMemberId: draft.target.familyMemberId,
        ...toNotePayload(draft.form),
      },
      {
        onSuccess: (newId) => {
          setDraft(null);
          setSelectedId(newId);
        },
      }
    );
  }

  function removeNote(note: Note): void {
    deleteNote.mutate({ id: note.id, scope: note.scope }, { onSuccess: () => setSelectedId(null) });
  }

  function startPersonDraft(): void {
    startDraft({
      scope: 'person',
      info: { ...scopeTargetMeta('person', t), label: personName },
    });
  }

  const addPersonButton = (
    <Button variant="ghost" onClick={startPersonDraft}>
      <Icon name="plus" size={15} />
      {t('notesTab.add.person')}
    </Button>
  );

  const eventPicker = (
    <NoteTargetPicker
      label={t('notesTab.add.event')}
      options={eventPickerOptions}
      triggerClassName={button({ variant: 'ghost' })}
      onSelect={(option) => {
        const event = eventById.get(option.id);
        if (!event) return;
        startDraft({
          scope: 'event',
          eventId: event.id,
          info: { ...scopeTargetMeta('event', t), label: eventTargetLabel(event, tEvents) },
        });
      }}
    />
  );

  const relationPicker = (
    <NoteTargetPicker
      label={t('notesTab.add.relation')}
      options={relationPickerOptions}
      triggerClassName={button({ variant: 'ghost' })}
      onSelect={(option) => {
        const relation = relationByOptionId.get(option.id);
        if (!relation) return;
        startDraft({
          scope: 'relation',
          familyMemberId: relation.memberId,
          info: {
            ...scopeTargetMeta('relation', t),
            label: `${relation.personName} · ${relation.relationLabel}`,
          },
        });
      }}
    />
  );

  let footer: ReactNode = null;
  if (isDraftSelected && value) {
    footer = (
      <DraftFooter
        createLabel={t('notesTab.create')}
        canCreate={isNoteFormComplete(value)}
        isCreating={createNote.isPending}
        onCancel={cancelDraft}
        onCreate={submitDraft}
      />
    );
  } else if (savedNote) {
    footer = (
      <InlineDelete
        key={savedNote.id}
        triggerLabel={t('notesTab.delete.trigger')}
        question={t('notesTab.delete.question')}
        isDeleting={deleteNote.isPending}
        onDelete={() => removeNote(savedNote)}
      />
    );
  }

  let activeTarget: NoteTargetInfo | null = null;
  if (isDraftSelected) activeTarget = draft?.target.info ?? null;
  else if (savedNote) activeTarget = resolveTarget(savedNote);

  const detail =
    value && activeTarget ? (
      <NoteDetail
        target={activeTarget}
        value={value}
        onChange={patchValue}
        onCommit={commitEdit}
        footer={footer}
      />
    ) : null;

  function renderRow(note: Note): ReactNode {
    const target = resolveTarget(note);
    return (
      <Fragment key={note.id}>
        <RecordRow
          icon="notebook-pen"
          title={noteExcerpt(note.text, t)}
          meta={note.scope === 'person' ? undefined : target.label}
          titleSuffix={
            note.isPrivate ? (
              <Icon name="lock" size={13} aria-hidden={false} aria-label={t('notesTab.private')} />
            ) : null
          }
          isSelected={note.id === activeId}
          onSelect={() => setSelectedId(note.id)}
        />
        {note.id === activeId && detail ? (
          <RecordPanel.InlineDetail>{detail}</RecordPanel.InlineDetail>
        ) : null}
      </Fragment>
    );
  }

  function renderDraftRow(scope: NoteScope): ReactNode {
    if (!draft || draft.target.scope !== scope) return null;
    return (
      <Fragment>
        <RecordRow
          icon="notebook-pen"
          title={
            <Typography family="serif" tone="muted">
              {noteExcerpt(draft.form.text, t)}
            </Typography>
          }
          meta={scope === 'person' ? undefined : draft.target.info.label}
          isDraft
          isSelected={isDraftSelected}
          onSelect={() => setSelectedId(DRAFT_ID)}
        />
        {isDraftSelected && detail ? (
          <RecordPanel.InlineDetail>{detail}</RecordPanel.InlineDetail>
        ) : null}
      </Fragment>
    );
  }

  function cardBody(scope: NoteScope, scopeNotes: Note[], emptyLabel: string): ReactNode {
    const isEmpty = scopeNotes.length === 0 && draft?.target.scope !== scope;
    return (
      <>
        {scopeNotes.map(renderRow)}
        {renderDraftRow(scope)}
        {isEmpty ? (
          <div className={card.row}>
            <Typography family="serif" tone="muted">
              {emptyLabel}
            </Typography>
          </div>
        ) : null}
      </>
    );
  }

  const scopeCards: {
    scope: NoteScope;
    title: string;
    empty: string;
    footer: ReactNode;
  }[] = [
    {
      scope: 'person',
      title: t('notesTab.group.person.title'),
      empty: t('notesTab.group.person.empty'),
      footer: addPersonButton,
    },
    {
      scope: 'event',
      title: t('notesTab.group.event.title'),
      empty: t('notesTab.group.event.empty'),
      footer: eventPicker,
    },
    {
      scope: 'relation',
      title: t('notesTab.group.relation.title'),
      empty: t('notesTab.group.relation.empty'),
      footer: relationPicker,
    },
  ];

  return (
    <RecordPanel.Root>
      <RecordPanel.Toolbar>
        <PersonNotesFilterToolbar value={filter} onChange={setFilter} />
        {addPersonButton}
      </RecordPanel.Toolbar>

      <RecordPanel.Body>
        <RecordPanel.List>
          {scopeCards.map((card) => {
            if (!isScopeVisible(card.scope)) return null;
            const scopeNotes = notesByScope[card.scope];
            return (
              <RecordPanel.ListCard
                key={card.scope}
                title={card.title}
                count={scopeNotes.length + (draft?.target.scope === card.scope ? 1 : 0)}
                footer={card.footer}
              >
                {cardBody(card.scope, scopeNotes, card.empty)}
              </RecordPanel.ListCard>
            );
          })}
        </RecordPanel.List>

        {detail ? (
          <RecordPanel.Detail
            title={isDraftSelected ? t('notesTab.newNote') : t('notesTab.detailTitle')}
            isDraft={isDraftSelected}
          >
            {detail}
          </RecordPanel.Detail>
        ) : null}
      </RecordPanel.Body>
    </RecordPanel.Root>
  );
}
