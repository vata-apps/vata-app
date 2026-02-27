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
  let remaining = input;
  let modifier: DateModifier | undefined;

  // Check for modifier prefix
  const modifiers: DateModifier[] = ['ABT', 'CAL', 'EST', 'BEF', 'AFT'];
  for (const mod of modifiers) {
    if (remaining.startsWith(mod + ' ')) {
      modifier = mod;
      remaining = remaining.slice(mod.length + 1).trim();
      break;
    }
  }

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
  let from: DatePoint | undefined;
  let to: DatePoint | undefined;

  // Check for FROM ... TO ... pattern
  if (input.startsWith('FROM ')) {
    const content = input.slice(5).trim();
    const toIndex = content.indexOf(' TO ');

    if (toIndex !== -1) {
      // FROM ... TO ...
      const fromStr = content.slice(0, toIndex).trim();
      const toStr = content.slice(toIndex + 4).trim();

      const fromParsed = parseDatePoint(fromStr);
      if (!fromParsed) {
        return {
          success: false,
          error: `Invalid period start date: ${fromStr}`,
          original,
        };
      }
      from = fromParsed;

      const toParsed = parseDatePoint(toStr);
      if (!toParsed) {
        return {
          success: false,
          error: `Invalid period end date: ${toStr}`,
          original,
        };
      }
      to = toParsed;
    } else {
      // FROM ... only
      const fromParsed = parseDatePoint(content);
      if (!fromParsed) {
        return {
          success: false,
          error: `Invalid period start date: ${content}`,
          original,
        };
      }
      from = fromParsed;
    }
  } else if (input.startsWith('TO ')) {
    // TO ... only
    const content = input.slice(3).trim();
    const toParsed = parseDatePoint(content);
    if (!toParsed) {
      return {
        success: false,
        error: `Invalid period end date: ${content}`,
        original,
      };
    }
    to = toParsed;
  }

  return {
    success: true,
    date: {
      type: 'period',
      from,
      to,
    },
    original,
  };
}

/**
 * Parse a single date point (day month year, month year, or year only).
 *
 * Formats:
 * - "15 JAN 1845" (day month year)
 * - "JAN 1845" (month year)
 * - "1845" (year only)
 */
function parseDatePoint(input: string): DatePoint | null {
  const parts = input.trim().split(/\s+/);

  if (parts.length === 0 || parts[0] === '') {
    return null;
  }

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

/**
 * Parse year string to number.
 */
function parseYear(str: string): number | null {
  // Handle BC years (e.g., "500BC" or "500 BC")
  const bcMatch = str.match(/^(\d+)\s*B\.?C\.?$/i);
  if (bcMatch) {
    return -parseInt(bcMatch[1], 10);
  }

  const year = parseInt(str, 10);
  if (isNaN(year)) return null;

  // Reasonable year range
  if (year < -9999 || year > 9999) return null;

  return year;
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
 * Parse day string to number (1-31).
 */
function parseDay(str: string): number | null {
  const day = parseInt(str, 10);
  if (isNaN(day) || day < 1 || day > 31) return null;
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
 * Check if a date point is valid.
 */
function isValidDatePoint(point: DatePoint): boolean {
  if (point.year < -9999 || point.year > 9999) return false;
  if (point.month !== undefined && (point.month < 1 || point.month > 12)) return false;
  if (point.day !== undefined && (point.day < 1 || point.day > 31)) return false;

  // Basic day-of-month validation
  if (point.day !== undefined && point.month !== undefined) {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (point.day > daysInMonth[point.month - 1]) return false;
  }

  return true;
}
