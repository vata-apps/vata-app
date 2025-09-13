import { withTreeDbById } from "../connection";
import { Name, CreateNameInput, UpdateNameInput } from "../../types";

/**
 * Create a new name for an individual in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param name - Name data to create
 * @returns Promise with the created name
 */
export async function createName(
  treeId: string,
  name: CreateNameInput,
): Promise<Name> {
  return withTreeDbById(treeId, async (database) => {
    const individualId = parseInt(name.individual_id, 10);
    if (isNaN(individualId)) {
      throw new Error(`Invalid individual ID: ${name.individual_id}`);
    }

    const isPrimary = name.is_primary ?? false;

    // If this name is being set as primary, unset any existing primary names for this individual
    if (isPrimary) {
      await database.execute(
        "UPDATE names SET is_primary = 0 WHERE individual_id = ?",
        [individualId],
      );
    }

    const result = await database.execute(
      "INSERT INTO names (individual_id, type, first_name, last_name, is_primary) VALUES (?, ?, ?, ?, ?) RETURNING id, created_at, individual_id, type, first_name, last_name, is_primary",
      [
        individualId,
        name.type,
        name.first_name || null,
        name.last_name || null,
        isPrimary ? 1 : 0,
      ],
    );

    const insertId = result.lastInsertId as number;

    return {
      id: insertId.toString(),
      created_at: new Date(),
      individual_id: individualId.toString(),
      type: name.type,
      first_name: name.first_name || null,
      last_name: name.last_name || null,
      is_primary: isPrimary,
    };
  });
}

/**
 * Get all names from the specified tree database
 * @param treeId - Tree ID (as string)
 * @returns Promise with array of all names
 */
export async function getAllNames(treeId: string): Promise<Name[]> {
  return withTreeDbById(treeId, async (database) => {
    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        individual_id: number;
        type: "birth" | "marriage" | "nickname" | "unknown";
        first_name: string | null;
        last_name: string | null;
        is_primary: number;
      }>
    >(
      "SELECT id, created_at, individual_id, type, first_name, last_name, is_primary FROM names ORDER BY is_primary DESC, created_at",
    );

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      individual_id: row.individual_id.toString(),
      type: row.type,
      first_name: row.first_name,
      last_name: row.last_name,
      is_primary: row.is_primary === 1,
    }));
  });
}

/**
 * Get a specific name by ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Name ID (as string)
 * @returns Promise with the name or null if not found
 */
export async function getNameById(
  treeId: string,
  id: string,
): Promise<Name | null> {
  return withTreeDbById(treeId, async (database) => {
    const nameId = parseInt(id, 10);
    if (isNaN(nameId)) {
      throw new Error(`Invalid name ID: ${id}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        individual_id: number;
        type: "birth" | "marriage" | "nickname" | "unknown";
        first_name: string | null;
        last_name: string | null;
        is_primary: number;
      }>
    >(
      "SELECT id, created_at, individual_id, type, first_name, last_name, is_primary FROM names WHERE id = ?",
      [nameId],
    );

    if (!result[0]) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      individual_id: row.individual_id.toString(),
      type: row.type,
      first_name: row.first_name,
      last_name: row.last_name,
      is_primary: row.is_primary === 1,
    };
  });
}

/**
 * Get names by individual ID from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param individualId - Individual ID (as string)
 * @returns Promise with array of names for the individual
 */
export async function getNamesByIndividualId(
  treeId: string,
  individualId: string,
): Promise<Name[]> {
  return withTreeDbById(treeId, async (database) => {
    const individualIdNum = parseInt(individualId, 10);
    if (isNaN(individualIdNum)) {
      throw new Error(`Invalid individual ID: ${individualId}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        individual_id: number;
        type: "birth" | "marriage" | "nickname" | "unknown";
        first_name: string | null;
        last_name: string | null;
        is_primary: number;
      }>
    >(
      "SELECT id, created_at, individual_id, type, first_name, last_name, is_primary FROM names WHERE individual_id = ? ORDER BY is_primary DESC, created_at",
      [individualIdNum],
    );

    return result.map((row) => ({
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      individual_id: row.individual_id.toString(),
      type: row.type,
      first_name: row.first_name,
      last_name: row.last_name,
      is_primary: row.is_primary === 1,
    }));
  });
}

/**
 * Get the primary name for an individual from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param individualId - Individual ID (as string)
 * @returns Promise with the primary name or null if not found
 */
export async function getPrimaryNameByIndividualId(
  treeId: string,
  individualId: string,
): Promise<Name | null> {
  return withTreeDbById(treeId, async (database) => {
    const individualIdNum = parseInt(individualId, 10);
    if (isNaN(individualIdNum)) {
      throw new Error(`Invalid individual ID: ${individualId}`);
    }

    const result = await database.select<
      Array<{
        id: number;
        created_at: string;
        individual_id: number;
        type: "birth" | "marriage" | "nickname" | "unknown";
        first_name: string | null;
        last_name: string | null;
        is_primary: number;
      }>
    >(
      "SELECT id, created_at, individual_id, type, first_name, last_name, is_primary FROM names WHERE individual_id = ? AND is_primary = 1",
      [individualIdNum],
    );

    if (!result[0]) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id.toString(),
      created_at: new Date(row.created_at),
      individual_id: row.individual_id.toString(),
      type: row.type,
      first_name: row.first_name,
      last_name: row.last_name,
      is_primary: row.is_primary === 1,
    };
  });
}

/**
 * Update an existing name in the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Name ID (as string)
 * @param name - Updated name data
 * @returns Promise with the updated name
 */
export async function updateName(
  treeId: string,
  id: string,
  name: UpdateNameInput,
): Promise<Name> {
  return withTreeDbById(treeId, async (database) => {
    const nameId = parseInt(id, 10);
    if (isNaN(nameId)) {
      throw new Error(`Invalid name ID: ${id}`);
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (name.type !== undefined) {
      updates.push("type = ?");
      values.push(name.type);
    }
    if (name.first_name !== undefined) {
      updates.push("first_name = ?");
      values.push(name.first_name);
    }
    if (name.last_name !== undefined) {
      updates.push("last_name = ?");
      values.push(name.last_name);
    }
    if (name.is_primary !== undefined) {
      updates.push("is_primary = ?");
      values.push(name.is_primary ? 1 : 0);

      // If setting as primary, unset other primary names for this individual
      if (name.is_primary) {
        const currentName = await database.select<
          Array<{ individual_id: number }>
        >("SELECT individual_id FROM names WHERE id = ?", [nameId]);
        if (currentName[0]) {
          await database.execute(
            "UPDATE names SET is_primary = 0 WHERE individual_id = ? AND id != ?",
            [currentName[0].individual_id, nameId],
          );
        }
      }
    }

    if (updates.length === 0) {
      // No updates, return current name
      const current = await getNameById(treeId, id);
      if (!current) {
        throw new Error(`Name with ID ${id} not found`);
      }
      return current;
    }

    values.push(nameId);
    await database.execute(
      `UPDATE names SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const updated = await getNameById(treeId, id);
    if (!updated) {
      throw new Error(`Name with ID ${id} not found after update`);
    }

    return updated;
  });
}

/**
 * Delete a name from the specified tree database
 * @param treeId - Tree ID (as string)
 * @param id - Name ID (as string)
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteName(treeId: string, id: string): Promise<void> {
  return withTreeDbById(treeId, async (database) => {
    const nameId = parseInt(id, 10);
    if (isNaN(nameId)) {
      throw new Error(`Invalid name ID: ${id}`);
    }

    await database.execute("DELETE FROM names WHERE id = ?", [nameId]);
  });
}
