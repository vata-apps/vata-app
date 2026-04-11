/**
 * SQLite defaults to 999 host parameters per statement
 * (SQLITE_MAX_VARIABLE_NUMBER). Bulk `IN (...)` fetches must stay below this
 * limit, so we chunk input arrays and run one statement per chunk.
 */
export const SQLITE_IN_CLAUSE_LIMIT = 900;

/**
 * Split an array into chunks of at most `size` items. Returns the input
 * array unchanged when it already fits in one chunk so single-statement
 * callers don't pay for an extra array allocation.
 */
export function chunkArray<T>(items: T[], size: number): T[][] {
  if (items.length <= size) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Build a comma-separated list of positional placeholders ($1, $2, …, $N)
 * for an `IN (...)` clause whose parameters will be passed via the
 * `plugin-sql` positional binding.
 */
export function buildInClausePlaceholders(count: number): string {
  return Array.from({ length: count }, (_, i) => `$${i + 1}`).join(', ');
}
