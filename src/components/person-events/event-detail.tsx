/**
 * The fields of one event record, rendered inside the shared record panel.
 *
 * Purely presentational: the page owns the values and decides what a change
 * means (buffer a draft, or commit an edit on blur). The trailing action —
 * the draft footer or the inline delete — is injected as `footer`.
 *
 * Field ids come from `useId` because this body is mounted twice at once
 * (once inline under the row, once in the side panel).
 *
 * `context` (this person's own role/scope) and `participants`/`sources` are
 * all omitted for a draft — nothing can carry a role, a participant or a
 * citation on a record that does not exist yet.
 */
import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '../icon';
import { RecordSources, type RecordSourcesProps } from '../record-panel/record-sources';
import { Field } from '../ui/field';
import { IconButton } from '../ui/icon-button';
import { Select } from '../ui/select';
import { TextField } from '../ui/text-field';
import { Typography } from '../ui/typography';
import * as s from './event-detail.css';
import { EventParticipantPicker, type EventParticipantSelection } from './event-participant-picker';
import type { EventForm } from './event-form';
import { eventTypeLabel } from '$lib/eventTypeLabel';
import type { EventParticipantWithName } from '$db-tree/events';
import type { EventType, ParticipantRole, Place } from '$types/database';

const PARTICIPANT_ROLES: readonly ParticipantRole[] = [
  'principal',
  'witness',
  'officiant',
  'godparent',
  'informant',
  'other',
];

/** The `ParticipantRole` select, shared by "this person's own role" and each other participant's role. */
function RoleSelect({
  id,
  ariaLabel,
  value,
  onValueChange,
}: {
  id?: string;
  ariaLabel?: string;
  value: ParticipantRole;
  onValueChange: (role: ParticipantRole) => void;
}): JSX.Element {
  const { t: tEvents } = useTranslation('events');

  return (
    <Select.Root
      value={value}
      onValueChange={(next) => {
        if (next === null) return;
        onValueChange(next);
      }}
    >
      <Select.Trigger id={id} aria-label={ariaLabel}>
        <Select.Value>
          {(selected) => (selected ? tEvents(`roles.${selected as ParticipantRole}`) : '')}
        </Select.Value>
        <Select.Icon>
          <Icon name="chevron-down" size={14} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4}>
          <Select.Popup>
            {PARTICIPANT_ROLES.map((role) => (
              <Select.Item key={role} value={role}>
                <Select.ItemText>{tEvents(`roles.${role}`)}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

/** This person's own relationship to the saved event. `role` is `null` for a union entry — no individual-owned participant row exists to edit. */
export interface EventDetailContext {
  role: ParticipantRole | null;
  onRoleChange: (role: ParticipantRole) => void;
  counterpartyName: string | null;
  place: Place | null;
}

export interface EventDetailParticipants {
  items: EventParticipantWithName[];
  /** Individual ids to hide from the add picker — the tab's own person plus everyone already listed. */
  excludeIds: string[];
  isAdding: boolean;
  onAdd: (selection: EventParticipantSelection) => void;
  onRemove: (participantId: string) => void;
  onRoleChange: (participantId: string, role: ParticipantRole) => void;
}

/** Props for the read-only Sources section. Omitted entirely for a draft. */
export type EventDetailSources = Omit<RecordSourcesProps, 'title'>;

export interface EventDetailProps {
  value: EventForm;
  /** Records a keystroke — cheap, local, not yet persisted. */
  onChange: (patch: Partial<EventForm>) => void;
  /** Called when an edit should be persisted: on blur for text fields, immediately for the type select. */
  onCommit: (patch?: Partial<EventForm>) => void;
  eventTypes: EventType[];
  context?: EventDetailContext;
  participants?: EventDetailParticipants;
  sources?: EventDetailSources;
  /** Draft footer or inline delete, depending on whether the record exists. */
  footer: ReactNode;
}

export function EventDetail({
  value,
  onChange,
  onCommit,
  eventTypes,
  context,
  participants,
  sources,
  footer,
}: EventDetailProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tEvents } = useTranslation('events');
  const id = useId();

  return (
    <div className={s.body}>
      <div className={s.typeAndDate}>
        <Field label={t('eventsTab.fields.type')} htmlFor={`${id}-type`}>
          <Select.Root
            value={value.eventTypeId === '' ? null : value.eventTypeId}
            onValueChange={(next) => {
              if (next === null) return;
              onChange({ eventTypeId: next });
              onCommit({ eventTypeId: next });
            }}
            // The type is fixed once the event exists — different types carry
            // different participant shapes (e.g. a marriage's two spouses),
            // so changing it in place would leave stale participants behind.
            // Delete and recreate instead; only a draft's type is editable.
            disabled={context !== undefined}
          >
            <Select.Trigger id={`${id}-type`}>
              <Select.Value>
                {(selected) => {
                  const type = eventTypes.find((candidate) => candidate.id === selected);
                  return type
                    ? eventTypeLabel(type, tEvents)
                    : t('eventsTab.fields.typePlaceholder');
                }}
              </Select.Value>
              <Select.Icon>
                <Icon name="chevron-down" size={14} />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner sideOffset={4}>
                <Select.Popup>
                  {eventTypes.map((type) => (
                    <Select.Item key={type.id} value={type.id}>
                      <Select.ItemText>{eventTypeLabel(type, tEvents)}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </Field>

        <Field label={t('eventsTab.fields.date')} htmlFor={`${id}-date`}>
          <TextField
            id={`${id}-date`}
            value={value.dateOriginal}
            placeholder={t('eventsTab.fields.datePlaceholder')}
            onChange={(event) => onChange({ dateOriginal: event.target.value })}
            onBlur={() => onCommit()}
          />
        </Field>
      </div>

      <Field label={t('eventsTab.fields.place')} htmlFor={`${id}-place`}>
        <TextField
          id={`${id}-place`}
          value={context?.place?.name ?? ''}
          placeholder={t('eventsTab.fields.placeUnavailable')}
          disabled
        />
      </Field>

      {context ? (
        <Field label={t('eventsTab.fields.role')}>
          {context.role !== null ? (
            <RoleSelect value={context.role} onValueChange={context.onRoleChange} />
          ) : (
            <div className={s.roleStatic}>
              <Typography>{t('eventsTab.fields.roleSpouse')}</Typography>
              {context.counterpartyName ? (
                <Typography size="xs" tone="muted">
                  {context.counterpartyName}
                </Typography>
              ) : null}
            </div>
          )}
        </Field>
      ) : null}

      {participants ? <EventParticipantsSection participants={participants} /> : null}

      {sources ? <RecordSources title={t('eventsTab.sources.title')} {...sources} /> : null}

      <Field label={t('eventsTab.fields.note')} htmlFor={`${id}-note`}>
        <TextField
          id={`${id}-note`}
          multiline
          value={value.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          onBlur={() => onCommit()}
        />
      </Field>

      <div className={s.section}>
        <Typography weight="semibold">{t('eventsTab.media.title')}</Typography>
        <Typography size="xs" tone="muted">
          {t('eventsTab.media.comingSoon')}
        </Typography>
      </div>

      {footer}
    </div>
  );
}

/** The event's other participants: removable chips with an inline role select, plus the add-participant picker. */
function EventParticipantsSection({
  participants,
}: {
  participants: EventDetailParticipants;
}): JSX.Element {
  const { t } = useTranslation('individuals');
  const roleSelectId = useId();

  return (
    <div className={s.section}>
      <Typography weight="semibold">{t('eventsTab.participants.title')}</Typography>

      {participants.items.length === 0 ? (
        <Typography size="xs" tone="muted">
          {t('eventsTab.participants.empty')}
        </Typography>
      ) : (
        <ul className={s.participantsList}>
          {participants.items.map((participant) => (
            <li key={participant.id} className={s.participantRow}>
              <Typography className={s.participantName} size="sm">
                {participant.displayName}
              </Typography>
              <div className={s.participantRole}>
                <RoleSelect
                  id={`${roleSelectId}-${participant.id}`}
                  ariaLabel={t('eventsTab.fields.role')}
                  value={participant.role}
                  onValueChange={(role) => participants.onRoleChange(participant.id, role)}
                />
              </div>
              <IconButton
                aria-label={t('eventsTab.participants.removeAria', {
                  name: participant.displayName,
                })}
                disabled={participants.isAdding}
                onClick={() => participants.onRemove(participant.id)}
              >
                <Icon name="x" size={14} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <EventParticipantPicker
        onSelect={participants.onAdd}
        excludeIds={participants.excludeIds}
        disabled={participants.isAdding}
      />
    </div>
  );
}
