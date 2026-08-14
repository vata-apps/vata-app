import { Fragment, useState, type ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CenteredMessage } from '$components/centered-message';
import { Icon } from '$components/icon';
import {
  EventDetail,
  type EventDetailContext,
  type EventDetailParticipants,
} from '$components/person-events/event-detail';
import type { EventParticipantSelection } from '$components/person-events/event-participant-picker';
import {
  affectsTreeWideDisplay,
  emptyEventForm,
  isEventFormComplete,
  isSameEventPayload,
  toCreateEventInput,
  toEventForm,
  toEventPayload,
  type EventForm,
} from '$components/person-events/event-form';
import {
  PersonEventsFilterToolbar,
  type PersonEventFilter,
} from '$components/person-events-filters';
import {
  deleteQuestionWithNoteCount,
  DraftFooter,
  InlineDelete,
} from '$components/record-panel/record-actions';
import { DRAFT_ID, RecordPanel } from '$components/record-panel/record-panel';
import { RecordRow } from '$components/record-panel/record-row';
import { Button } from '$components/ui/button';
import { Typography } from '$components/ui/typography';
import { useEventTypes } from '$hooks/useEvents';
import {
  useAddEventParticipant,
  useCreateEvent,
  useDeleteEvent,
  useEventCitations,
  useEventParticipants,
  usePersonEvents,
  useRemoveEventParticipant,
  useUpdateEvent,
  useUpdateParticipantRole,
  type PersonEventRow,
} from '$hooks/usePersonEvents';
import { useEventNoteCount } from '$hooks/usePersonNotes';
import { eventDateDisplay } from '$lib/event-columns';
import { eventTypeLabel } from '$lib/eventTypeLabel';
import { principalsText } from '$lib/principals-text';
import { resetBufferOnError } from '$lib/toast';
import { useAppStore } from '$/store/app-store';
import type { ParticipantRole } from '$types/database';

type EventGroup = 'personal' | 'other';

/** "Vie personnelle" covers the person's own principal events and unions (marriages, …); "autres rôles" is a secondary role in someone else's event. */
function groupOf(entry: PersonEventRow): EventGroup {
  return entry.scope === 'secondary' ? 'other' : 'personal';
}

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

/** A saved event's row title: its type label. */
function rowLabel(entry: PersonEventRow, tEvents: TranslateFn): string {
  return eventTypeLabel(entry.eventType, tEvents);
}

/** "Vie personnelle" row meta: the date and place, matching the old table's columns. */
function personalMeta(entry: PersonEventRow, tEvents: TranslateFn): string {
  const date = eventDateDisplay(entry);
  const place = entry.place?.name ?? null;
  return [date, place].filter(Boolean).join(' · ') || tEvents('table.dateUnknown');
}

/** "Autres rôles" row meta: this person's role, and whose event it is. */
function otherMeta(entry: PersonEventRow, tEvents: TranslateFn): string {
  const unknownPrincipal = tEvents('table.unknownPrincipal');
  const role = entry.role ? tEvents(`roles.${entry.role}`) : '';
  return `${role} — ${principalsText(entry.principals, unknownPrincipal)}`;
}

/**
 * A draft shows what has been typed so far: its chosen type, or a
 * placeholder while none is set yet.
 */
function draftLabel(
  draft: EventForm,
  eventTypes: ReturnType<typeof useEventTypes>['data'],
  t: TranslateFn,
  tEvents: TranslateFn
): string {
  const type = (eventTypes ?? []).find((candidate) => candidate.id === draft.eventTypeId);
  return type ? eventTypeLabel(type, tEvents) : t('eventsTab.untitled');
}

/**
 * The Events tab: every event connected to one person, grouped into "vie
 * personnelle" and "autres rôles" and edited through the shared
 * {@link RecordPanel}. Mirrors `PersonNamesPage`'s commit-on-blur editing and
 * draft lifecycle; see that file's doc comment for the general pattern.
 */
export function PersonEventsPage(): JSX.Element {
  const { individualId } = useParams({
    from: '/tree/$treeId/individual/$individualId/events',
  });
  const { t } = useTranslation('individuals');
  const { t: tEvents } = useTranslation('events');
  const { t: tCommon } = useTranslation('common');

  const { data: rows, isLoading, isError } = usePersonEvents(individualId);
  // Unfiltered by category: a union entry (e.g. a marriage) carries a
  // `family` type, and the type Select must be able to resolve and display
  // it even though this tab only ever creates `individual` ones.
  const { data: eventTypes } = useEventTypes();

  const createEvent = useCreateEvent(individualId);
  const updateEvent = useUpdateEvent(individualId);
  const deleteEvent = useDeleteEvent(individualId);
  const addParticipant = useAddEventParticipant(individualId);
  const removeParticipant = useRemoveEventParticipant(individualId);
  const updateParticipantRole = useUpdateParticipantRole(individualId);
  const addRecentEventParticipant = useAppStore((state) => state.addRecentEventParticipant);

  const [draft, setDraft] = useState<EventForm | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<PersonEventFilter>('all');

  // Editing buffer for the selected saved event — see PersonNamesPage's identical pattern for why it is re-seeded during render.
  const [buffer, setBuffer] = useState<EventForm | null>(null);
  const [bufferFor, setBufferFor] = useState<string | null>(null);

  const allRows = rows ?? [];
  const personalRows = allRows.filter((row) => groupOf(row) === 'personal');
  const otherRows = allRows.filter((row) => groupOf(row) === 'other');
  const showPersonalRows = filter !== 'other';
  const showOtherRows = filter !== 'personal';
  // A draft always stays visible once started, like PersonNamesPage's — its own card is forced open even if the filter would otherwise hide it.
  const showPersonalCard = showPersonalRows || draft !== null;

  const visibleSavedRows = [
    ...(showPersonalRows ? personalRows : []),
    ...(showOtherRows ? otherRows : []),
  ];
  const isSelectionHidden =
    selectedId !== null &&
    selectedId !== DRAFT_ID &&
    !visibleSavedRows.some((row) => row.id === selectedId);
  const activeId = (isSelectionHidden ? null : selectedId) ?? visibleSavedRows[0]?.id ?? null;
  const isDraftSelected = activeId === DRAFT_ID;
  const selectedEvent = allRows.find((row) => row.id === activeId);
  const savedEvent = isDraftSelected ? undefined : selectedEvent;

  // Disabled while nothing is selected yet, since nothing can cite or list participants for a record that does not exist or isn't known yet.
  const eventCitations = useEventCitations(savedEvent ? savedEvent.id : null);
  const eventParticipants = useEventParticipants(savedEvent ? savedEvent.id : null);
  // Feeds the delete confirmation's "this will also delete N notes" warning — see useEventNoteCount's doc comment.
  const eventNoteCount = useEventNoteCount(savedEvent ? savedEvent.id : null);

  if (isLoading) return <CenteredMessage>{t('overview.loading')}</CenteredMessage>;
  if (isError) return <CenteredMessage>{tCommon('errors.loadFailed')}</CenteredMessage>;

  const needsBufferSeed =
    bufferFor !== activeId || (buffer === null && selectedEvent !== undefined);
  if (!isDraftSelected && needsBufferSeed) {
    setBufferFor(activeId);
    setBuffer(selectedEvent ? toEventForm(selectedEvent) : null);
  }

  const value = isDraftSelected ? draft : buffer;

  function patchValue(patch: Partial<EventForm>): void {
    if (isDraftSelected) {
      setDraft((current) => (current ? { ...current, ...patch } : current));
    } else {
      setBuffer((current) => (current ? { ...current, ...patch } : current));
    }
  }

  function commitEdit(patch?: Partial<EventForm>): void {
    if (isDraftSelected || !activeId || !buffer || !selectedEvent) return;
    const next = { ...buffer, ...patch };
    if (isSameEventPayload(toEventForm(selectedEvent), next)) return;
    updateEvent.mutate(
      {
        id: activeId,
        input: toEventPayload(next),
        scope: selectedEvent.scope,
        affectsTreeWideDisplay: affectsTreeWideDisplay(next.eventTypeId, eventTypes ?? []),
      },
      resetBufferOnError(setBufferFor, activeId)
    );
  }

  function startDraft(): void {
    setDraft((current) => current ?? emptyEventForm());
    setSelectedId(DRAFT_ID);
  }

  function cancelDraft(): void {
    setDraft(null);
    setSelectedId(null);
  }

  function submitDraft(): void {
    if (!draft) return;
    createEvent.mutate(
      {
        input: toCreateEventInput(draft),
        affectsTreeWideDisplay: affectsTreeWideDisplay(draft.eventTypeId, eventTypes ?? []),
      },
      {
        onSuccess: ({ eventId }) => {
          setDraft(null);
          setSelectedId(eventId);
        },
      }
    );
  }

  function removeEvent(event: PersonEventRow): void {
    deleteEvent.mutate(
      {
        id: event.id,
        scope: event.scope,
        affectsTreeWideDisplay: affectsTreeWideDisplay(event.eventTypeId, eventTypes ?? []),
      },
      { onSuccess: () => setSelectedId(null) }
    );
  }

  function handleAddParticipant(event: PersonEventRow, selection: EventParticipantSelection): void {
    addParticipant.mutate(
      {
        eventId: event.id,
        role: 'witness',
        individualId: selection.id,
        createNew: selection.createNew,
      },
      { onSuccess: (result) => addRecentEventParticipant(result.individualId) }
    );
  }

  function handleRemoveParticipant(
    event: PersonEventRow,
    participantId: string,
    participantIndividualId?: string
  ): void {
    removeParticipant.mutate({ eventId: event.id, participantId, participantIndividualId });
  }

  function handleParticipantRoleChange(
    event: PersonEventRow,
    participantId: string,
    role: ParticipantRole,
    isOwnParticipant = false,
    participantIndividualId?: string
  ): void {
    updateParticipantRole.mutate({
      eventId: event.id,
      participantId,
      role,
      isOwnParticipant,
      participantIndividualId,
    });
  }

  const addButton = (
    <Button variant="ghost" onClick={startDraft}>
      <Icon name="plus" size={15} />
      {t('eventsTab.add')}
    </Button>
  );

  // The individual-owned participant row for the tab's own person — absent
  // for a `union` entry, where the shared family row carries no individual
  // role for either spouse to edit.
  const ownParticipant =
    savedEvent && savedEvent.scope !== 'union'
      ? savedEvent.participants.find((participant) => participant.individualId === individualId)
      : undefined;

  let footer: ReactNode = null;
  if (isDraftSelected && value) {
    footer = (
      <DraftFooter
        createLabel={t('eventsTab.create')}
        canCreate={isEventFormComplete(value)}
        isCreating={createEvent.isPending}
        onCancel={cancelDraft}
        onCreate={submitDraft}
      />
    );
  } else if (savedEvent && savedEvent.scope === 'secondary' && ownParticipant) {
    // A secondary-role event belongs to someone else's record — "delete"
    // here must only remove this person's own participation, never the
    // shared event (which would also delete the principal's own record and
    // every other participant).
    footer = (
      <InlineDelete
        key={savedEvent.id}
        triggerLabel={t('eventsTab.delete.removeParticipation')}
        question={t('eventsTab.delete.removeParticipationQuestion', {
          name: rowLabel(savedEvent, tEvents),
        })}
        isDeleting={removeParticipant.isPending}
        onDelete={() => handleRemoveParticipant(savedEvent, ownParticipant.id)}
      />
    );
  } else if (savedEvent) {
    footer = (
      <InlineDelete
        key={savedEvent.id}
        triggerLabel={t('eventsTab.delete.trigger')}
        question={deleteQuestionWithNoteCount(
          t,
          'eventsTab.delete.question',
          { name: rowLabel(savedEvent, tEvents) },
          eventNoteCount.data ?? 0
        )}
        isDeleting={deleteEvent.isPending}
        onDelete={() => removeEvent(savedEvent)}
      />
    );
  }

  const context: EventDetailContext | undefined = savedEvent
    ? {
        role: savedEvent.scope === 'union' ? null : (ownParticipant?.role ?? null),
        onRoleChange: (role) => {
          if (ownParticipant)
            handleParticipantRoleChange(savedEvent, ownParticipant.id, role, true);
        },
        counterpartyName: savedEvent.counterpartyName,
        place: savedEvent.place,
      }
    : undefined;

  const otherParticipants = (eventParticipants.data ?? []).filter(
    (participant) => participant.individualId !== individualId
  );
  const participants: EventDetailParticipants | undefined = savedEvent
    ? {
        items: otherParticipants,
        excludeIds: [
          individualId,
          ...otherParticipants.map((participant) => participant.individualId),
        ],
        isAdding: addParticipant.isPending,
        onAdd: (selection) => handleAddParticipant(savedEvent, selection),
        onRemove: (participantId) =>
          handleRemoveParticipant(
            savedEvent,
            participantId,
            otherParticipants.find((participant) => participant.id === participantId)?.individualId
          ),
        onRoleChange: (participantId, role) =>
          handleParticipantRoleChange(
            savedEvent,
            participantId,
            role,
            false,
            otherParticipants.find((participant) => participant.id === participantId)?.individualId
          ),
      }
    : undefined;

  const detail = value ? (
    <EventDetail
      value={value}
      onChange={patchValue}
      onCommit={commitEdit}
      eventTypes={eventTypes ?? []}
      context={context}
      participants={participants}
      sources={
        savedEvent ? { count: savedEvent.sourceCount, citations: eventCitations.data } : undefined
      }
      footer={footer}
    />
  ) : null;

  function renderRow(entry: PersonEventRow, group: EventGroup): ReactNode {
    return (
      <Fragment key={entry.id}>
        <RecordRow
          icon="calendar"
          title={rowLabel(entry, tEvents)}
          meta={group === 'personal' ? personalMeta(entry, tEvents) : otherMeta(entry, tEvents)}
          sourceCount={entry.sourceCount}
          isSelected={entry.id === activeId}
          onSelect={() => setSelectedId(entry.id)}
        />
        {entry.id === activeId && detail ? (
          <RecordPanel.InlineDetail>{detail}</RecordPanel.InlineDetail>
        ) : null}
      </Fragment>
    );
  }

  return (
    <RecordPanel.Root>
      <RecordPanel.Toolbar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <PersonEventsFilterToolbar value={filter} onChange={setFilter} />
        </div>
        {addButton}
      </RecordPanel.Toolbar>

      <RecordPanel.Body>
        <RecordPanel.List>
          {showPersonalCard ? (
            <RecordPanel.ListCard
              title={t('eventsTab.group.personal.title')}
              count={(showPersonalRows ? personalRows.length : 0) + (draft ? 1 : 0)}
              footer={addButton}
            >
              {showPersonalRows ? personalRows.map((entry) => renderRow(entry, 'personal')) : null}

              {draft ? (
                <Fragment>
                  <RecordRow
                    icon="calendar"
                    title={
                      <Typography family="serif" tone="muted">
                        {draftLabel(draft, eventTypes, t, tEvents)}
                      </Typography>
                    }
                    isDraft
                    isSelected={isDraftSelected}
                    onSelect={() => setSelectedId(DRAFT_ID)}
                  />
                  {isDraftSelected && detail ? (
                    <RecordPanel.InlineDetail>{detail}</RecordPanel.InlineDetail>
                  ) : null}
                </Fragment>
              ) : null}
            </RecordPanel.ListCard>
          ) : null}

          {showOtherRows ? (
            <RecordPanel.ListCard title={t('eventsTab.group.other.title')} count={otherRows.length}>
              {otherRows.map((entry) => renderRow(entry, 'other'))}
            </RecordPanel.ListCard>
          ) : null}
        </RecordPanel.List>

        {detail ? (
          <RecordPanel.Detail
            title={isDraftSelected ? t('eventsTab.newEvent') : t('eventsTab.detailTitle')}
            isDraft={isDraftSelected}
          >
            {detail}
          </RecordPanel.Detail>
        ) : null}
      </RecordPanel.Body>
    </RecordPanel.Root>
  );
}
