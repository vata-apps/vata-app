import type { Name } from '$types/database';
import { formatName } from '$db-tree/names';
import type { RelatedPerson } from '$db-tree/person-overview';
import type { PersonRefData } from './overview-types';

/** Two-letter monogram from a primary name, falling back to `?`. */
export function initialsOf(name: Name | null): string {
  const first = name?.givenNames?.trim()?.[0] ?? '';
  const last = name?.surname?.trim()?.[0] ?? '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || '?';
}

/**
 * A related individual (parent, spouse, child, ancestor, …) reduced to the
 * `PersonRef` shape. Shared by every feature that renders a `RelatedPerson`
 * (the Overview's Family section, the Ancestors chart, …).
 */
export function toPersonRef(related: RelatedPerson): PersonRefData {
  return {
    id: related.id,
    initials: initialsOf(related.primaryName),
    name: formatName(related.primaryName).full,
    bornYear: related.birthYear ?? undefined,
    deathYear: related.deathYear ?? undefined,
  };
}
