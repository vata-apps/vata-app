import { withTreeDbById } from "../connection";
import {
  Individual,
  CreateIndividualInput,
  UpdateIndividualInput,
} from "../../types";

/**
 * Create a new individual in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param individual - Individual data to create
 * @returns Promise with the created individual
 */
export async function createIndividual(
  treeId: string,
  individual: CreateIndividualInput,
): Promise<Individual> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.execute(
      "INSERT INTO individuals (gender) VALUES (?) RETURNING id, created_at, gender",
      [individual.gender],
    );

    const insertId = result.lastInsertId as number;

    return {
      id: insertId.toString(),
      created_at: new Date(),
      gender: individual.gender,
    };
  });
}

/**
 * Get all individuals from the specified tree database
 * @param treeId - Tree ID (as string)
 * @returns Promise with array of all individuals
 */
export async function getAllIndividuals(treeId: string): Promise<Individual[]> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        gender: "male" | "female" | "unknown";
      }>
    >(
      "SELECT id, created_at, gender FROM individuals ORDER BY created_at DESC",
    );

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      gender: row.gender,
    }));
  });
}

/**
 * Get a specific individual by ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Individual ID (as string)
 * @returns Promise with the individual or null if not found
 */
export async function getIndividualById(
  treeId: string,
  id: string,
): Promise<Individual | null> {
  return withTreeDbById(treeId, async (database) => {
    const individualId = parseInt(id, 10);
    if (isNaN(individualId)) {
      throw new Error(`Invalid individual ID: ${id}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        gender: "male" | "female" | "unknown";
      }>
    >("SELECT id, created_at, gender FROM individuals WHERE id = ?", [
      individualId,
    ]);

    if (!result[0]) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      gender: row.gender,
    };
  });
}

/**
 * Update an existing individual in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Individual ID (as string)
 * @param individual - Updated individual data
 * @returns Promise with the updated individual
 */
export async function updateIndividual(
  treeId: string,
  id: string,
  individual: UpdateIndividualInput,
): Promise<Individual> {
  return withTreeDbById(treeId, async (database) => {
    const individualId = parseInt(id, 10);
    if (isNaN(individualId)) {
      throw new Error(`Invalid individual ID: ${id}`);
    }

    const updates: string[] = [];
    const values: string[] = [];

    if (individual.gender !== undefined) {
      updates.push("gender = ?");
      values.push(individual.gender);
    }

    if (updates.length === 0) {
      // No updates, return current individual
      const current = await getIndividualById(treeId, id);
      if (!current) {
        throw new Error(`Individual with ID ${id} not found`);
      }
      return current;
    }

    values.push(individualId.toString());
    await database.execute(
      `UPDATE individuals SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const updated = await getIndividualById(treeId, id);
    if (!updated) {
      throw new Error(`Individual with ID ${id} not found after update`);
    }

    return updated;
  });
}

/**
 * Delete an individual from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Individual ID (as string)
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteIndividual(
  treeId: string,
  id: string,
): Promise<void> {
  return withTreeDbById(treeId, async (database) => {
    const individualId = parseInt(id, 10);
    if (isNaN(individualId)) {
      throw new Error(`Invalid individual ID: ${id}`);
    }

    await database.execute("DELETE FROM individuals WHERE id = ?", [
      individualId,
    ]);
  });
}
