import { getTreeDb } from '$/db/connection';
import {
  createIndividual,
  deleteIndividual,
  getAllIndividuals,
  getIndividualById,
  getIndividualsByIds,
  updateIndividual,
} from '$db-tree/individuals';
import {
  createName,
  getAllNames,
  getAllPrimaryNames,
  getNamesByIndividualId,
  getNamesForIndividuals,
  getPrimaryName,
  getPrimaryNamesForIndividuals,
} from '$db-tree/names';
import {
  getAllBirthDeathEvents,
  getBirthDeathEventsForIndividuals,
  getEventsByIndividualIdWithDetails,
} from '$db-tree/events';
import type {
  CreateIndividualInput,
  EventWithDetails,
  Individual,
  IndividualWithDetails,
  Name,
  UpdateIndividualInput,
} from '$/types/database';

export interface CreateIndividualWithNameInput extends CreateIndividualInput {
  name?: {
    givenNames?: string;
    surname?: string;
  };
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
   * Create an individual with an optional primary name in a single transaction.
   * @returns The formatted ID of the created individual
   */
  static async create(input: CreateIndividualWithNameInput): Promise<string> {
    const db = await getTreeDb();

    await db.execute('BEGIN TRANSACTION');
    try {
      const individualId = await createIndividual(input);

      if (input.name) {
        await createName({
          individualId,
          givenNames: input.name.givenNames,
          surname: input.name.surname,
          isPrimary: true,
        });
      }

      await db.execute('COMMIT');
      return individualId;
    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }
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
   * Update an individual's core fields.
   */
  static async update(id: string, input: UpdateIndividualInput): Promise<void> {
    await updateIndividual(id, input);
  }

  /**
   * Delete an individual and all cascading records.
   */
  static async delete(id: string): Promise<void> {
    await deleteIndividual(id);
  }
}
