/**
 * Database-related constants
 */
export const DB_CONSTANTS = {
  TREES_DIRECTORY: "trees",
  DB_FILE_EXTENSION: ".db",
} as const;

/**
 * Generate a sanitized filename from a tree name
 * @param name - Tree name
 * @returns Sanitized filename without extension
 */
export function sanitizeTreeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

/**
 * Generate a complete file path for a tree database
 * @param name - Tree name
 * @returns Complete file path
 */
export function generateTreeFilePath(name: string): string {
  const sanitizedName = sanitizeTreeName(name);
  return `${DB_CONSTANTS.TREES_DIRECTORY}/${sanitizedName}${DB_CONSTANTS.DB_FILE_EXTENSION}`;
}
