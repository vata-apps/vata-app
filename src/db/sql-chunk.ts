import type Database from '@tauri-apps/plugin-sql';

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
 *
 * Pass `offset` when the statement binds other parameters before the list —
 * the placeholders then start at `$offset + 1`, so the caller can spread the
 * chunk after its own leading parameters.
 */
export function buildInClausePlaceholders(count: number, offset = 0): string {
  return Array.from({ length: count }, (_, i) => `$${offset + i + 1}`).join(', ');
}

/**
 * Build a `(p1, p2), (p3, p4), …` VALUES fragment for a multi-row INSERT —
 * `rowCount` rows of `columnsPerRow` positional placeholders each, reusing
 * {@link buildInClausePlaceholders} for each row's slice of the parameter
 * list.
 */
function buildValuesPlaceholders(rowCount: number, columnsPerRow: number): string {
  const rows: string[] = [];
  for (let r = 0; r < rowCount; r++) {
    rows.push(`(${buildInClausePlaceholders(columnsPerRow, r * columnsPerRow)})`);
  }
  return rows.join(', ');
}

/**
 * Insert many rows via chunked multi-row `INSERT` statements — one
 * `execute()` call per chunk instead of one per row — and return the rowid
 * SQLite assigned to each input row, in the same order the rows were given.
 *
 * Relies on SQLite assigning sequential rowids within a single VALUES list:
 * after a multi-row INSERT, `lastInsertId` is the rowid of the *last* row in
 * that statement, and every row before it got the previous integer, in list
 * order (see `sqlite3_last_insert_rowid()`). That only holds because nothing
 * else writes to the table between chunks — safe for a single-writer bulk
 * load like GEDCOM import, not safe to reuse against a table with
 * concurrent writers.
 *
 * On a chunk failure (e.g. one row trips a constraint), that chunk alone is
 * retried one row at a time so a single bad row can't take its neighbors
 * down with it. A row that ultimately fails gets `undefined` in the
 * returned array at its position and is reported via `onRowError` — the
 * caller decides whether that's fatal for anything depending on the row.
 *
 * @param buildSql - Given the `VALUES (...), (...)` fragment, returns the
 *   full `INSERT INTO ...` statement text.
 * @param toParams - Flattened bind values for one row, in column order.
 */
export async function batchInsert<T>(
  db: Database,
  rows: readonly T[],
  columnsPerRow: number,
  buildSql: (valuesPlaceholders: string) => string,
  toParams: (row: T) => unknown[],
  onRowError: (row: T, error: unknown) => void
): Promise<(number | undefined)[]> {
  if (rows.length === 0) return [];
  const maxRowsPerChunk = Math.max(1, Math.floor(SQLITE_IN_CLAUSE_LIMIT / columnsPerRow));
  const ids: (number | undefined)[] = [];

  for (const chunk of chunkArray(rows as T[], maxRowsPerChunk)) {
    try {
      const sql = buildSql(buildValuesPlaceholders(chunk.length, columnsPerRow));
      const result = await db.execute(sql, chunk.flatMap(toParams));
      if (result.lastInsertId === undefined) {
        throw new Error('Batch insert did not return a lastInsertId');
      }
      const firstId = result.lastInsertId - chunk.length + 1;
      for (let i = 0; i < chunk.length; i++) ids.push(firstId + i);
    } catch {
      // Isolate the bad row(s): redo this chunk one row at a time instead
      // of losing every row in it.
      for (const row of chunk) {
        try {
          const sql = buildSql(buildValuesPlaceholders(1, columnsPerRow));
          const result = await db.execute(sql, toParams(row));
          if (result.lastInsertId === undefined) {
            throw new Error('Insert did not return a lastInsertId');
          }
          ids.push(result.lastInsertId);
        } catch (rowError) {
          onRowError(row, rowError);
          ids.push(undefined);
        }
      }
    }
  }

  return ids;
}
