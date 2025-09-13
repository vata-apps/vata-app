import { withSystemDb } from "../connection";
import { AppSetting } from "../../types";

/**
 * Get a specific application setting by key
 * @param key - Setting key
 * @returns Promise with the setting value or null if not found
 */
export async function getSetting(key: string): Promise<string | null> {
  return withSystemDb(async (database) => {
    const result = await database.select<Array<{ value: string }>>(
      "SELECT value FROM app_settings WHERE key = ?",
      [key],
    );

    return result[0]?.value || null;
  });
}

/**
 * Get all application settings
 * @returns Promise with array of all settings
 */
export async function getAllSettings(): Promise<AppSetting[]> {
  return withSystemDb(async (database) => {
    const result = await database.select<
      Array<{
        key: string;
        value: string;
        updated_at: string;
      }>
    >("SELECT key, value, updated_at FROM app_settings ORDER BY key");

    return result.map((row) => ({
      key: row.key,
      value: row.value,
      updated_at: new Date(row.updated_at),
    }));
  });
}

/**
 * Set an application setting value
 * Creates a new setting if it doesn't exist, updates if it does
 * @param key - Setting key
 * @param value - Setting value
 * @returns Promise that resolves when setting is saved
 */
export async function setSetting(key: string, value: string): Promise<void> {
  return withSystemDb(async (database) => {
    await database.execute(
      "INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
      [key, value],
    );
  });
}

/**
 * Delete an application setting
 * @param key - Setting key to delete
 * @returns Promise that resolves when setting is deleted
 */
export async function deleteSetting(key: string): Promise<void> {
  return withSystemDb(async (database) => {
    await database.execute("DELETE FROM app_settings WHERE key = ?", [key]);
  });
}

/**
 * Check if a setting exists
 * @param key - Setting key to check
 * @returns Promise with boolean indicating if setting exists
 */
export async function settingExists(key: string): Promise<boolean> {
  return withSystemDb(async (database) => {
    const result = await database.select<Array<{ count: number }>>(
      "SELECT COUNT(*) as count FROM app_settings WHERE key = ?",
      [key],
    );

    return (result[0]?.count || 0) > 0;
  });
}
