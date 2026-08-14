import type { IndividualWithDetails } from '$types/database';
import type { TranslateFn } from '$lib/eventTypeLabel';
import { formatNameSimple } from '$db-tree/names';
import { extractYear } from '$db-tree/person-overview';

/**
 * Splits free-typed text into given names + surname: the last word is the
 * surname, everything before it the given names — a single word has no
 * surname. Shared by every "create on the fly" picker (the Person editor's
 * relation slots, the Events tab's participant picker).
 */
export function splitDisplayName(name: string): { givenNames?: string; surname?: string } {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return { givenNames: words[0] };
  return { givenNames: words.slice(0, -1).join(' '), surname: words[words.length - 1] };
}

/** The display fields a relation slot or picker row shows for an existing individual: a name and life-event years. */
export interface PersonDisplayFields {
  displayName: string;
  bornYear?: number;
  deathYear?: number;
}

/**
 * Reduce an {@link IndividualWithDetails} to the name + life-years shown in a
 * relation chip or picker row. Shared by the Person editor's `personRef` and
 * the {@link PersonPicker}'s result mapping so both derive the same fields.
 */
export function personDisplayFields(
  individual: IndividualWithDetails,
  t: TranslateFn
): PersonDisplayFields {
  return {
    displayName: formatNameSimple(individual.primaryName) || t('table.unknownName'),
    bornYear: extractYear(individual.birthEvent) ?? undefined,
    deathYear: extractYear(individual.deathEvent) ?? undefined,
  };
}
