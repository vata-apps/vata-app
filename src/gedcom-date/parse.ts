/**
 * @vata-apps/gedcom-date - Parser
 *
 * Parses GEDCOM date strings into structured GedcomDate objects.
 * Supports GEDCOM 5.5.1 date syntax.
 */

import {
  type DateModifier,
  type DatePoint,
  type GedcomDate,
  type ParseResult,
  GEDCOM_MONTHS,
} from './types';

/**
 * Parse a GEDCOM date string into a GedcomDate object.
 *
 * Supported formats:
 * - Simple: "15 JAN 1845", "JAN 1845", "1845"
 * - With modifier: "ABT 1845", "BEF MAR 1900", "AFT 15 JAN 1845"
 * - Range: "BET 1840 AND 1845"
 * - Period: "FROM 1840 TO 1845", "FROM 1840", "TO 1845"
 *
 * @param input - GEDCOM date string
 * @returns ParseResult with parsed date or error
 */
export function parse(input: string): ParseResult {
  const original = input;
  const trimmed = input.trim().toUpperCase();

  if (!trimmed) {
    return {
      success: false,
      error: 'Empty date string',
      original,
    };
  }

  try {
    // Try to parse as range (BET ... AND ...)
    if (trimmed.startsWith('BET ')) {
      return parseRange(trimmed, original);
    }

    // Try to parse as period (FROM ... TO ...)
    if (trimmed.startsWith('FROM ') || trimmed.startsWith('TO ')) {
      return parsePeriod(trimmed, original);
    }

    // Parse as simple date (with or without modifier)
    return parseSimple(trimmed, original);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error',
      original,
    };
  }
}

/**
 * Parse a simple date with optional modifier.
 */
function parseSimple(input: string, original: string): ParseResult {
  // Check for modifier prefix — pick the first matching one (none of
  // ABT/CAL/EST/BEF/AFT is a prefix of another, so order is irrelevant).
  const modifiers: DateModifier[] = ['ABT', 'CAL', 'EST', 'BEF', 'AFT'];
  const modifier = modifiers.find((mod) => input.startsWith(mod + ' '));
  const remaining = modifier ? input.slice(modifier.length + 1).trim() : input;

  const datePoint = parseDatePoint(remaining);
  if (!datePoint) {
    return {
      success: false,
      error: `Invalid date format: ${remaining}`,
      original,
    };
  }

  return {
    success: true,
    date: {
      type: 'simple',
      date: datePoint,
      modifier,
    },
    original,
  };
}

/**
 * Parse a date range (BET ... AND ...).
 */
function parseRange(input: string, original: string): ParseResult {
  // Remove "BET " prefix
  const content = input.slice(4).trim();

  // Split by " AND "
  const andIndex = content.indexOf(' AND ');
  if (andIndex === -1) {
    return {
      success: false,
      error: 'Range date missing AND keyword',
      original,
    };
  }

  const fromStr = content.slice(0, andIndex).trim();
  const toStr = content.slice(andIndex + 5).trim();

  const from = parseDatePoint(fromStr);
  const to = parseDatePoint(toStr);

  if (!from) {
    return {
      success: false,
      error: `Invalid range start date: ${fromStr}`,
      original,
    };
  }

  if (!to) {
    return {
      success: false,
      error: `Invalid range end date: ${toStr}`,
      original,
    };
  }

  return {
    success: true,
    date: {
      type: 'range',
      from,
      to,
    },
    original,
  };
}

/**
 * Parse a date period (FROM ... TO ...).
 */
function parsePeriod(input: string, original: string): ParseResult {
  // Each branch (FROM ... TO, FROM only, TO only, neither) is self-
  // contained and returns its full ParseResult, so `from` / `to` can
  // stay as branch-local `const`s instead of outer `let`s.
  if (input.startsWith('FROM ')) {
    const content = input.slice(5).trim();
    const toIndex = content.indexOf(' TO ');

    if (toIndex !== -1) {
      // FROM ... TO ...
      const fromStr = content.slice(0, toIndex).trim();
      const toStr = content.slice(toIndex + 4).trim();

      const from = parseDatePoint(fromStr);
      if (!from) {
        return { success: false, error: `Invalid period start date: ${fromStr}`, original };
      }

      const to = parseDatePoint(toStr);
      if (!to) {
        return { success: false, error: `Invalid period end date: ${toStr}`, original };
      }

      return { success: true, date: { type: 'period', from, to }, original };
    }

    // FROM ... only
    const from = parseDatePoint(content);
    if (!from) {
      return { success: false, error: `Invalid period start date: ${content}`, original };
    }
    return { success: true, date: { type: 'period', from, to: undefined }, original };
  }

  if (input.startsWith('TO ')) {
    // TO ... only
    const content = input.slice(3).trim();
    const to = parseDatePoint(content);
    if (!to) {
      return { success: false, error: `Invalid period end date: ${content}`, original };
    }
    return { success: true, date: { type: 'period', from: undefined, to }, original };
  }

  // Neither FROM nor TO prefix — empty period.
  return { success: true, date: { type: 'period', from: undefined, to: undefined }, original };
}

/**
 * Parse a single date point (day month year, month year, or year only).
 *
 * Formats:
 * - "15 JAN 1845" (day month year)
 * - "JAN 1845" (month year)
 * - "1845" (year only)
 * - "1845-01-15" (ISO)
 * - "15/01/1845" (French dd/mm/yyyy notation)
 */
function parseDatePoint(input: string): DatePoint | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;

  // ISO: "1845-01-15"
  const isoMatch = trimmed.match(/^(\d{1,4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return buildDatePoint(
      parseYear(isoMatch[1]),
      parseNumericMonth(isoMatch[2]),
      parseDay(isoMatch[3])
    );
  }

  // French dd/mm/yyyy notation: "15/01/1845"
  const frMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/);
  if (frMatch) {
    return buildDatePoint(
      parseYear(frMatch[3]),
      parseNumericMonth(frMatch[2]),
      parseDay(frMatch[1])
    );
  }

  const parts = trimmed.split(/\s+/);

  // Year only: "1845"
  if (parts.length === 1) {
    const year = parseYear(parts[0]);
    if (year === null) return null;
    return { year };
  }

  // Month Year: "JAN 1845"
  if (parts.length === 2) {
    const month = parseMonth(parts[0]);
    const year = parseYear(parts[1]);
    if (month === null || year === null) return null;
    return { year, month };
  }

  // Day Month Year: "15 JAN 1845"
  if (parts.length === 3) {
    const day = parseDay(parts[0]);
    const month = parseMonth(parts[1]);
    const year = parseYear(parts[2]);
    if (day === null || month === null || year === null) return null;
    return { year, month, day };
  }

  return null;
}

/** `null` if any field failed to parse, otherwise the assembled `DatePoint`. */
function buildDatePoint(
  year: number | null,
  month: number | null,
  day: number | null
): DatePoint | null {
  if (year === null || month === null || day === null) return null;
  return { year, month, day };
}

/**
 * Parse year string to number. Anchored on a full match — anything
 * trailing (a slash, a dash, extra digits) means the input isn't a bare
 * year, and must be rejected rather than silently parsed to whatever
 * digits happen to lead the string (see issue #242).
 */
function parseYear(str: string): number | null {
  // Handle BC years (e.g., "500BC" or "500 BC")
  const bcMatch = str.match(/^(\d+)\s*B\.?C\.?$/i);
  if (bcMatch) {
    return -parseInt(bcMatch[1], 10);
  }

  // Dual-dated year (e.g. "1750/51" — a Julian/Gregorian split, common in
  // pre-1752 records): sort on the later (Gregorian, New Style) year.
  // Dual dating always names two *consecutive* years, so the suffix must
  // equal (year+1) mod 100 — anything else isn't a valid dual date and
  // must be rejected, not resolved to a guessed year (this also handles
  // a century boundary correctly, e.g. "1699/00" -> 1700, since 1700 mod
  // 100 is 0).
  const dualMatch = str.match(/^(\d{3,4})\/(\d{1,2})$/);
  if (dualMatch) {
    const fullYear = parseInt(dualMatch[1], 10);
    const laterYear = fullYear + 1;
    const suffix = parseInt(dualMatch[2], 10);
    return laterYear % 100 === suffix ? laterYear : null;
  }

  if (!/^\d{1,4}$/.test(str)) return null;

  return parseInt(str, 10);
}

/**
 * Parse month string to number (1-12).
 */
function parseMonth(str: string): number | null {
  const upper = str.toUpperCase();
  const index = GEDCOM_MONTHS.indexOf(upper);
  if (index === -1) return null;
  return index + 1;
}

/**
 * Parse a numeric month string (e.g. "01") to number (1-12) — the ISO and
 * French dd/mm/yyyy forms, unlike GEDCOM's own dates, spell the month as a
 * number rather than a three-letter abbreviation.
 */
function parseNumericMonth(str: string): number | null {
  if (!/^\d{1,2}$/.test(str)) return null;
  const month = parseInt(str, 10);
  if (month < 1 || month > 12) return null;
  return month;
}

/**
 * Parse day string to number (1-31). Anchored on a full match for the same
 * reason as {@link parseYear}.
 */
function parseDay(str: string): number | null {
  if (!/^\d{1,2}$/.test(str)) return null;
  const day = parseInt(str, 10);
  if (day < 1 || day > 31) return null;
  return day;
}

/**
 * Check if a parsed date is valid.
 */
export function isValidDate(date: GedcomDate): boolean {
  switch (date.type) {
    case 'simple':
      return isValidDatePoint(date.date);
    case 'range':
      return isValidDatePoint(date.from) && isValidDatePoint(date.to);
    case 'period':
      return (
        (date.from === undefined || isValidDatePoint(date.from)) &&
        (date.to === undefined || isValidDatePoint(date.to)) &&
        (date.from !== undefined || date.to !== undefined)
      );
  }
}

/**
 * Whether `year` is a leap year in the (proleptic) Gregorian calendar.
 * `Math.abs` treats BC years the same as their AD counterpart — the rule
 * itself doesn't depend on the era.
 */
function isLeapYear(year: number): boolean {
  const y = Math.abs(year);
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

/**
 * Check if a date point is valid.
 */
function isValidDatePoint(point: DatePoint): boolean {
  if (point.year < -9999 || point.year > 9999) return false;
  if (point.month !== undefined && (point.month < 1 || point.month > 12)) return false;
  if (point.day !== undefined && (point.day < 1 || point.day > 31)) return false;

  // Basic day-of-month validation
  if (point.day !== undefined && point.month !== undefined) {
    const daysInMonth = [
      31,
      isLeapYear(point.year) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
    if (point.day > daysInMonth[point.month - 1]) return false;
  }

  return true;
}
