/**
 * Entity ID utilities for converting between database integer IDs
 * and human-readable display IDs with prefixes.
 *
 * Prefix mapping:
 * - I = Individual
 * - F = Family
 * - E = Event
 * - P = Place
 * - S = Source
 * - R = Repository
 */

export type EntityPrefix = 'I' | 'F' | 'E' | 'P' | 'S' | 'R';

/**
 * Format a database integer ID to a display ID with prefix.
 * @example formatEntityId('I', 1) → 'I-0001'
 * @example formatEntityId('F', 42) → 'F-0042'
 */
export function formatEntityId(prefix: EntityPrefix, dbId: number): string {
  return `${prefix}-${String(dbId).padStart(4, '0')}`;
}

/**
 * Parse a display ID back to a database integer ID.
 * @example parseEntityId('I-0001') → 1
 * @example parseEntityId('F-0042') → 42
 * @throws Error if the format is invalid
 */
export function parseEntityId(formattedId: string): number {
  const parts = formattedId.split('-');
  if (parts.length !== 2) {
    throw new Error(`Invalid entity ID format: ${formattedId}`);
  }
  const num = parseInt(parts[1], 10);
  if (isNaN(num)) {
    throw new Error(`Invalid entity ID number: ${formattedId}`);
  }
  return num;
}

/**
 * Extract the prefix from a formatted entity ID.
 * @example getEntityPrefix('I-0001') → 'I'
 * @example getEntityPrefix('F-0042') → 'F'
 * @throws Error if the format is invalid
 */
export function getEntityPrefix(formattedId: string): string {
  const parts = formattedId.split('-');
  if (parts.length !== 2) {
    throw new Error(`Invalid entity ID format: ${formattedId}`);
  }
  return parts[0];
}
