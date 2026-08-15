/**
 * Reorder `items` to match the order of `ids`, dropping any id with no
 * matching item. Used after a batch enrichment call (e.g.
 * `IndividualManager.getByIds`) that returns its results in `id` order
 * rather than the order the caller actually asked for — a paginated list
 * page needs its SQL-determined sort order preserved through enrichment.
 *
 * @example
 * const enriched = await IndividualManager.getByIds(ids); // returned in id order
 * const items = reorderById(enriched, ids); // now in the page's sort order
 */
export function reorderById<T extends { id: string }>(items: T[], ids: string[]): T[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return ids.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
}
