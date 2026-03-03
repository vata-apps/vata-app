import { getTreeDb } from '$/db/connection';
import {
  getAllIndividuals,
  getIndividualById,
  createIndividual,
  updateIndividual,
  deleteIndividual,
} from '$db-tree/individuals';
import { createName, getNamesByIndividualId } from '$db-tree/names';
import { getEventsByIndividualIdWithDetails } from '$db-tree/events';
import { getPrimaryName } from '$db-tree/names';
import type {
  CreateIndividualInput,
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
   * Note: Calls getById per individual (N+1). Acceptable for local SQLite.
   */
  static async getAll(): Promise<IndividualWithDetails[]> {
    const individuals = await getAllIndividuals();
    const results: IndividualWithDetails[] = [];

    for (const individual of individuals) {
      const enriched = await IndividualManager.getById(individual.id);
      if (enriched) {
        results.push(enriched);
      }
    }

    return results;
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
