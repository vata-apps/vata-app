/**
 * Sort a list by a string key, ascending and locale-aware, with `null`
 * keys sorted last. Decorate-sort-undecorate: the key is computed once
 * per item, so an expensive `keyOf` (e.g. `formatName`) runs O(n) times
 * rather than O(n log n) inside the comparator.
 *
 * Returns a new array; the input is not mutated. Return `null` from
 * `keyOf` for items with no sortable value (an unknown name, a missing
 * date) so they sink to the bottom regardless of the others.
 *
 * @example
 * sortByKey(people, (p) => formatName(p.primaryName).sortable || null);
 */
export function sortByKey<T>(items: T[], keyOf: (item: T) => string | null): T[] {
  return items
    .map((item) => ({ item, key: keyOf(item) }))
    .sort((a, b) => {
      if (a.key === null && b.key === null) return 0;
      if (a.key === null) return 1;
      if (b.key === null) return -1;
      return a.key.localeCompare(b.key);
    })
    .map((decorated) => decorated.item);
}
