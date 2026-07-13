import { tryParseSortDate } from '$/lib/dateSort';
import {
  createIndividual,
  deleteIndividual,
  getAllIndividuals,
  getIndividualById,
  getIndividualsByIds,
  searchIndividuals,
  updateIndividual,
} from '$db-tree/individuals';
import {
  createName,
  deleteName,
  getAllNames,
  getAllPrimaryNames,
  getNamesByIndividualId,
  getNamesForIndividuals,
  getPrimaryName,
  getPrimaryNamesForIndividuals,
  updateName,
} from '$db-tree/names';
import {
  createEventWithParticipant,
  deleteEvent,
  getAllBirthDeathEvents,
  getBirthDeathEventsForIndividuals,
  getEventTypes,
  getEventsByIndividualIdWithDetails,
  updateEvent,
} from '$db-tree/events';
import type {
  CreateIndividualInput,
  EventWithDetails,
  Individual,
  IndividualWithDetails,
  Name,
  NameType,
  UpdateIndividualInput,
} from '$types/database';

/** The primary name's editable fields — every part but the individual it belongs to. */
interface PersonNameFields {
  prefix?: string;
  givenNames?: string;
  surname?: string;
  suffix?: string;
  nickname?: string;
}

/** One row of the alternate-names list. Presence of `id` means "update this row"; its absence means "create a new one". */
export interface AlternateNameInput extends PersonNameFields {
  id?: string;
  type: NameType;
}

/** One row of the life-events list. Presence of `id` means "update this row"; its absence means "create a new one". Rows with an empty `dateOriginal` are skipped. */
export interface PersonEventInput {
  id?: string;
  /** GEDCOM tag identifying the event type, e.g. `'BIRT'`, `'BAPM'`. */
  tag: string;
  dateOriginal?: string;
}

export interface CreateIndividualWithNameInput extends CreateIndividualInput {
  name?: PersonNameFields;
  alternateNames?: AlternateNameInput[];
  events?: PersonEventInput[];
}

export interface UpdatePersonInput extends UpdateIndividualInput {
  primaryName?: PersonNameFields;
  alternateNames?: AlternateNameInput[];
  events?: PersonEventInput[];
}

/** This individual's own (principal-role) events — excludes events they merely witness and family/union events. */
function filterPrincipalEvents(
  events: EventWithDetails[],
  individualId: string
): EventWithDetails[] {
  return events.filter((event) =>
    event.participants.some((p) => p.role === 'principal' && p.individualId === individualId)
  );
}

/** A row with neither given names nor surname is treated as absent: never created, never kept, never updated. This is how an alternate name is removed from the editor — clearing both fields. */
function hasNameContent(name: AlternateNameInput): boolean {
  return Boolean(name.givenNames?.trim() || name.surname?.trim());
}

/** Create or update the alternate names in `input` against `existing`, deleting any existing row not represented. Rows with neither given names nor surname are skipped entirely (never created, never used to keep an existing row alive). */
async function saveAlternateNames(
  individualId: string,
  input: AlternateNameInput[],
  existing: Name[]
): Promise<void> {
  const keptIds = new Set(input.filter((n) => n.id && hasNameContent(n)).map((n) => n.id));
  for (const name of existing) {
    if (!keptIds.has(name.id)) {
      await deleteName(name.id);
    }
  }

  for (const name of input) {
    if (!hasNameContent(name)) continue;
    const { type, prefix, givenNames, surname, suffix, nickname } = name;
    if (name.id) {
      await updateName(name.id, { type, prefix, givenNames, surname, suffix, nickname });
      continue;
    }
    await createName({
      individualId,
      type,
      prefix,
      givenNames,
      surname,
      suffix,
      nickname,
      isPrimary: false,
    });
  }
}

/** A row with no date is treated as absent: never created, never kept, never updated. This is how Birth/Death — never individually removable in the editor — are removed: clearing the date. */
function hasDate(event: PersonEventInput): boolean {
  return Boolean(event.dateOriginal);
}

/** Create or update the events in `input` against `existing`, deleting any existing principal event not represented. Rows with no date are skipped entirely (never created, never used to keep an existing row alive). */
async function saveEvents(
  individualId: string,
  input: PersonEventInput[],
  existing: EventWithDetails[]
): Promise<void> {
  const keptIds = new Set(input.filter((e) => e.id && hasDate(e)).map((e) => e.id));
  for (const event of existing) {
    if (!keptIds.has(event.id)) {
      await deleteEvent(event.id);
    }
  }

  const hasNewRows = input.some((e) => !e.id && hasDate(e));
  const eventTypesByTag = new Map(
    (hasNewRows ? await getEventTypes('individual') : []).map((et) => [et.tag, et] as const)
  );

  for (const event of input) {
    if (!hasDate(event)) continue;
    const dateSort = tryParseSortDate(event.dateOriginal);
    if (event.id) {
      await updateEvent(event.id, { dateOriginal: event.dateOriginal, dateSort });
      continue;
    }
    const eventType = eventTypesByTag.get(event.tag);
    if (!eventType) continue;
    await createEventWithParticipant(
      { eventTypeId: eventType.id, dateOriginal: event.dateOriginal, dateSort },
      { individualId, role: 'principal' }
    );
  }
}

/**
 * Select the first event whose type matches `tag` and where the given
 * individual appears as a `principal` participant. Shared between `getAll`
 * and `getById` so list and detail views stay consistent (see
 * `bulk-entity-fetch` spec: Constant-query individual list fetch).
 */
function findPrincipalLifeEvent(
  events: EventWithDetails[],
  individualId: string,
  tag: 'BIRT' | 'DEAT'
): EventWithDetails | null {
  for (const event of events) {
    if (event.eventType.tag !== tag) continue;
    const isPrincipal = event.participants.some(
      (p) => p.role === 'principal' && p.individualId === individualId
    );
    if (isPrincipal) return event;
  }
  return null;
}

/**
 * Build `IndividualWithDetails[]` from batch-fetched name and birth/death
 * event data. Shared between `getAll` and `getByIds` so both paths apply
 * the same "first BIRT/DEAT with principal participant" selection rule.
 */
function assembleIndividualsWithDetails(
  individuals: Individual[],
  primaryNames: Name[],
  allNames: Name[],
  birthDeathEvents: EventWithDetails[]
): IndividualWithDetails[] {
  const primaryNameByIndividual = new Map<string, Name>();
  for (const name of primaryNames) {
    primaryNameByIndividual.set(name.individualId, name);
  }

  const namesByIndividual = new Map<string, Name[]>();
  for (const name of allNames) {
    const list = namesByIndividual.get(name.individualId) ?? [];
    list.push(name);
    namesByIndividual.set(name.individualId, list);
  }

  const birthEventByIndividual = new Map<string, EventWithDetails>();
  const deathEventByIndividual = new Map<string, EventWithDetails>();
  for (const event of birthDeathEvents) {
    const tag = event.eventType.tag;
    if (tag !== 'BIRT' && tag !== 'DEAT') continue;

    for (const participant of event.participants) {
      if (participant.role !== 'principal' || participant.individualId === null) continue;
      const target = tag === 'BIRT' ? birthEventByIndividual : deathEventByIndividual;
      // Keep the first event encountered per individual — matches the
      // semantics of findPrincipalLifeEvent used by getById.
      if (!target.has(participant.individualId)) {
        target.set(participant.individualId, event);
      }
    }
  }

  return individuals.map((individual) => ({
    ...individual,
    primaryName: primaryNameByIndividual.get(individual.id) ?? null,
    names: namesByIndividual.get(individual.id) ?? [],
    birthEvent: birthEventByIndividual.get(individual.id) ?? null,
    deathEvent: deathEventByIndividual.get(individual.id) ?? null,
  }));
}

export class IndividualManager {
  /**
   * Create an individual with an optional primary name, alternate names, and
   * life events.
   *
   * Not wrapped in a DB transaction: `@tauri-apps/plugin-sql` checks out a
   * connection from its pool per `execute()`/`select()` call, so `BEGIN`/
   * `COMMIT` issued across separate calls aren't guaranteed to land on the
   * same connection — a concurrent query elsewhere in the app can (and does,
   * in practice) interleave and break the transaction. See
   * https://github.com/tauri-apps/plugins-workspace/issues/886. Each write
   * below commits on its own instead.
   * @returns The formatted ID of the created individual
   */
  static async create(input: CreateIndividualWithNameInput): Promise<string> {
    const individualId = await createIndividual(input);

    if (input.name) {
      await createName({ individualId, ...input.name, isPrimary: true });
    }

    await saveAlternateNames(individualId, input.alternateNames ?? [], []);
    await saveEvents(individualId, input.events ?? [], []);

    return individualId;
  }

  /**
   * Get an individual with all details: primary name, all names, birth/death events.
   */
  static async getById(id: string): Promise<IndividualWithDetails | null> {
    const individual = await getIndividualById(id);
    if (!individual) return null;

    const primaryName = await getPrimaryName(id);
    const names = await getNamesByIndividualId(id);
    const events = await getEventsByIndividualIdWithDetails(id);

    const birthEvent = findPrincipalLifeEvent(events, id, 'BIRT');
    const deathEvent = findPrincipalLifeEvent(events, id, 'DEAT');

    return {
      ...individual,
      primaryName,
      names,
      birthEvent,
      deathEvent,
    };
  }

  /**
   * Get all individuals with full details.
   * Uses a constant number of SQL queries (individuals, primary names, all
   * names, birth/death events) and assembles the result in JS, so loading
   * is independent of the number of individuals.
   */
  static async getAll(): Promise<IndividualWithDetails[]> {
    const [individuals, primaryNames, allNames, birthDeathEvents] = await Promise.all([
      getAllIndividuals(),
      getAllPrimaryNames(),
      getAllNames(),
      getAllBirthDeathEvents(),
    ]);

    return assembleIndividualsWithDetails(individuals, primaryNames, allNames, birthDeathEvents);
  }

  /**
   * Get enriched details for a specific subset of individuals.
   * Uses the same four-query batch pattern as `getAll` but filters every
   * query to the given id list, so callers that already know which
   * individuals they need (e.g. `FamilyManager.getAll` after resolving
   * `family_members`) don't pay for loading the entire people graph.
   *
   * Duplicate ids are tolerated and the result array preserves the row
   * order returned by the database; ids with no matching row are silently
   * omitted.
   */
  static async getByIds(ids: string[]): Promise<IndividualWithDetails[]> {
    if (ids.length === 0) return [];
    const uniqueIds = Array.from(new Set(ids));

    const [individuals, primaryNames, allNames, birthDeathEvents] = await Promise.all([
      getIndividualsByIds(uniqueIds),
      getPrimaryNamesForIndividuals(uniqueIds),
      getNamesForIndividuals(uniqueIds),
      getBirthDeathEventsForIndividuals(uniqueIds),
    ]);

    return assembleIndividualsWithDetails(individuals, primaryNames, allNames, birthDeathEvents);
  }

  /**
   * Update an individual's core fields, primary name, alternate names, and
   * life events. Alternate names and events are each a full desired-state
   * list: rows carrying an existing `id` are updated, rows without one are
   * created, and existing rows absent from the list are deleted — events
   * where this person is not the principal (e.g. a witnessed baptism) are
   * never touched.
   *
   * Not wrapped in a DB transaction — see the note on {@link create}. Each
   * write below commits on its own.
   */
  static async update(id: string, input: UpdatePersonInput): Promise<void> {
    await updateIndividual(id, {
      gender: input.gender,
      isLiving: input.isLiving,
      notes: input.notes,
    });

    if (input.primaryName) {
      const existingPrimary = await getPrimaryName(id);
      if (existingPrimary) {
        await updateName(existingPrimary.id, { ...input.primaryName, isPrimary: true });
      } else {
        await createName({ individualId: id, ...input.primaryName, isPrimary: true });
      }
    }

    if (input.alternateNames) {
      const existingAlternates = (await getNamesByIndividualId(id)).filter((n) => !n.isPrimary);
      await saveAlternateNames(id, input.alternateNames, existingAlternates);
    }

    if (input.events) {
      const existingPrincipalEvents = filterPrincipalEvents(
        await getEventsByIndividualIdWithDetails(id),
        id
      );
      await saveEvents(id, input.events, existingPrincipalEvents);
    }
  }

  /**
   * Delete an individual and all cascading records.
   */
  static async delete(id: string): Promise<void> {
    await deleteIndividual(id);
  }

  /**
   * Search individuals by name, enriched with details for display (e.g. the
   * Person editor's relation picker). Returns an empty list for a blank
   * query instead of matching everyone.
   */
  static async search(query: string): Promise<IndividualWithDetails[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const matches = await searchIndividuals(trimmed);
    return IndividualManager.getByIds(matches.map((m) => m.id));
  }
}
