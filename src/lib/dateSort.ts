import { parse, isValidDate, toSortDate } from '@vata-apps/gedcom-date';

/**
 * Derive a sortable `date_sort` value from a raw, possibly-approximate date
 * string (e.g. "abt 1960", "30 JAN 1960"). Returns `undefined` when the date
 * is absent, unparseable, or structurally invalid (e.g. "31 FEB 1845") —
 * callers always store the original string in `date_original` regardless.
 */
export function tryParseSortDate(date: string | undefined): string | undefined {
  if (!date) return undefined;
  const parsed = parse(date);
  if (parsed.success && parsed.date && isValidDate(parsed.date)) {
    return toSortDate(parsed.date) ?? undefined;
  }
  return undefined;
}
