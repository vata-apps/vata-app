/**
 * @vata-apps/gedcom-date - Types
 *
 * Type definitions for GEDCOM date parsing and formatting.
 * Supports GEDCOM 5.5.1 date syntax including modifiers,
 * ranges, periods, and partial dates.
 */

/**
 * Date modifiers indicating precision or approximation.
 * - ABT: About (approximate)
 * - CAL: Calculated
 * - EST: Estimated
 * - BEF: Before
 * - AFT: After
 */
export type DateModifier = 'ABT' | 'CAL' | 'EST' | 'BEF' | 'AFT';

/**
 * Calendar types supported in GEDCOM.
 * Default is Gregorian if not specified.
 */
export type CalendarType = 'GREGORIAN' | 'JULIAN' | 'HEBREW' | 'FRENCH_R';

/**
 * A single date point (may be partial).
 */
export interface DatePoint {
  /** Year (required for a valid date) */
  year: number;
  /** Month (1-12, optional) */
  month?: number;
  /** Day (1-31, optional) */
  day?: number;
  /** Calendar type (defaults to GREGORIAN) */
  calendar?: CalendarType;
}

/**
 * A simple date with optional modifier.
 * Examples: "15 JAN 1845", "ABT 1845", "BEF MAR 1900"
 */
export interface SimpleDate {
  type: 'simple';
  date: DatePoint;
  modifier?: DateModifier;
}

/**
 * A date range (between two dates).
 * Example: "BET 1840 AND 1845"
 */
export interface DateRange {
  type: 'range';
  from: DatePoint;
  to: DatePoint;
}

/**
 * A date period (from one date to another).
 * Example: "FROM 1840 TO 1845"
 */
export interface DatePeriod {
  type: 'period';
  from?: DatePoint;
  to?: DatePoint;
}

/**
 * Union type for all parsed date types.
 */
export type GedcomDate = SimpleDate | DateRange | DatePeriod;

/**
 * Result of parsing a date string.
 */
export interface ParseResult {
  /** Whether parsing succeeded */
  success: boolean;
  /** Parsed date (if successful) */
  date?: GedcomDate;
  /** Error message (if failed) */
  error?: string;
  /** Original input string */
  original: string;
}

/**
 * Format options for date display.
 */
export type DateFormat = 'short' | 'medium' | 'long';

/**
 * Locale options for date formatting.
 */
export type DateLocale = 'en' | 'fr';

/**
 * Month names for formatting.
 */
export const MONTH_NAMES: Record<DateLocale, string[]> = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  fr: [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ],
};

/**
 * Short month names for formatting.
 */
export const MONTH_NAMES_SHORT: Record<DateLocale, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  fr: [
    'janv.',
    'févr.',
    'mars',
    'avr.',
    'mai',
    'juin',
    'juil.',
    'août',
    'sept.',
    'oct.',
    'nov.',
    'déc.',
  ],
};

/**
 * GEDCOM month abbreviations (3 letters, uppercase).
 */
export const GEDCOM_MONTHS: string[] = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

/**
 * Modifier display strings.
 */
export const MODIFIER_DISPLAY: Record<DateLocale, Record<DateModifier, string>> = {
  en: {
    ABT: 'about',
    CAL: 'calculated',
    EST: 'estimated',
    BEF: 'before',
    AFT: 'after',
  },
  fr: {
    ABT: 'vers',
    CAL: 'calculé',
    EST: 'estimé',
    BEF: 'avant',
    AFT: 'après',
  },
};

/**
 * Short modifier display (for compact format).
 */
export const MODIFIER_DISPLAY_SHORT: Record<DateModifier, string> = {
  ABT: '~',
  CAL: '~',
  EST: '~',
  BEF: '<',
  AFT: '>',
};
