import { getTreeDb } from '$/db/connection';
import {
  getAllIndividuals,
  getIndividualById,
  createIndividual,
  updateIndividual,
  deleteIndividual,
} from '$db-tree/individuals';
import {
  createName,
  getAllNames,
  getAllPrimaryNames,
  getNamesByIndividualId,
  getPrimaryName,
} from '$db-tree/names';
import { getAllBirthDeathEvents, getEventsByIndividualIdWithDetails } from '$db-tree/events';
import type {
  CreateIndividualInput,
  EventWithDetails,
  Name,
  UpdateIndividualInput,
  IndividualWithDetails,
} from '$/types/database';

export interface CreateIndividualWithNameInput extends CreateIndividualInput {
  name?: {
    givenNames?: string;
    surname?: string;
  };
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

    const birthEvent = events.find((e) => e.eventType.tag === 'BIRT') ?? null;
    const deathEvent = events.find((e) => e.eventType.tag === 'DEAT') ?? null;

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
        // Keep the first event encountered per individual, matching getById semantics
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
