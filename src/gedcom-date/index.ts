/**
 * @vata-apps/gedcom-date
 *
 * GEDCOM date parsing, formatting, and comparison utilities.
 *
 * This is an in-app module designed for extraction as a standalone package.
 * Do not import from other modules outside gedcom-date and gedcom-parser.
 *
 * @example
 * import { parse, formatDate, toSortDate } from '@vata-apps/gedcom-date';
 *
 * const result = parse('ABT 15 JAN 1845');
 * if (result.success) {
 *   console.log(formatDate(result.date)); // "about 15 Jan 1845"
 *   console.log(toSortDate(result.date)); // "1845-01-15"
 * }
 */

// Types
export type {
  DateModifier,
  CalendarType,
  DatePoint,
  SimpleDate,
  DateRange,
  DatePeriod,
  GedcomDate,
  ParseResult,
  DateFormat,
  DateLocale,
} from './types';

// Constants
export {
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
  GEDCOM_MONTHS,
  MODIFIER_DISPLAY,
  MODIFIER_DISPLAY_SHORT,
} from './types';

// Parser
export { parse, isValidDate } from './parse';

// Formatter
export { formatDate, formatLifespan, type FormatOptions } from './format';

// Sort and comparison
export {
  toSortDate,
  compareDates,
  isBefore,
  isAfter,
  getYear,
  calculateAge,
  isAgeApproximate,
  isApproximate,
} from './sort';
