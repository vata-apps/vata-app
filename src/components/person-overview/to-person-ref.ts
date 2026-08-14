import { formatName } from '$db-tree/names';
import type { RelatedPerson } from '$db-tree/person-overview';
import { initialsOf } from '$lib/personSummary';
import type { PersonRefData } from './overview-types';

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
