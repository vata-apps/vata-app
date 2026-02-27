/**
 * @vata-apps/gedcom-date - Sort Date Generator
 *
 * Converts GedcomDate objects to ISO sortable strings for database storage.
 */

import { type DatePoint, type GedcomDate } from './types';

/**
 * Convert a GedcomDate to an ISO sortable string.
 *
 * The sort date is used for chronological ordering in database queries.
 * - Missing month defaults to 01
 * - Missing day defaults to 01
 * - Ranges and periods use the start date
 * - BEF/AFT modifiers are ignored for sorting (use the date as-is)
 *
 * @param date - Parsed GedcomDate object
 * @returns ISO date string (YYYY-MM-DD) or null if no valid date
 *
 * @example
 * toSortDate({ type: 'simple', date: { year: 1845, month: 1, day: 15 } })
 * // => "1845-01-15"
 *
 * @example
 * toSortDate({ type: 'simple', date: { year: 1845 } })
 * // => "1845-01-01"
 *
 * @example
 * toSortDate({ type: 'range', from: { year: 1840 }, to: { year: 1845 } })
 * // => "1840-01-01"
 */
export function toSortDate(date: GedcomDate): string | null {
  switch (date.type) {
    case 'simple':
      return datePointToSortDate(date.date);
    case 'range':
      return datePointToSortDate(date.from);
    case 'period':
      if (date.from) {
        return datePointToSortDate(date.from);
      }
      if (date.to) {
        return datePointToSortDate(date.to);
      }
      return null;
  }
}

/**
 * Convert a DatePoint to an ISO sortable string.
 */
function datePointToSortDate(point: DatePoint): string {
  const year = String(Math.abs(point.year)).padStart(4, '0');
  const month = String(point.month ?? 1).padStart(2, '0');
  const day = String(point.day ?? 1).padStart(2, '0');

  // Handle BC dates with negative sign
  if (point.year < 0) {
    return `-${year}-${month}-${day}`;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Compare two GedcomDate objects chronologically.
 *
 * @param a - First date
 * @param b - Second date
 * @returns Negative if a < b, positive if a > b, zero if equal
 *
 * @example
 * compareDates(
 *   { type: 'simple', date: { year: 1845 } },
 *   { type: 'simple', date: { year: 1850 } }
 * )
 * // => -1 (1845 comes before 1850)
 */
export function compareDates(a: GedcomDate, b: GedcomDate): number {
  const sortA = toSortDate(a);
  const sortB = toSortDate(b);

  if (sortA === null && sortB === null) return 0;
  if (sortA === null) return 1;
  if (sortB === null) return -1;

  return sortA.localeCompare(sortB);
}

/**
 * Check if date A is before date B.
 */
export function isBefore(a: GedcomDate, b: GedcomDate): boolean {
  return compareDates(a, b) < 0;
}

/**
 * Check if date A is after date B.
 */
export function isAfter(a: GedcomDate, b: GedcomDate): boolean {
  return compareDates(a, b) > 0;
}

/**
 * Get the primary year from a GedcomDate.
 * Used for quick display without full formatting.
 *
 * @param date - Parsed GedcomDate object
 * @returns Year number or null
 */
export function getYear(date: GedcomDate): number | null {
  switch (date.type) {
    case 'simple':
      return date.date.year;
    case 'range':
      return date.from.year;
    case 'period':
      return date.from?.year ?? date.to?.year ?? null;
  }
}

/**
 * Calculate age between two dates (in years).
 *
 * @param birthDate - Birth date
 * @param eventDate - Event date (or death date)
 * @returns Age in years or null if cannot be calculated
 *
 * @example
 * calculateAge(
 *   { type: 'simple', date: { year: 1845, month: 1, day: 15 } },
 *   { type: 'simple', date: { year: 1920, month: 3, day: 3 } }
 * )
 * // => 75
 */
export function calculateAge(birthDate: GedcomDate, eventDate: GedcomDate): number | null {
  const birthPoint = getDatePoint(birthDate);
  const eventPoint = getDatePoint(eventDate);

  if (!birthPoint || !eventPoint) return null;

  let age = eventPoint.year - birthPoint.year;

  // Adjust if birthday hasn't occurred yet in the event year
  if (eventPoint.month !== undefined && birthPoint.month !== undefined) {
    if (eventPoint.month < birthPoint.month) {
      age--;
    } else if (eventPoint.month === birthPoint.month) {
      if (
        eventPoint.day !== undefined &&
        birthPoint.day !== undefined &&
        eventPoint.day < birthPoint.day
      ) {
        age--;
      }
    }
  }

  return age >= 0 ? age : null;
}

/**
 * Check if the age calculation is approximate.
 * Returns true if either date has a modifier or is a range/period.
 */
export function isAgeApproximate(birthDate: GedcomDate, eventDate: GedcomDate): boolean {
  return isApproximate(birthDate) || isApproximate(eventDate);
}

/**
 * Check if a date is approximate.
 */
export function isApproximate(date: GedcomDate): boolean {
  if (date.type !== 'simple') return true;
  return date.modifier !== undefined;
}

/**
 * Get the primary DatePoint from a GedcomDate.
 */
function getDatePoint(date: GedcomDate): DatePoint | null {
  switch (date.type) {
    case 'simple':
      return date.date;
    case 'range':
      return date.from;
    case 'period':
      return date.from ?? date.to ?? null;
  }
}
