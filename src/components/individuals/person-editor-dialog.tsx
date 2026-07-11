import { useEffect, useId, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  Avatar,
  Badge,
  Button,
  Callout,
  Card,
  Dialog,
  Flex,
  Grid,
  IconButton,
  SegmentedControl,
  Select,
  Switch,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';

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

const NAME_TYPES: NameType[] = [
  'birth',
  'married',
  'adopted',
  'aka',
  'immigrant',
  'religious',
  'other',
];

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

/** Shared height for filled chips and empty "+ Add" triggers so a Parents row's two slots line up whatever their state. */
const RELATION_SLOT_MIN_HEIGHT = '3.5rem';

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
      <Card size="1" style={{ minHeight: RELATION_SLOT_MIN_HEIGHT }}>
        <Flex align="center" justify="between" gap="3" height="100%">
          <Flex align="center" gap="3" overflow="hidden">
            <span aria-hidden="true">
              <Avatar
                size="2"
                radius="full"
                color="gray"
                fallback={initialsFromDisplayName(person.displayName)}
              />
            </span>
            <Flex direction="column" overflow="hidden">
              <Text size="2" weight="medium" truncate>
                {person.displayName}
              </Text>
              {dates && (
                <Text size="1" color="gray">
                  {dates}
                </Text>
              )}
            </Flex>
          </Flex>
          <IconButton
            type="button"
            variant="ghost"
            color="gray"
            disabled={disabled}
            aria-label={t('personEditor.relations.removeAria')}
            onClick={onRemove}
          >
            <Icon name="x" />
          </IconButton>
        </Flex>
      </Card>
    );
  }

  return (
    <PersonPicker onSelect={onPick!} excludeIds={excludeIds} newPersonGender={newPersonGender}>
      <Button
        type="button"
        variant="outline"
        color="gray"
        size="2"
        disabled={disabled}
        style={{ width: '100%', minHeight: RELATION_SLOT_MIN_HEIGHT }}
      >
        <Icon name="plus" />
        {label}
      </Button>
    </PersonPicker>
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

/** One life-event row: label, free-text date field, a "place — soon" badge, and (for removable rows) a remove control. */
function EventDateRow({
  label,
  dateOriginal,
  disabled,
  onChangeDate,
  onRemove,
}: EventDateRowProps): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Grid columns="110px 1fr 90px 32px" gap="2" align="center">
      <Text size="2" weight="medium">
        {label}
      </Text>
      <TextField.Root
        placeholder={t('personEditor.lifeEvents.datePlaceholder')}
        value={dateOriginal}
        disabled={disabled}
        onChange={(e) => onChangeDate(e.target.value)}
      />
      <Badge variant="outline" color="gray" size="1">
        {t('personEditor.lifeEvents.placeSoon')}
      </Badge>
      {onRemove ? (
        <IconButton
          type="button"
          variant="ghost"
          color="gray"
          disabled={disabled}
          aria-label={t('personEditor.lifeEvents.removeAria')}
          onClick={onRemove}
        >
          <Icon name="x" />
        </IconButton>
      ) : (
        <div />
      )}
    </Grid>
  );
}

export type PersonEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (individualId: string) => void;
} & ({ mode: 'create' } | { mode: 'edit'; individualId: string });

/**
 * The shared create/edit form for a Person, as a Radix `Dialog` openable from
 * anywhere (the People list and the Person Overview). Covers identity
 * (primary + alternate names, sex, living status), a generic typed life-events
 * list (dates only — a place picker lands later, see the Person editor PRD),
 * notes, and relations (parents, spouse families, children) via the
 * search-or-create {@link PersonPicker}.
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

  const givenNamesId = useId();
  const surnameId = useId();
  const prefixId = useId();
  const suffixId = useId();
  const nicknameId = useId();
  const sexId = useId();
  const notesId = useId();

  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [hydrated, setHydrated] = useState(false);
  const [addEventMenuOpen, setAddEventMenuOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const initialSnapshotRef = useRef('');

  useEffect(() => {
    if (!open) {
      setHydrated(false);
      setAddEventMenuOpen(false);
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
    onSuccess: async (savedId) => {
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: queryKeys.individuals }),
        queryClient.invalidateQueries({ queryKey: queryKeys.families }),
      ];
      if (mode === 'edit') {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: queryKeys.individual(savedId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.personOverview(savedId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.personEvents(savedId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.personRelations(savedId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.ancestors(savedId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.parentFamily(savedId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.spouseFamilies(savedId) })
        );
      }
      await Promise.all(invalidations);
      onSaved?.(savedId);
      onOpenChange(false);
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

  return (
    <>
      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          if (next) {
            onOpenChange(true);
            return;
          }
          attemptClose();
        }}
      >
        {/* No Dialog.Description — the title alone is clear; this opts out of
            Radix's a11y warning intentionally rather than adding filler copy. */}
        <Dialog.Content width="95vw" maxWidth="1400px" aria-describedby={undefined}>
          <Dialog.Title mb="4">{title}</Dialog.Title>

          {!showForm ? (
            <Text size="2" color="gray">
              {t('overview.loading')}
            </Text>
          ) : (
            <form id="person-editor-form" onSubmit={handleSubmit}>
              <Grid columns={{ initial: '1', md: '2' }} gap="4">
                {/* Left column: names, sex, notes */}
                <Flex direction="column" gap="4">
                  <Card>
                    <Flex direction="column" gap="3">
                      <Text size="1" weight="bold" color="gray">
                        {t('personEditor.sections.names')}
                      </Text>
                      <Grid columns="2" gap="3">
                        <Flex direction="column" gap="1">
                          <Text as="label" htmlFor={givenNamesId} size="1" weight="medium">
                            {t('personEditor.fields.givenNames')}
                          </Text>
                          <TextField.Root
                            id={givenNamesId}
                            value={form.givenNames}
                            disabled={mutation.isPending}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, givenNames: e.target.value }))
                            }
                          />
                        </Flex>
                        <Flex direction="column" gap="1">
                          <Text as="label" htmlFor={surnameId} size="1" weight="medium">
                            {t('personEditor.fields.surname')}
                          </Text>
                          <TextField.Root
                            id={surnameId}
                            value={form.surname}
                            disabled={mutation.isPending}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, surname: e.target.value }))
                            }
                          />
                        </Flex>
                      </Grid>
                      <Grid columns="3" gap="3">
                        <Flex direction="column" gap="1">
                          <Text as="label" htmlFor={prefixId} size="1" weight="medium">
                            {t('personEditor.fields.prefix')}
                          </Text>
                          <TextField.Root
                            id={prefixId}
                            value={form.prefix}
                            disabled={mutation.isPending}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, prefix: e.target.value }))
                            }
                          />
                        </Flex>
                        <Flex direction="column" gap="1">
                          <Text as="label" htmlFor={suffixId} size="1" weight="medium">
                            {t('personEditor.fields.suffix')}
                          </Text>
                          <TextField.Root
                            id={suffixId}
                            value={form.suffix}
                            disabled={mutation.isPending}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, suffix: e.target.value }))
                            }
                          />
                        </Flex>
                        <Flex direction="column" gap="1">
                          <Text as="label" htmlFor={nicknameId} size="1" weight="medium">
                            {t('personEditor.fields.nickname')}
                          </Text>
                          <TextField.Root
                            id={nicknameId}
                            value={form.nickname}
                            disabled={mutation.isPending}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, nickname: e.target.value }))
                            }
                          />
                        </Flex>
                      </Grid>

                      <Text size="1" weight="medium" color="gray" mt="2">
                        {t('personEditor.sections.otherNames')}
                      </Text>
                      <Flex direction="column" gap="2">
                        {form.alternateNames.map((row) => (
                          <Grid key={row.key} columns="160px 1fr 1fr 32px" gap="2" align="center">
                            <Select.Root
                              value={row.type}
                              disabled={mutation.isPending}
                              onValueChange={(next) =>
                                updateAltName(row.key, { type: next as NameType })
                              }
                            >
                              <Select.Trigger />
                              <Select.Content>
                                {NAME_TYPES.map((nt) => (
                                  <Select.Item key={nt} value={nt}>
                                    {t(`overview.names.types.${nt}`)}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                            <TextField.Root
                              placeholder={t('personEditor.fields.givenNames')}
                              value={row.givenNames}
                              disabled={mutation.isPending}
                              onChange={(e) =>
                                updateAltName(row.key, { givenNames: e.target.value })
                              }
                            />
                            <TextField.Root
                              placeholder={t('personEditor.fields.surname')}
                              value={row.surname}
                              disabled={mutation.isPending}
                              onChange={(e) => updateAltName(row.key, { surname: e.target.value })}
                            />
                            <IconButton
                              type="button"
                              variant="ghost"
                              color="gray"
                              disabled={mutation.isPending}
                              aria-label={t('personEditor.otherNames.removeAria')}
                              onClick={() => removeAltName(row.key)}
                            >
                              <Icon name="x" />
                            </IconButton>
                          </Grid>
                        ))}
                        <Flex justify="start">
                          <Button
                            type="button"
                            variant="soft"
                            color="gray"
                            size="1"
                            disabled={mutation.isPending}
                            onClick={addAltName}
                          >
                            <Icon name="plus" />
                            {t('personEditor.otherNames.addButton')}
                          </Button>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Card>

                  <Card>
                    <Flex direction="column" gap="2">
                      <Text id={sexId} size="1" weight="bold" color="gray">
                        {t('personEditor.sex.label')}
                      </Text>
                      <SegmentedControl.Root
                        aria-labelledby={sexId}
                        value={form.gender}
                        onValueChange={(next) =>
                          setForm((prev) => ({ ...prev, gender: next as Gender }))
                        }
                      >
                        <SegmentedControl.Item value="F">{t('table.sex.F')}</SegmentedControl.Item>
                        <SegmentedControl.Item value="M">{t('table.sex.M')}</SegmentedControl.Item>
                        <SegmentedControl.Item value="U">{t('table.sex.U')}</SegmentedControl.Item>
                      </SegmentedControl.Root>
                    </Flex>
                  </Card>

                  <Card>
                    <Flex direction="column" gap="2">
                      <Text as="label" htmlFor={notesId} size="1" weight="bold" color="gray">
                        {t('personEditor.sections.notes')}
                      </Text>
                      <TextArea
                        id={notesId}
                        value={form.notes}
                        disabled={mutation.isPending}
                        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                      />
                    </Flex>
                  </Card>
                </Flex>

                {/* Right column: life events, relations */}
                <Flex direction="column" gap="4">
                  <Card>
                    <Flex direction="column" gap="3">
                      <Flex align="center" justify="between">
                        <Text size="1" weight="bold" color="gray">
                          {t('personEditor.sections.lifeEvents')}
                        </Text>
                      </Flex>
                      <Text size="1" color="gray">
                        {t('personEditor.sections.lifeEventsHint')}
                      </Text>
                      <Flex direction="column" gap="2">
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
                      </Flex>
                      <Text size="1" color="gray">
                        {t('personEditor.lifeEvents.dateHint')}
                      </Text>

                      <Flex direction="column" gap="2">
                        <Flex justify="start">
                          <Button
                            type="button"
                            variant="soft"
                            color="gray"
                            size="1"
                            disabled={mutation.isPending}
                            onClick={() => setAddEventMenuOpen((v) => !v)}
                          >
                            <Icon name="plus" />
                            {t('personEditor.lifeEvents.addButton')}
                          </Button>
                        </Flex>
                        {addEventMenuOpen && (
                          <Grid columns="2" gap="2">
                            {pickableEventTypes.map((et) => (
                              <Button
                                key={et.id}
                                type="button"
                                variant="surface"
                                color="gray"
                                size="1"
                                onClick={() => addEvent(et)}
                              >
                                {eventTypeLabel(et, t)}
                              </Button>
                            ))}
                          </Grid>
                        )}
                      </Flex>

                      <Flex direction="column" gap="2" mt="2">
                        <Text as="label" size="2" weight="medium">
                          <Flex align="center" gap="2">
                            <Switch
                              checked={!form.isLiving}
                              disabled={mutation.isPending}
                              onCheckedChange={setDeceased}
                            />
                            {t('personEditor.status.deceased')}
                          </Flex>
                        </Text>
                        {!form.isLiving && deathRow && (
                          <EventDateRow
                            label={eventRowLabel(deathRow.tag, eventTypesByTag, t)}
                            dateOriginal={deathRow.dateOriginal}
                            disabled={mutation.isPending}
                            onChangeDate={(value) => updateEventDate(deathRow.key, value)}
                          />
                        )}
                      </Flex>
                    </Flex>
                  </Card>

                  <Card>
                    <Flex direction="column" gap="3">
                      <Text size="1" weight="bold" color="gray">
                        {t('personEditor.sections.relations')}
                      </Text>

                      <Flex direction="column" gap="2">
                        <Text size="1" weight="medium" color="gray">
                          {t('overview.parents.title')}
                        </Text>
                        <Grid columns="2" gap="3">
                          <RelationSlot
                            label={t('personEditor.relations.addFather')}
                            person={form.father}
                            disabled={mutation.isPending}
                            excludeIds={individualId ? [individualId] : undefined}
                            newPersonGender="M"
                            onPick={(selection) => setParentSlot('father', selection)}
                            onRemove={() => removeParentSlot('father')}
                          />
                          <RelationSlot
                            label={t('personEditor.relations.addMother')}
                            person={form.mother}
                            disabled={mutation.isPending}
                            excludeIds={individualId ? [individualId] : undefined}
                            newPersonGender="F"
                            onPick={(selection) => setParentSlot('mother', selection)}
                            onRemove={() => removeParentSlot('mother')}
                          />
                        </Grid>
                      </Flex>

                      {form.families.map((row) => (
                        <Card key={row.key} variant="surface">
                          <Flex direction="column" gap="3">
                            <Flex direction="column" gap="2">
                              <Text size="1" weight="medium" color="gray">
                                {t('personEditor.relations.spouse')}
                              </Text>
                              <RelationSlot
                                label={t('personEditor.relations.addSpouse')}
                                person={row.spouse}
                                disabled={mutation.isPending}
                                excludeIds={individualId ? [individualId] : undefined}
                                newPersonGender={spouseGenderGuess(form.gender)}
                                onPick={(selection) => pickSpouse(row.key, selection)}
                                onRemove={() => removeSpouse(row.key)}
                              />
                            </Flex>
                            <Flex direction="column" gap="2">
                              <Text size="1" weight="medium" color="gray">
                                {t('personEditor.relations.children')}
                              </Text>
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
                                excludeIds={individualId ? [individualId] : undefined}
                                onPick={(selection) => addChild(row.key, selection)}
                              />
                            </Flex>
                          </Flex>
                        </Card>
                      ))}

                      <Button
                        type="button"
                        variant="soft"
                        color="gray"
                        size="2"
                        disabled={mutation.isPending}
                        onClick={addFamily}
                      >
                        <Icon name="plus" />
                        {t('personEditor.relations.addFamily')}
                      </Button>
                    </Flex>
                  </Card>
                </Flex>
              </Grid>

              {mutation.isError && (
                <Callout.Root color="red" size="1" role="alert" mt="4">
                  <Callout.Text>{t('personEditor.errorGeneric')}</Callout.Text>
                </Callout.Root>
              )}
            </form>
          )}

          <Flex gap="3" mt="4" justify="end">
            <Button
              variant="soft"
              color="gray"
              onClick={attemptClose}
              disabled={mutation.isPending}
            >
              {t('personEditor.actions.cancel')}
            </Button>
            <Button
              type="submit"
              form="person-editor-form"
              disabled={!showForm || mutation.isPending}
            >
              {mode === 'create'
                ? t('personEditor.actions.saveNew')
                : t('personEditor.actions.save')}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <AlertDialog.Root open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <AlertDialog.Content maxWidth="440px">
          <AlertDialog.Title>{t('personEditor.unsavedChanges.title')}</AlertDialog.Title>
          <AlertDialog.Description size="2">
            {t('personEditor.unsavedChanges.description')}
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                {t('personEditor.unsavedChanges.keepEditing')}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button color="red" onClick={reallyClose}>
                {t('personEditor.unsavedChanges.discard')}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
