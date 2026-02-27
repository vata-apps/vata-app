/**
 * @vata-apps/gedcom-date - Formatter
 *
 * Formats GedcomDate objects for display in various formats and locales.
 */

import {
  type DateFormat,
  type DateLocale,
  type DatePoint,
  type GedcomDate,
  type DateModifier,
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
  MODIFIER_DISPLAY,
  MODIFIER_DISPLAY_SHORT,
} from './types';

/**
 * Format options for date display.
 */
export interface FormatOptions {
  /** Display format: short, medium, or long */
  format?: DateFormat;
  /** Locale for month names and modifiers */
  locale?: DateLocale;
}

const DEFAULT_OPTIONS: Required<FormatOptions> = {
  format: 'medium',
  locale: 'en',
};

/**
 * Format a GedcomDate for display.
 *
 * @param date - Parsed GedcomDate object
 * @param options - Formatting options
 * @returns Formatted date string
 *
 * @example
 * formatDate({ type: 'simple', date: { year: 1845, month: 1, day: 15 } })
 * // => "15 Jan 1845" (medium format)
 *
 * @example
 * formatDate({ type: 'simple', date: { year: 1845 }, modifier: 'ABT' }, { format: 'long' })
 * // => "about 1845"
 */
export function formatDate(date: GedcomDate, options?: FormatOptions): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  switch (date.type) {
    case 'simple':
      return formatSimpleDate(date.date, date.modifier, opts);
    case 'range':
      return formatRangeDate(date.from, date.to, opts);
    case 'period':
      return formatPeriodDate(date.from, date.to, opts);
  }
}

/**
 * Format a simple date with optional modifier.
 */
function formatSimpleDate(
  point: DatePoint,
  modifier: DateModifier | undefined,
  opts: Required<FormatOptions>
): string {
  const dateStr = formatDatePoint(point, opts);

  if (!modifier) {
    return dateStr;
  }

  if (opts.format === 'short') {
    const modPrefix = MODIFIER_DISPLAY_SHORT[modifier];
    return `${modPrefix}${dateStr}`;
  }

  const modStr = MODIFIER_DISPLAY[opts.locale][modifier];
  return `${modStr} ${dateStr}`;
}

/**
 * Format a date range (BET ... AND ...).
 */
function formatRangeDate(from: DatePoint, to: DatePoint, opts: Required<FormatOptions>): string {
  const fromStr = formatDatePoint(from, opts);
  const toStr = formatDatePoint(to, opts);

  if (opts.format === 'short') {
    return `${fromStr}-${toStr}`;
  }

  if (opts.locale === 'fr') {
    return `entre ${fromStr} et ${toStr}`;
  }

  return `between ${fromStr} and ${toStr}`;
}

/**
 * Format a date period (FROM ... TO ...).
 */
function formatPeriodDate(
  from: DatePoint | undefined,
  to: DatePoint | undefined,
  opts: Required<FormatOptions>
): string {
  const fromStr = from ? formatDatePoint(from, opts) : undefined;
  const toStr = to ? formatDatePoint(to, opts) : undefined;

  if (opts.format === 'short') {
    if (fromStr && toStr) {
      return `${fromStr}-${toStr}`;
    }
    if (fromStr) {
      return `${fromStr}-`;
    }
    if (toStr) {
      return `-${toStr}`;
    }
    return '';
  }

  if (opts.locale === 'fr') {
    if (fromStr && toStr) {
      return `de ${fromStr} à ${toStr}`;
    }
    if (fromStr) {
      return `depuis ${fromStr}`;
    }
    if (toStr) {
      return `jusqu'à ${toStr}`;
    }
    return '';
  }

  // English
  if (fromStr && toStr) {
    return `from ${fromStr} to ${toStr}`;
  }
  if (fromStr) {
    return `from ${fromStr}`;
  }
  if (toStr) {
    return `to ${toStr}`;
  }
  return '';
}

/**
 * Format a single date point.
 */
function formatDatePoint(point: DatePoint, opts: Required<FormatOptions>): string {
  const { year, month, day } = point;

  switch (opts.format) {
    case 'short':
      return formatDatePointShort(year, month, day);
    case 'medium':
      return formatDatePointMedium(year, month, day, opts.locale);
    case 'long':
      return formatDatePointLong(year, month, day, opts.locale);
  }
}

/**
 * Short format: DD/MM/YYYY or MM/YYYY or YYYY
 */
function formatDatePointShort(year: number, month?: number, day?: number): string {
  if (day && month) {
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }
  if (month) {
    return `${String(month).padStart(2, '0')}/${year}`;
  }
  return String(year);
}

/**
 * Medium format: DD Mon YYYY or Mon YYYY or YYYY
 */
function formatDatePointMedium(
  year: number,
  month?: number,
  day?: number,
  locale: DateLocale = 'en'
): string {
  if (day && month) {
    const monthName = MONTH_NAMES_SHORT[locale][month - 1];
    return `${day} ${monthName} ${year}`;
  }
  if (month) {
    const monthName = MONTH_NAMES_SHORT[locale][month - 1];
    return `${monthName} ${year}`;
  }
  return String(year);
}

/**
 * Long format: Month DD, YYYY or Month YYYY or YYYY
 */
function formatDatePointLong(
  year: number,
  month?: number,
  day?: number,
  locale: DateLocale = 'en'
): string {
  if (day && month) {
    const monthName = MONTH_NAMES[locale][month - 1];
    if (locale === 'fr') {
      return `${day} ${monthName} ${year}`;
    }
    return `${monthName} ${day}, ${year}`;
  }
  if (month) {
    const monthName = MONTH_NAMES[locale][month - 1];
    return `${monthName} ${year}`;
  }
  return String(year);
}

/**
 * Format a lifespan (birth-death) for display.
 *
 * @param birth - Birth date (optional)
 * @param death - Death date (optional)
 * @param isLiving - Whether the person is still living
 * @returns Formatted lifespan string
 *
 * @example
 * formatLifespan({ type: 'simple', date: { year: 1845 } }, { type: 'simple', date: { year: 1920 } })
 * // => "1845-1920"
 *
 * @example
 * formatLifespan({ type: 'simple', date: { year: 1845 }, modifier: 'ABT' }, null, false)
 * // => "~1845-?"
 */
export function formatLifespan(
  birth: GedcomDate | null,
  death: GedcomDate | null,
  isLiving: boolean = false
): string {
  const birthYear = birth ? getDisplayYear(birth) : null;
  const deathYear = death ? getDisplayYear(death) : null;

  const birthStr = birthYear ?? '?';
  const deathStr = isLiving ? '' : (deathYear ?? '?');

  return `${birthStr}-${deathStr}`;
}

/**
 * Get the display year from a GedcomDate.
 * Adds ~ prefix for approximate dates.
 */
function getDisplayYear(date: GedcomDate): string {
  switch (date.type) {
    case 'simple': {
      const prefix = date.modifier ? '~' : '';
      return `${prefix}${date.date.year}`;
    }
    case 'range':
      return `~${date.from.year}`;
    case 'period':
      if (date.from) {
        return `~${date.from.year}`;
      }
      if (date.to) {
        return `~${date.to.year}`;
      }
      return '?';
  }
}
