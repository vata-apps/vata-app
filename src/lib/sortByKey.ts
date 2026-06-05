/**
 * Sort a list by a key, locale-aware for strings and numeric for numbers,
 * with `null` keys always sorted last (regardless of `direction`, so an
 * "unknown" never displaces real data at the top of a descending sort).
 * Decorate-sort-undecorate: the key is computed once per item, so an
 * expensive `keyOf` (e.g. `formatName`) runs O(n) times rather than
 * O(n log n) inside the comparator.
 *
 * Returns a new array; the input is not mutated. Return `null` from
 * `keyOf` for items with no sortable value (an unknown name, a missing
 * date) so they sink to the bottom regardless of the others.
 *
 * @example
 * sortByKey(people, (p) => formatName(p.primaryName).sortable || null);
 * @example
 * sortByKey(people, (p) => p.birthYear, 'desc'); // newest first, undated last
 */
export function sortByKey<T>(
  items: T[],
  keyOf: (item: T) => string | number | null,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  const factor = direction === 'asc' ? 1 : -1;
  return items
    .map((item) => ({ item, key: keyOf(item) }))
    .sort((a, b) => {
      if (a.key === null && b.key === null) return 0;
      if (a.key === null) return 1;
      if (b.key === null) return -1;
      const compared =
        typeof a.key === 'number' && typeof b.key === 'number'
          ? a.key - b.key
          : String(a.key).localeCompare(String(b.key));
      return compared * factor;
    })
    .map((decorated) => decorated.item);
}
