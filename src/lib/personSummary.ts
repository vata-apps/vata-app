import type { TranslateFn } from './eventTypeLabel';
import type { Name } from '$types/database';

export type { TranslateFn };

export interface LifeYearsInput {
  bornYear?: number;
  deathYear?: number;
}

/**
 * A person's life years, through i18n: "b. 1855 – 1921" / "b. 1855" /
 * "d. 1921" / "" when neither year is known. The one place this is computed —
 * every screen that shows a related person's dates (Overview, Ancestors
 * chart, Relations tab, the person/participant pickers) renders through this.
 *
 * See {@link formatLifeYearsCompact} for the people rail's dense range form.
 */
export function formatLifeYears(input: LifeYearsInput, t: TranslateFn): string {
  const { bornYear, deathYear } = input;

  if (bornYear !== undefined && deathYear !== undefined) {
    return t('overview.lifespan.bornAndDied', { born: bornYear, died: deathYear });
  }
  if (bornYear !== undefined) return t('overview.lifespan.born', { born: bornYear });
  if (deathYear !== undefined) return t('overview.lifespan.died', { died: deathYear });
  return '';
}

/**
 * The people rail's dense range form: "1855–1921", no b./d. words, a
 * trailing dash while `isLiving`, and "?" for a missing year. No translation
 * involved (just digits and a dash), unlike {@link formatLifeYears}.
 */
export function formatLifeYearsCompact(input: LifeYearsInput, isLiving?: boolean): string {
  const { bornYear, deathYear } = input;
  const birth = bornYear !== undefined ? String(bornYear) : '?';
  let death = deathYear !== undefined ? String(deathYear) : '?';
  if (isLiving) death = '';
  return `${birth}–${death}`;
}

/** Two-letter monogram from "first word's initial + last word's initial", falling back to "?". */
function initialsFromWords(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${last}`.toUpperCase() || '?';
}

/** Two-letter monogram from a free-form display name (e.g. a picker's typed text). */
export function initialsFromDisplayName(name: string): string {
  return initialsFromWords(name);
}

/**
 * Two-letter monogram from a primary name's structured given/surname fields.
 * Deliberately not routed through {@link initialsFromWords}: `givenNames`
 * can itself hold multiple words (e.g. "Jean Pierre"), and this takes that
 * whole field's own first character, not its first word's — a multi-word
 * given name with no surname yields one letter ("J"), not two ("JP").
 */
export function initialsOf(name: Name | null): string {
  const first = name?.givenNames?.trim()?.[0] ?? '';
  const last = name?.surname?.trim()?.[0] ?? '';
  return `${first}${last}`.toUpperCase() || '?';
}
