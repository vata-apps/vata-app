import type { IndividualWithDetails } from '$types/database';
import type { TranslateFn } from '$lib/eventTypeLabel';
import { formatNameSimple } from '$db-tree/names';
import { extractYear } from '$db-tree/person-overview';

/**
 * Two-letter monogram from a free-form display name (first letter of the
 * first word + first letter of the last word), falling back to `?`. Mirrors
 * `initialsOf` in `person-overview/to-person-ref.ts`, which works from a
 * structured `Name` instead — this variant is for callers (the Person
 * editor's relation slots and picker) that only have a plain display string.
 */
export function initialsFromDisplayName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${last}`.toUpperCase() || '?';
}

/**
 * Life dates for a relation chip or picker row: "b. 1855 – 1921", "b. 1855",
 * "d. 1921", or "" when neither year is known. Mirrors `formatLifeDates` in
 * person-overview — kept separate so the editor's display helpers work from
 * loose year values without importing a formatter out of a person-overview
 * component module. (Named `formatLifeYears`, not `formatLifespan`, to avoid
 * colliding with the unrelated GedcomDate formatter in `$/gedcom-date`.)
 */
export function formatLifeYears(bornYear?: number, deathYear?: number): string {
  if (bornYear !== undefined && deathYear !== undefined) return `b. ${bornYear} – ${deathYear}`;
  if (bornYear !== undefined) return `b. ${bornYear}`;
  if (deathYear !== undefined) return `d. ${deathYear}`;
  return '';
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
