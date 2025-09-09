import { v4 as uuidv4 } from "uuid";
import { withTreeDb } from "./db/connection";
import {
  Individual,
  Name,
  CreateIndividualInput,
  UpdateIndividualInput,
  CreateNameInput,
  UpdateNameInput,
} from "./db/types";

export const individuals = {
  // Individuals CRUD
  async getAll(treeName: string): Promise<Individual[]> {
    return withTreeDb(treeName, async (database) => {
      return await database.select<Individual[]>(
        "SELECT id, created_at, gender, gedcom_id FROM individuals ORDER BY created_at DESC",
      );
    });
  },

  async getById(treeName: string, id: string): Promise<Individual | null> {
    return withTreeDb(treeName, async (database) => {
      const result = await database.select<Individual[]>(
        "SELECT id, created_at, gender, gedcom_id FROM individuals WHERE id = ?",
        [id],
      );

      return result[0] || null;
    });
  },

  async create(
    treeName: string,
    individual: CreateIndividualInput,
  ): Promise<Individual> {
    return withTreeDb(treeName, async (database) => {
      const id = uuidv4();
      await database.execute(
        "INSERT INTO individuals (id, gender, gedcom_id) VALUES (?, ?, ?)",
        [id, individual.gender, null],
      );

      const result = await database.select<Individual[]>(
        "SELECT id, created_at, gender, gedcom_id FROM individuals WHERE id = ?",
        [id],
      );

      return result[0];
    });
  },

  async update(
    treeName: string,
    id: string,
    individual: UpdateIndividualInput,
  ): Promise<Individual> {
    return withTreeDb(treeName, async (database) => {
      const updates: string[] = [];
      const values: (string | number | null)[] = [];

      if (individual.gender !== undefined) {
        updates.push("gender = ?");
        values.push(individual.gender);
      }

      if (updates.length === 0) {
        const existingIndividual = await this.getById(treeName, id);
        if (!existingIndividual) {
          throw new Error(`Individual with id ${id} not found`);
        }
        return existingIndividual;
      }

      values.push(id);
      await database.execute(
        `UPDATE individuals SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );

      const result = await database.select<Individual[]>(
        "SELECT id, created_at, gender, gedcom_id FROM individuals WHERE id = ?",
        [id],
      );

      if (!result[0]) {
        throw new Error(`Individual with id ${id} not found`);
      }

      return result[0];
    });
  },

  async delete(treeName: string, id: string): Promise<void> {
    return withTreeDb(treeName, async (database) => {
      await database.execute("DELETE FROM individuals WHERE id = ?", [id]);
    });
  },

  // Names CRUD
  async getNames(treeName: string, individualId: string): Promise<Name[]> {
    return withTreeDb(treeName, async (database) => {
      return await database.select<Name[]>(
        "SELECT id, created_at, individual_id, type, first_name, last_name, is_primary FROM names WHERE individual_id = ? ORDER BY is_primary DESC, created_at",
        [individualId],
      );
    });
  },

  async getPrimaryName(
    treeName: string,
    individualId: string,
  ): Promise<Name | null> {
    return withTreeDb(treeName, async (database) => {
      const result = await database.select<Name[]>(
        "SELECT id, created_at, individual_id, type, first_name, last_name, is_primary FROM names WHERE individual_id = ? AND is_primary = 1",
        [individualId],
      );

      return result[0] || null;
    });
  },

  async createName(treeName: string, name: CreateNameInput): Promise<Name> {
    return withTreeDb(treeName, async (database) => {
      const id = uuidv4();
      const isPrimary = name.isPrimary ?? false;

      // If this name is being set as primary, unset any existing primary names for this individual
      if (isPrimary) {
        await database.execute(
          "UPDATE names SET is_primary = 0 WHERE individual_id = ?",
          [name.individualId],
        );
      }

      await database.execute(
        "INSERT INTO names (id, individual_id, type, first_name, last_name, is_primary) VALUES (?, ?, ?, ?, ?, ?)",
        [
          id,
          name.individualId,
          name.type,
          name.firstName || null,
          name.lastName || null,
          isPrimary ? 1 : 0,
        ],
      );

      const result = await database.select<Name[]>(
        "SELECT id, created_at, individual_id, type, first_name, last_name, is_primary FROM names WHERE id = ?",
        [id],
      );

      return result[0];
    });
  },

  async updateName(
    treeName: string,
    id: string,
    name: UpdateNameInput,
  ): Promise<Name> {
    return withTreeDb(treeName, async (database) => {
      const updates: string[] = [];
      const values: (string | number | null)[] = [];

      if (name.type !== undefined) {
        updates.push("type = ?");
        values.push(name.type);
      }
      if (name.firstName !== undefined) {
        updates.push("first_name = ?");
        values.push(name.firstName);
      }
      if (name.lastName !== undefined) {
        updates.push("last_name = ?");
        values.push(name.lastName);
      }
      if (name.isPrimary !== undefined) {
        updates.push("is_primary = ?");
        values.push(name.isPrimary ? 1 : 0);

        // If setting as primary, unset other primary names for this individual
        if (name.isPrimary) {
          const currentName = await database.select<Name[]>(
            "SELECT individual_id FROM names WHERE id = ?",
            [id],
          );
          if (currentName[0]) {
            await database.execute(
              "UPDATE names SET is_primary = 0 WHERE individual_id = ? AND id != ?",
              [currentName[0].individual_id, id],
            );
          }
        }
      }

      if (updates.length === 0) {
        const existingName = await database.select<Name[]>(
          "SELECT id, created_at, individual_id, type, first_name, last_name, is_primary FROM names WHERE id = ?",
          [id],
        );
        if (!existingName[0]) {
          throw new Error(`Name with id ${id} not found`);
        }
        return existingName[0];
      }

      values.push(id);
      await database.execute(
        `UPDATE names SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );

      const result = await database.select<Name[]>(
        "SELECT id, created_at, individual_id, type, first_name, last_name, is_primary FROM names WHERE id = ?",
        [id],
      );

      if (!result[0]) {
        throw new Error(`Name with id ${id} not found`);
      }

      return result[0];
    });
  },

  async deleteName(treeName: string, id: string): Promise<void> {
    return withTreeDb(treeName, async (database) => {
      await database.execute("DELETE FROM names WHERE id = ?", [id]);
    });
  },

  // Helper methods
  async getAllWithNames(
    treeName: string,
  ): Promise<(Individual & { primaryName: Name | null })[]> {
    const individuals = await this.getAll(treeName);

    const individualsWithNames = await Promise.all(
      individuals.map(async (individual) => {
        const primaryName = await this.getPrimaryName(treeName, individual.id);
        return { ...individual, primaryName };
      }),
    );

    return individualsWithNames;
  },

  async getByIdWithNames(
    treeName: string,
    id: string,
  ): Promise<(Individual & { names: Name[] }) | null> {
    const individual = await this.getById(treeName, id);
    if (!individual) return null;

    const names = await this.getNames(treeName, id);
    return { ...individual, names };
  },
};
