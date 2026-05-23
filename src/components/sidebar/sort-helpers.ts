import type { Name } from '$types/database';
import type { EntityListSortOption } from './entity-list-panel';

/**
 * Builds a typed sort-option array from a tuple of value constants and their
 * translated label keys. Eliminates the `values.map(v => ({ value: v, label: t(keys[v]) }))`
 * ceremony repeated across every entity sidebar.
 */
export function buildSortOptions<T extends string>(
  values: ReadonlyArray<T>,
  labelKeys: Record<T, string>,
  t: (key: string) => string
): EntityListSortOption<T>[] {
  return values.map((value) => ({ value, label: t(labelKeys[value]) }));
}

/**
 * Avatar initials for a Name record: first given-name letter + first surname
 * letter, uppercased. Falls back to the nickname's first letter, then `?`.
 */
export function initialsOf(name: Name | null): string {
  if (!name) return '?';
  const given = name.givenNames?.trim().split(/\s+/)[0]?.charAt(0) ?? '';
  const surname = name.surname?.trim().charAt(0) ?? '';
  const initials = (given + surname).toUpperCase();
  if (initials) return initials;
  const nickname = name.nickname?.trim().charAt(0);
  return nickname ? nickname.toUpperCase() : '?';
}
