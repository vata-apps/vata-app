import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { Button } from '$components/ui/button';
import { Dialog } from '$components/ui/dialog';
import { IconButton } from '$components/ui/icon-button';
import { Select } from '$components/ui/select';
import { SegmentedControl } from '$components/ui/segmented-control';
import { Switch } from '$components/ui/switch';
import { TextField } from '$components/ui/text-field';
import { Icon } from '$components/icon';
import { useEventTypes } from '$hooks/useEvents';
import { useParentFamily, useSpouseFamilies } from '$hooks/useFamilies';
import { useIndividual } from '$hooks/useIndividuals';
import { usePersonEvents } from '$hooks/usePersonEvents';
import { eventTypeLabel, type TranslateFn } from '$lib/eventTypeLabel';
import { queryKeys } from '$lib/query-keys';
import {
  FamilyManager,
  type PersonRelationsInput,
  type RelationPersonInput,
} from '$managers/FamilyManager';
import { IndividualManager } from '$managers/IndividualManager';
import type {
  EventType,
  FamilyWithMembers,
  Gender,
  IndividualWithDetails,
  Name,
  NameType,
} from '$types/database';
import type { PersonEventEntry } from '$db-tree/person-events';
import { formatLifeYears, initialsFromDisplayName, personDisplayFields } from './person-display';
import { PersonPicker, type PersonPickerSelection } from './person-picker';
import * as s from './person-editor.css';

const NAME_TYPES: NameType[] = [
  'birth',
  'married',
  'adopted',
  'aka',
  'immigrant',
  'religious',
  'other',
];

const SEX_VALUES: Gender[] = ['F', 'M', 'U'];

interface AltNameRow {
  /** Stable React key — the DB id for existing rows, a local id for new ones. */
  key: string;
  id?: string;
  type: NameType;
  givenNames: string;
  surname: string;
}

interface EventRow {
  key: string;
  id?: string;
  tag: string;
  dateOriginal: string;
  /** Birth and Death are always present; clearing their date is how you "remove" them. Only added rows can be removed outright. */
  removable: boolean;
}

/** A relation slot filled from the {@link PersonPicker} — an existing individual or one to create on save. */
interface RelationPersonRef {
  /** Stable React key — the individual id for existing people, a local id for a not-yet-created one. */
  key: string;
  id?: string;
  createNew?: { givenNames?: string; surname?: string; gender?: Gender };
  displayName: string;
  /** Birth/death years for existing people, so the filled chip can show "b. 1960 – 2020". */
  bornYear?: number;
  deathYear?: number;
}

interface FamilyRelationRow {
  /** Stable React key — the family id for existing families, a local id for one added in this session. */
  key: string;
  id?: string;
  spouse: RelationPersonRef | null;
  children: RelationPersonRef[];
}

interface FormState {
  prefix: string;
  givenNames: string;
  surname: string;
  suffix: string;
  nickname: string;
  gender: Gender;
  isLiving: boolean;
  notes: string;
  alternateNames: AltNameRow[];
  events: EventRow[];
  father: RelationPersonRef | null;
  mother: RelationPersonRef | null;
  families: FamilyRelationRow[];
}

/**
 * Display label for a life-event row, resolved through {@link eventTypeLabel}
 * — Birth/Death included, since `events:types.BIRT`/`DEAT` already cover them.
 * Falls back to the raw tag while the event-types query hasn't loaded yet.
 */
function eventRowLabel(
  tag: string,
  eventTypesByTag: Map<string, EventType>,
  t: TranslateFn
): string {
  const eventType = eventTypesByTag.get(tag);
  return eventType ? eventTypeLabel(eventType, t) : tag;
}

/** Sort rank keeping Birth first and Death last, with everything else in between. */
function eventRowSortRank(tag: string): number {
  if (tag === 'BIRT') return 0;
  if (tag === 'DEAT') return 2;
  return 1;
}

function emptyEventRows(): EventRow[] {
  return [
    { key: 'birth', tag: 'BIRT', dateOriginal: '', removable: false },
    { key: 'death', tag: 'DEAT', dateOriginal: '', removable: false },
  ];
}

function emptyFamilyRow(): FamilyRelationRow {
  return { key: nextLocalKey('family'), spouse: null, children: [] };
}

function emptyForm(): FormState {
  return {
    prefix: '',
    givenNames: '',
    surname: '',
    suffix: '',
    nickname: '',
    gender: 'U',
    isLiving: true,
    notes: '',
    alternateNames: [],
    events: emptyEventRows(),
    father: null,
    mother: null,
    families: [emptyFamilyRow()],
  };
}

/** A relation-picker ref for an existing individual, display-named and life-dated for the chip. */
function personRef(individual: IndividualWithDetails, t: TranslateFn): RelationPersonRef {
  return {
    key: individual.id,
    id: individual.id,
    ...personDisplayFields(individual, t),
  };
}

/** One row per existing spouse family; at least one (empty) row so "Add spouse" is always reachable. */
function buildFamilyRows(
  families: FamilyWithMembers[],
  individualId: string,
  t: TranslateFn
): FamilyRelationRow[] {
  if (families.length === 0) return [emptyFamilyRow()];
  return families.map((family) => {
    const spouse = family.husband?.id === individualId ? family.wife : family.husband;
    return {
      key: family.id,
      id: family.id,
      spouse: spouse ? personRef(spouse, t) : null,
      children: family.children.map((child) => personRef(child, t)),
    };
  });
}

function buildEditForm(
  individual: IndividualWithDetails,
  principalEvents: PersonEventEntry[],
  parentFamily: FamilyWithMembers | null,
  spouseFamilies: FamilyWithMembers[],
  t: TranslateFn
): FormState {
  const primary = individual.primaryName;
  const alternateNames: AltNameRow[] = individual.names
    .filter((n) => !n.isPrimary)
    .map((n: Name) => ({
      key: n.id,
      id: n.id,
      type: n.type,
      givenNames: n.givenNames ?? '',
      surname: n.surname ?? '',
    }));

  const eventRows: EventRow[] = principalEvents.map((event) => ({
    key: event.id,
    id: event.id,
    tag: event.eventType.tag ?? '',
    dateOriginal: event.dateOriginal ?? '',
    removable: event.eventType.tag !== 'BIRT' && event.eventType.tag !== 'DEAT',
  }));
  // Birth and Death are always shown, even when not yet recorded.
  for (const [tag, key] of [
    ['BIRT', 'birth'],
    ['DEAT', 'death'],
  ] as const) {
    if (!eventRows.some((row) => row.tag === tag)) {
      eventRows.push({ key, tag, dateOriginal: '', removable: false });
    }
  }
  eventRows.sort((a, b) => eventRowSortRank(a.tag) - eventRowSortRank(b.tag));

  return {
    prefix: primary?.prefix ?? '',
    givenNames: primary?.givenNames ?? '',
    surname: primary?.surname ?? '',
    suffix: primary?.suffix ?? '',
    nickname: primary?.nickname ?? '',
    gender: individual.gender,
    isLiving: individual.isLiving,
    notes: individual.notes ?? '',
    alternateNames,
    events: eventRows,
    father: parentFamily?.husband ? personRef(parentFamily.husband, t) : null,
    mother: parentFamily?.wife ? personRef(parentFamily.wife, t) : null,
    families: buildFamilyRows(spouseFamilies, individual.id, t),
  };
}

function toRelationInput(ref: RelationPersonRef | null): RelationPersonInput | null {
  if (!ref) return null;
  return ref.id ? { id: ref.id } : { createNew: ref.createNew };
}

function buildRelationsPayload(form: FormState): PersonRelationsInput {
  return {
    father: toRelationInput(form.father),
    mother: toRelationInput(form.mother),
    families: form.families.map((row) => ({
      id: row.id,
      spouse: toRelationInput(row.spouse),
      children: row.children
        .map((child) => toRelationInput(child))
        .filter((child): child is RelationPersonInput => child !== null),
    })),
  };
}

/** The gender to seed a brand-new spouse with, guessed from the edited person's own gender. Unknown when theirs is unknown too. */
function spouseGenderGuess(gender: Gender): Gender | undefined {
  if (gender === 'M') return 'F';
  if (gender === 'F') return 'M';
  return undefined;
}

function buildPersonFields(form: FormState) {
  return {
    gender: form.gender,
    isLiving: form.isLiving,
    notes: form.notes.trim() || undefined,
  };
}

function buildPrimaryNameFields(form: FormState) {
  return {
    prefix: form.prefix.trim() || undefined,
    givenNames: form.givenNames.trim() || undefined,
    surname: form.surname.trim() || undefined,
    suffix: form.suffix.trim() || undefined,
    nickname: form.nickname.trim() || undefined,
  };
}

function buildAlternateNamesPayload(form: FormState) {
  return form.alternateNames.map((n) => ({
    id: n.id,
    type: n.type,
    givenNames: n.givenNames.trim() || undefined,
    surname: n.surname.trim() || undefined,
  }));
}

function buildEventsPayload(form: FormState) {
  return form.events.map((e) => ({
    id: e.id,
    tag: e.tag,
    dateOriginal: e.dateOriginal.trim() || undefined,
  }));
}

let localKeyCounter = 0;
function nextLocalKey(prefix: string): string {
  localKeyCounter += 1;
  return `${prefix}-${localKeyCounter}`;
}

/** Replace the row matching `key` with `{ ...row, ...patch }`; other rows pass through unchanged. */
function replaceRow<T extends { key: string }>(rows: T[], key: string, patch: Partial<T>): T[] {
  return rows.map((row) => (row.key === key ? { ...row, ...patch } : row));
}

/** Drop the row matching `key`. */
function removeRow<T extends { key: string }>(rows: T[], key: string): T[] {
  return rows.filter((row) => row.key !== key);
}

/** Turn a {@link PersonPicker} selection into a relation-slot ref. */
function toRelationRef(selection: PersonPickerSelection): RelationPersonRef {
  return {
    key: selection.id ?? nextLocalKey('person'),
    id: selection.id,
    createNew: selection.createNew,
    displayName: selection.displayName,
    bornYear: selection.bornYear,
    deathYear: selection.deathYear,
  };
}

/** Localized-label select over the alternate-name types. */
function NameTypeSelect({
  value,
  disabled,
  onValueChange,
}: {
  value: NameType;
  disabled: boolean;
  onValueChange: (value: NameType) => void;
}): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Select.Root
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (next !== null) onValueChange(next as NameType);
      }}
    >
      <Select.Trigger>
        <Select.Value>{(v) => (v ? t(`overview.names.types.${v as NameType}`) : '')}</Select.Value>
        <Select.Icon>
          <Icon name="chevron-down" size={14} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4} positionMethod="fixed">
          <Select.Popup>
            {NAME_TYPES.map((nt) => (
              <Select.Item key={nt} value={nt}>
                <Select.ItemText>{t(`overview.names.types.${nt}`)}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

interface RelationSlotProps {
  /** Label for the empty "+ Add …" trigger; unused once `person` is filled. */
  label: string;
  person: RelationPersonRef | null;
  disabled: boolean;
  /** Required when `person` is null (the empty, pickable state). */
  onPick?: (selection: PersonPickerSelection) => void;
  /** Required when `person` is set (the filled, removable state). */
  onRemove?: () => void;
  excludeIds?: string[];
  newPersonGender?: Gender;
}

/** A single relation slot: a filled chip with a remove control, or an empty "+ Add …" {@link PersonPicker} trigger. */
function RelationSlot({
  label,
  person,
  disabled,
  onPick,
  onRemove,
  excludeIds,
  newPersonGender,
}: RelationSlotProps): JSX.Element {
  const { t } = useTranslation('individuals');

  if (person) {
    const dates = formatLifeYears(person.bornYear, person.deathYear);
    return (
      <div className={s.pfield}>
        <span className={s.pfieldAvatar} aria-hidden="true">
          {initialsFromDisplayName(person.displayName)}
        </span>
        <span className={s.pfieldBody}>
          <span className={s.pfieldName}>{person.displayName}</span>
          {dates && <span className={s.pfieldDates}>{dates}</span>}
        </span>
        <IconButton
          type="button"
          disabled={disabled}
          aria-label={t('personEditor.relations.removeAria')}
          onClick={onRemove}
        >
          <Icon name="x" size={16} />
        </IconButton>
      </div>
    );
  }

  return (
    <PersonPicker
      label={label}
      onSelect={onPick!}
      excludeIds={excludeIds}
      newPersonGender={newPersonGender}
      disabled={disabled}
    />
  );
}

interface EventDateRowProps {
  /** Localized event-type label shown in the leading column. */
  label: string;
  dateOriginal: string;
  disabled: boolean;
  onChangeDate: (value: string) => void;
  /** Provided only for removable rows (custom events); omitted for Birth/Death, which render an empty trailing cell. */
  onRemove?: () => void;
}

/** One life-event row: type, free-text date field, a (still disabled) place field, and (for removable rows) a remove control. */
function EventDateRow({
  label,
  dateOriginal,
  disabled,
  onChangeDate,
  onRemove,
}: EventDateRowProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const placeLabel = t('personEditor.lifeEvents.place');
  return (
    <div className={onRemove ? s.eventrowRemovable : s.eventrow}>
      <span className={s.eventType}>{label}</span>
      <TextField
        className={s.tnum}
        placeholder={t('personEditor.lifeEvents.datePlaceholder')}
        value={dateOriginal}
        disabled={disabled}
        onChange={(e) => onChangeDate(e.target.value)}
      />
      <TextField placeholder={placeLabel} aria-label={placeLabel} disabled />
      {onRemove && (
        <IconButton
          type="button"
          disabled={disabled}
          aria-label={t('personEditor.lifeEvents.removeAria')}
          onClick={onRemove}
        >
          <Icon name="x" size={16} />
        </IconButton>
      )}
    </div>
  );
}

export type PersonEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (individualId: string) => void;
} & ({ mode: 'create' } | { mode: 'edit'; individualId: string });

/**
 * The shared create/edit form for a Person, as a Base UI `Dialog` openable from
 * anywhere (the People list and the Person Overview). Covers identity
 * (primary + alternate names, sex, living status), a generic typed life-events
 * list (dates only — a place picker lands later, see the Person editor PRD),
 * notes, and relations (parents, spouse families, children) via the
 * search-or-create {@link PersonPicker}. Styled from the warm-earth tokens
 * (ADR-0014).
 */
export function PersonEditorDialog(props: PersonEditorDialogProps): JSX.Element {
  const { open, onOpenChange, onSaved } = props;
  const mode = props.mode;
  const individualId = mode === 'edit' ? props.individualId : undefined;

  const { t } = useTranslation('individuals');
  const queryClient = useQueryClient();

  const individualQuery = useIndividual(individualId ?? '', { enabled: mode === 'edit' && open });
  const eventsQuery = usePersonEvents(individualId ?? '', { enabled: mode === 'edit' && open });
  const eventTypesQuery = useEventTypes('individual', { enabled: open });
  const parentFamilyQuery = useParentFamily(individualId ?? '', {
    enabled: mode === 'edit' && open,
  });
  const spouseFamiliesQuery = useSpouseFamilies(individualId ?? '', {
    enabled: mode === 'edit' && open,
  });

  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [hydrated, setHydrated] = useState(false);
  const [addEventMenuOpen, setAddEventMenuOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [confirmRemoveFamilyKey, setConfirmRemoveFamilyKey] = useState<string | null>(null);
  const initialSnapshotRef = useRef('');

  useEffect(() => {
    if (!open) {
      setHydrated(false);
      setAddEventMenuOpen(false);
      setConfirmDiscardOpen(false);
      setConfirmRemoveFamilyKey(null);
      return;
    }
    if (mode === 'create') {
      const initial = emptyForm();
      setForm(initial);
      initialSnapshotRef.current = JSON.stringify(initial);
      setHydrated(true);
      return;
    }
    if (
      individualQuery.data &&
      eventsQuery.data &&
      parentFamilyQuery.isSuccess &&
      spouseFamiliesQuery.data
    ) {
      const principalEvents = eventsQuery.data.filter((e) => e.scope === 'principal');
      const initial = buildEditForm(
        individualQuery.data,
        principalEvents,
        parentFamilyQuery.data,
        spouseFamiliesQuery.data,
        t
      );
      setForm(initial);
      initialSnapshotRef.current = JSON.stringify(initial);
      setHydrated(true);
    }
    // Re-hydrate only on open/identity change — not on every background refetch.
  }, [
    open,
    mode,
    individualQuery.data,
    eventsQuery.data,
    parentFamilyQuery.isSuccess,
    parentFamilyQuery.data,
    spouseFamiliesQuery.data,
    t,
  ]);

  const mutation = useMutation({
    mutationFn: async (): Promise<string> => {
      let savedId: string;
      if (mode === 'create') {
        savedId = await IndividualManager.create({
          ...buildPersonFields(form),
          name: buildPrimaryNameFields(form),
          alternateNames: buildAlternateNamesPayload(form),
          events: buildEventsPayload(form),
        });
      } else {
        await IndividualManager.update(props.individualId, {
          ...buildPersonFields(form),
          primaryName: buildPrimaryNameFields(form),
          alternateNames: buildAlternateNamesPayload(form),
          events: buildEventsPayload(form),
        });
        savedId = props.individualId;
      }
      await FamilyManager.saveRelations(savedId, form.gender, buildRelationsPayload(form));
      return savedId;
    },
    onSuccess: (savedId) => {
      onSaved?.(savedId);
      onOpenChange(false);

      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
      queryClient.invalidateQueries({ queryKey: queryKeys.families });
      if (mode === 'edit') {
        queryClient.invalidateQueries({ queryKey: queryKeys.individual(savedId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.personOverview(savedId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.personEvents(savedId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.personRelations(savedId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.ancestors(savedId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.parentFamily(savedId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.spouseFamilies(savedId) });
      }
    },
    onError: (err) => {
      // Raw DB/Tauri errors are not translated — log them, surface a
      // generic localized message in the UI instead.
      console.error('Failed to save person:', err);
    },
  });

  const isDirty = hydrated && JSON.stringify(form) !== initialSnapshotRef.current;

  function reallyClose(): void {
    mutation.reset();
    setConfirmDiscardOpen(false);
    onOpenChange(false);
  }

  function attemptClose(): void {
    if (mutation.isPending) return;
    if (isDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    reallyClose();
  }

  function handleDialogOpenChange(nextOpen: boolean): void {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }
    attemptClose();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate();
  }

  function updateAltName(key: string, patch: Partial<AltNameRow>): void {
    setForm((prev) => ({ ...prev, alternateNames: replaceRow(prev.alternateNames, key, patch) }));
  }

  function addAltName(): void {
    setForm((prev) => ({
      ...prev,
      alternateNames: [
        ...prev.alternateNames,
        { key: nextLocalKey('name'), type: 'birth', givenNames: '', surname: '' },
      ],
    }));
  }

  function removeAltName(key: string): void {
    setForm((prev) => ({ ...prev, alternateNames: removeRow(prev.alternateNames, key) }));
  }

  function updateEventDate(key: string, dateOriginal: string): void {
    setForm((prev) => ({ ...prev, events: replaceRow(prev.events, key, { dateOriginal }) }));
  }

  function removeEvent(key: string): void {
    setForm((prev) => ({ ...prev, events: removeRow(prev.events, key) }));
  }

  /** Flip living/deceased. Marking someone living again clears their (now hidden) death date so we never save a contradiction. */
  function setDeceased(deceased: boolean): void {
    setForm((prev) => ({
      ...prev,
      isLiving: !deceased,
      events: deceased
        ? prev.events
        : prev.events.map((row) => (row.tag === 'DEAT' ? { ...row, dateOriginal: '' } : row)),
    }));
  }

  function addEvent(eventType: EventType): void {
    setForm((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        { key: nextLocalKey('event'), tag: eventType.tag ?? '', dateOriginal: '', removable: true },
      ],
    }));
    setAddEventMenuOpen(false);
  }

  function setParentSlot(role: 'father' | 'mother', selection: PersonPickerSelection): void {
    setForm((prev) => ({ ...prev, [role]: toRelationRef(selection) }));
  }

  function removeParentSlot(role: 'father' | 'mother'): void {
    setForm((prev) => ({ ...prev, [role]: null }));
  }

  function updateFamilyRow(
    key: string,
    patch: Partial<FamilyRelationRow> | ((row: FamilyRelationRow) => Partial<FamilyRelationRow>)
  ): void {
    setForm((prev) => ({
      ...prev,
      families: prev.families.map((row) =>
        row.key === key ? { ...row, ...(typeof patch === 'function' ? patch(row) : patch) } : row
      ),
    }));
  }

  function pickSpouse(rowKey: string, selection: PersonPickerSelection): void {
    updateFamilyRow(rowKey, { spouse: toRelationRef(selection) });
  }

  function removeSpouse(rowKey: string): void {
    updateFamilyRow(rowKey, { spouse: null });
  }

  function addChild(rowKey: string, selection: PersonPickerSelection): void {
    updateFamilyRow(rowKey, (row) => ({ children: [...row.children, toRelationRef(selection)] }));
  }

  function removeChild(rowKey: string, childKey: string): void {
    updateFamilyRow(rowKey, (row) => ({
      children: row.children.filter((c) => c.key !== childKey),
    }));
  }

  function addFamily(): void {
    setForm((prev) => ({ ...prev, families: [...prev.families, emptyFamilyRow()] }));
  }

  function removeFamily(key: string): void {
    setForm((prev) => ({ ...prev, families: prev.families.filter((row) => row.key !== key) }));
  }

  // Removing a family with children detaches those children — confirm first.
  function requestRemoveFamily(row: FamilyRelationRow): void {
    if (row.children.length > 0) {
      setConfirmRemoveFamilyKey(row.key);
      return;
    }
    removeFamily(row.key);
  }

  function confirmRemoveFamily(): void {
    if (confirmRemoveFamilyKey) removeFamily(confirmRemoveFamilyKey);
    setConfirmRemoveFamilyKey(null);
  }

  const eventTypesByTag = new Map(
    (eventTypesQuery.data ?? []).map((et) => [et.tag ?? '', et] as const)
  );

  const pickableEventTypes = (() => {
    const seenLabels = new Set<string>();
    return (eventTypesQuery.data ?? []).filter((et) => {
      if (et.tag === 'BIRT' || et.tag === 'DEAT') return false;
      const label = eventTypeLabel(et, t);
      if (seenLabels.has(label)) return false;
      seenLabels.add(label);
      return true;
    });
  })();

  // Death is pulled out of the generic timeline and tied to the "Deceased"
  // toggle below — a living person shows no death event at all.
  const deathRow = form.events.find((row) => row.tag === 'DEAT');
  const timelineEvents = form.events.filter((row) => row.tag !== 'DEAT');

  const title = mode === 'create' ? t('personEditor.createTitle') : t('personEditor.editTitle');
  const showForm = mode === 'create' || hydrated;
  const subtitle = `${form.givenNames} ${form.surname}`.trim();
  const excludeSelf = individualId ? [individualId] : undefined;

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleDialogOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Popup className={s.modal} aria-describedby={undefined}>
            <div className={s.mhead}>
              <div className={s.headAvatar} aria-hidden="true">
                {initialsFromDisplayName(subtitle)}
              </div>
              <div className={s.headCrumb}>
                <Dialog.Title className={s.headTitle}>{title}</Dialog.Title>
                {subtitle && (
                  <>
                    <span className={s.headSep} aria-hidden="true">
                      /
                    </span>
                    <span className={s.headSub}>{subtitle}</span>
                  </>
                )}
              </div>
              <span className={s.grow} />
              <IconButton
                type="button"
                aria-label={t('personEditor.actions.close')}
                disabled={mutation.isPending}
                onClick={attemptClose}
              >
                <Icon name="x" size={16} />
              </IconButton>
            </div>

            <div className={s.mbody}>
              {!showForm ? (
                <div className={s.loadingText}>{t('overview.loading')}</div>
              ) : (
                <form id="person-editor-form" onSubmit={handleSubmit}>
                  <div className={s.cols}>
                    {/* Left column: names, life events, notes */}
                    <div className={s.col}>
                      <div className={s.ecard}>
                        <div className={s.sectitle}>{t('personEditor.sections.names')}</div>
                        <div className={s.fgridC2}>
                          <label className={s.field}>
                            <span className={s.fieldLabel}>
                              {t('personEditor.fields.givenNames')}
                            </span>
                            <TextField
                              value={form.givenNames}
                              disabled={mutation.isPending}
                              onChange={(e) =>
                                setForm((prev) => ({ ...prev, givenNames: e.target.value }))
                              }
                            />
                          </label>
                          <label className={s.field}>
                            <span className={s.fieldLabel}>{t('personEditor.fields.surname')}</span>
                            <TextField
                              value={form.surname}
                              disabled={mutation.isPending}
                              onChange={(e) =>
                                setForm((prev) => ({ ...prev, surname: e.target.value }))
                              }
                            />
                          </label>
                        </div>
                        <div className={s.fgrid3Gap}>
                          <label className={s.field}>
                            <span className={s.fieldLabel}>{t('personEditor.fields.prefix')}</span>
                            <TextField
                              value={form.prefix}
                              disabled={mutation.isPending}
                              onChange={(e) =>
                                setForm((prev) => ({ ...prev, prefix: e.target.value }))
                              }
                            />
                          </label>
                          <label className={s.field}>
                            <span className={s.fieldLabel}>{t('personEditor.fields.suffix')}</span>
                            <TextField
                              value={form.suffix}
                              disabled={mutation.isPending}
                              onChange={(e) =>
                                setForm((prev) => ({ ...prev, suffix: e.target.value }))
                              }
                            />
                          </label>
                          <label className={s.field}>
                            <span className={s.fieldLabel}>
                              {t('personEditor.fields.nickname')}
                            </span>
                            <TextField
                              value={form.nickname}
                              disabled={mutation.isPending}
                              onChange={(e) =>
                                setForm((prev) => ({ ...prev, nickname: e.target.value }))
                              }
                            />
                          </label>
                        </div>

                        <div className={`${s.subhead} ${s.subheadMt}`}>
                          {t('personEditor.sections.otherNames')}
                        </div>
                        <div className={s.stack}>
                          {form.alternateNames.map((row) => (
                            <div key={row.key} className={s.altrow}>
                              <TextField
                                placeholder={t('personEditor.fields.givenNames')}
                                value={row.givenNames}
                                disabled={mutation.isPending}
                                onChange={(e) =>
                                  updateAltName(row.key, { givenNames: e.target.value })
                                }
                              />
                              <TextField
                                placeholder={t('personEditor.fields.surname')}
                                value={row.surname}
                                disabled={mutation.isPending}
                                onChange={(e) =>
                                  updateAltName(row.key, { surname: e.target.value })
                                }
                              />
                              <NameTypeSelect
                                value={row.type}
                                disabled={mutation.isPending}
                                onValueChange={(type) => updateAltName(row.key, { type })}
                              />
                              <IconButton
                                type="button"
                                disabled={mutation.isPending}
                                aria-label={t('personEditor.otherNames.removeAria')}
                                onClick={() => removeAltName(row.key)}
                              >
                                <Icon name="x" size={16} />
                              </IconButton>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="dashed"
                            disabled={mutation.isPending}
                            onClick={addAltName}
                          >
                            <Icon name="plus" size={14} />
                            {t('personEditor.otherNames.addButton')}
                          </Button>
                        </div>
                      </div>

                      <div className={s.ecard}>
                        <div className={s.sectitle}>{t('personEditor.sections.lifeEvents')}</div>
                        <div className={s.eventlist}>
                          {timelineEvents.map((row) => (
                            <EventDateRow
                              key={row.key}
                              label={eventRowLabel(row.tag, eventTypesByTag, t)}
                              dateOriginal={row.dateOriginal}
                              disabled={mutation.isPending}
                              onChangeDate={(value) => updateEventDate(row.key, value)}
                              onRemove={row.removable ? () => removeEvent(row.key) : undefined}
                            />
                          ))}
                        </div>

                        <div className={s.addWrap}>
                          <Button
                            type="button"
                            variant="dashed"
                            disabled={mutation.isPending}
                            onClick={() => setAddEventMenuOpen((v) => !v)}
                          >
                            <Icon name="plus" size={14} />
                            {t('personEditor.lifeEvents.addButton')}
                          </Button>
                          {addEventMenuOpen && (
                            <div className={s.typegrid}>
                              {pickableEventTypes.map((et) => (
                                <button
                                  key={et.id}
                                  type="button"
                                  className={s.typegridBtn}
                                  onClick={() => addEvent(et)}
                                >
                                  {eventTypeLabel(et, t)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {deathRow && (
                          <div className={s.deathGroup}>
                            <div className={s.statusrow}>
                              <Switch.Root
                                checked={!form.isLiving}
                                disabled={mutation.isPending}
                                aria-label={t('personEditor.status.deceased')}
                                onCheckedChange={(checked) => setDeceased(checked)}
                              >
                                <Switch.Thumb />
                              </Switch.Root>
                              <span className={s.switchLabel}>
                                {t('personEditor.status.deceased')}
                              </span>
                            </div>
                            <EventDateRow
                              label={eventRowLabel(deathRow.tag, eventTypesByTag, t)}
                              dateOriginal={deathRow.dateOriginal}
                              disabled={mutation.isPending || form.isLiving}
                              onChangeDate={(value) => updateEventDate(deathRow.key, value)}
                            />
                          </div>
                        )}
                      </div>

                      <div className={s.ecard}>
                        <div className={s.sectitle}>{t('personEditor.sections.notes')}</div>
                        <TextField
                          multiline
                          aria-label={t('personEditor.sections.notes')}
                          value={form.notes}
                          disabled={mutation.isPending}
                          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Right column: sex, relations */}
                    <div className={s.col}>
                      <div className={s.ecard}>
                        <div className={s.sectitle}>{t('personEditor.sex.label')}</div>
                        <SegmentedControl
                          aria-label={t('personEditor.sex.label')}
                          value={form.gender}
                          onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value }))}
                          disabled={mutation.isPending}
                          options={SEX_VALUES.map((value) => ({
                            value,
                            label: t(`table.sex.${value}`),
                          }))}
                        />
                      </div>

                      <div className={s.ecard}>
                        <div className={s.sectitle}>{t('personEditor.sections.relations')}</div>

                        <div className={s.subhead}>{t('overview.parents.title')}</div>
                        <div className={s.relrow2}>
                          <span className={s.relLabel}>
                            {t('personEditor.relations.fatherLabel')}
                          </span>
                          <RelationSlot
                            label={t('personEditor.relations.addFather')}
                            person={form.father}
                            disabled={mutation.isPending}
                            excludeIds={excludeSelf}
                            newPersonGender="M"
                            onPick={(selection) => setParentSlot('father', selection)}
                            onRemove={() => removeParentSlot('father')}
                          />
                        </div>
                        <div className={s.relrow2}>
                          <span className={s.relLabel}>
                            {t('personEditor.relations.motherLabel')}
                          </span>
                          <RelationSlot
                            label={t('personEditor.relations.addMother')}
                            person={form.mother}
                            disabled={mutation.isPending}
                            excludeIds={excludeSelf}
                            newPersonGender="F"
                            onPick={(selection) => setParentSlot('mother', selection)}
                            onRemove={() => removeParentSlot('mother')}
                          />
                        </div>

                        {form.families.map((row, index) => (
                          <div
                            key={row.key}
                            className={
                              index === 0 ? `${s.familyCard} ${s.familyCardFirst}` : s.familyCard
                            }
                          >
                            <div className={s.familyHead}>
                              <span className={s.familyTitle}>
                                {t('personEditor.relations.familyLabel')}
                              </span>
                              <span className={s.grow} />
                              <IconButton
                                type="button"
                                disabled={mutation.isPending}
                                aria-label={t('personEditor.relations.removeFamilyAria')}
                                onClick={() => requestRemoveFamily(row)}
                              >
                                <Icon name="x" size={16} />
                              </IconButton>
                            </div>
                            <div className={s.relrow2}>
                              <span className={s.relLabel}>
                                {t('personEditor.relations.spouse')}
                              </span>
                              <RelationSlot
                                label={t('personEditor.relations.addSpouse')}
                                person={row.spouse}
                                disabled={mutation.isPending}
                                excludeIds={excludeSelf}
                                newPersonGender={spouseGenderGuess(form.gender)}
                                onPick={(selection) => pickSpouse(row.key, selection)}
                                onRemove={() => removeSpouse(row.key)}
                              />
                            </div>
                            <div className={s.relrow2}>
                              <span className={s.relLabel}>
                                {t('personEditor.relations.children')}
                              </span>
                              <div className={s.childstack}>
                                {row.children.map((child) => (
                                  <RelationSlot
                                    key={child.key}
                                    label=""
                                    person={child}
                                    disabled={mutation.isPending}
                                    onRemove={() => removeChild(row.key, child.key)}
                                  />
                                ))}
                                <RelationSlot
                                  label={t('personEditor.relations.addChild')}
                                  person={null}
                                  disabled={mutation.isPending}
                                  excludeIds={excludeSelf}
                                  onPick={(selection) => addChild(row.key, selection)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className={s.familyActions}>
                          <Button
                            type="button"
                            variant="dashed"
                            disabled={mutation.isPending}
                            onClick={addFamily}
                          >
                            <Icon name="plus" size={14} />
                            {t('personEditor.relations.addFamily')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {mutation.isError && (
                    <div className={s.callout} role="alert">
                      {t('personEditor.errorGeneric')}
                    </div>
                  )}
                </form>
              )}
            </div>

            <div className={s.mfoot}>
              <Button
                type="submit"
                variant="solid"
                form="person-editor-form"
                disabled={!showForm || mutation.isPending}
              >
                {mode === 'create'
                  ? t('personEditor.actions.saveNew')
                  : t('personEditor.actions.save')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={attemptClose}
                disabled={mutation.isPending}
              >
                {t('personEditor.actions.cancel')}
              </Button>
              <span className={s.grow} />
              {isDirty && (
                <span className={s.dirty}>{t('personEditor.unsavedChanges.indicator')}</span>
              )}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop layer="alert" />
          <Dialog.Popup layer="alert" className={s.alertPopup}>
            <Dialog.Title className={s.alertTitle}>
              {t('personEditor.unsavedChanges.title')}
            </Dialog.Title>
            <Dialog.Description className={s.alertDesc}>
              {t('personEditor.unsavedChanges.description')}
            </Dialog.Description>
            <div className={s.alertActions}>
              <Button type="button" variant="ghost" onClick={() => setConfirmDiscardOpen(false)}>
                {t('personEditor.unsavedChanges.keepEditing')}
              </Button>
              <Button type="button" variant="danger" onClick={reallyClose}>
                {t('personEditor.unsavedChanges.discard')}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        open={confirmRemoveFamilyKey !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setConfirmRemoveFamilyKey(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop layer="alert" />
          <Dialog.Popup layer="alert" className={s.alertPopup}>
            <Dialog.Title className={s.alertTitle}>
              {t('personEditor.removeFamilyConfirm.title')}
            </Dialog.Title>
            <Dialog.Description className={s.alertDesc}>
              {t('personEditor.removeFamilyConfirm.description', {
                count:
                  form.families.find((row) => row.key === confirmRemoveFamilyKey)?.children
                    .length ?? 0,
              })}
            </Dialog.Description>
            <div className={s.alertActions}>
              <Button type="button" variant="ghost" onClick={() => setConfirmRemoveFamilyKey(null)}>
                {t('personEditor.removeFamilyConfirm.keepFamily')}
              </Button>
              <Button type="button" variant="danger" onClick={confirmRemoveFamily}>
                {t('personEditor.removeFamilyConfirm.confirm')}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
