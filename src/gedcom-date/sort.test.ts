import { describe, it, expect } from 'vitest';
import {
  toSortDate,
  compareDates,
  isBefore,
  isAfter,
  getYear,
  calculateAge,
  isApproximate,
} from './sort';
import { parse } from './parse';
import type { GedcomDate } from './types';

describe('toSortDate', () => {
  it('converts full date to ISO', () => {
    const result = parse('15 JAN 1845');
    expect(result.success).toBe(true);
    if (result.date) {
      expect(toSortDate(result.date)).toBe('1845-01-15');
    }
  });

  it('defaults missing month to 01', () => {
    const result = parse('1845');
    expect(result.success).toBe(true);
    if (result.date) {
      expect(toSortDate(result.date)).toBe('1845-01-01');
    }
  });

  it('defaults missing day to 01', () => {
    const result = parse('MAR 1845');
    expect(result.success).toBe(true);
    if (result.date) {
      expect(toSortDate(result.date)).toBe('1845-03-01');
    }
  });

  it('pads year to 4 digits', () => {
    const result = parse('500');
    expect(result.success).toBe(true);
    if (result.date) {
      expect(toSortDate(result.date)).toBe('0500-01-01');
    }
  });

  it('uses start date for ranges', () => {
    const result = parse('BET 1840 AND 1845');
    expect(result.success).toBe(true);
    if (result.date) {
      expect(toSortDate(result.date)).toBe('1840-01-01');
    }
  });

  it('uses start date for periods', () => {
    const result = parse('FROM 1840 TO 1845');
    expect(result.success).toBe(true);
    if (result.date) {
      expect(toSortDate(result.date)).toBe('1840-01-01');
    }
  });

  it('uses end date for TO only periods', () => {
    const result = parse('TO 1845');
    expect(result.success).toBe(true);
    if (result.date) {
      expect(toSortDate(result.date)).toBe('1845-01-01');
    }
  });
});

describe('compareDates', () => {
  it('returns negative when first date is earlier', () => {
    const a = parse('1840').date as GedcomDate;
    const b = parse('1845').date as GedcomDate;
    expect(compareDates(a, b)).toBeLessThan(0);
  });

  it('returns positive when first date is later', () => {
    const a = parse('1850').date as GedcomDate;
    const b = parse('1845').date as GedcomDate;
    expect(compareDates(a, b)).toBeGreaterThan(0);
  });

  it('returns zero for equal dates', () => {
    const a = parse('1845').date as GedcomDate;
    const b = parse('1845').date as GedcomDate;
    expect(compareDates(a, b)).toBe(0);
  });

  it('compares with month precision', () => {
    const a = parse('JAN 1845').date as GedcomDate;
    const b = parse('MAR 1845').date as GedcomDate;
    expect(compareDates(a, b)).toBeLessThan(0);
  });

  it('compares with day precision', () => {
    const a = parse('15 JAN 1845').date as GedcomDate;
    const b = parse('20 JAN 1845').date as GedcomDate;
    expect(compareDates(a, b)).toBeLessThan(0);
  });
});

describe('isBefore / isAfter', () => {
  it('isBefore returns true for earlier date', () => {
    const a = parse('1840').date as GedcomDate;
    const b = parse('1845').date as GedcomDate;
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(a, b)).toBe(false);
  });

  it('isAfter returns true for later date', () => {
    const a = parse('1850').date as GedcomDate;
    const b = parse('1845').date as GedcomDate;
    expect(isAfter(a, b)).toBe(true);
    expect(isBefore(a, b)).toBe(false);
  });
});

describe('getYear', () => {
  it('gets year from simple date', () => {
    const date = parse('15 JAN 1845').date as GedcomDate;
    expect(getYear(date)).toBe(1845);
  });

  it('gets year from range (start)', () => {
    const date = parse('BET 1840 AND 1845').date as GedcomDate;
    expect(getYear(date)).toBe(1840);
  });

  it('gets year from period', () => {
    const date = parse('FROM 1840 TO 1845').date as GedcomDate;
    expect(getYear(date)).toBe(1840);
  });
});

describe('calculateAge', () => {
  it('calculates exact age', () => {
    const birth = parse('15 JAN 1845').date as GedcomDate;
    const death = parse('3 MAR 1920').date as GedcomDate;
    expect(calculateAge(birth, death)).toBe(75);
  });

  it('calculates age with year only', () => {
    const birth = parse('1845').date as GedcomDate;
    const death = parse('1920').date as GedcomDate;
    expect(calculateAge(birth, death)).toBe(75);
  });

  it('adjusts for birthday not yet occurred', () => {
    const birth = parse('15 DEC 1845').date as GedcomDate;
    const death = parse('3 MAR 1920').date as GedcomDate;
    expect(calculateAge(birth, death)).toBe(74);
  });

  it('adjusts for same month, earlier day', () => {
    const birth = parse('20 JAN 1845').date as GedcomDate;
    const death = parse('15 JAN 1920').date as GedcomDate;
    expect(calculateAge(birth, death)).toBe(74);
  });

  it('returns null for negative age', () => {
    const birth = parse('1920').date as GedcomDate;
    const death = parse('1845').date as GedcomDate;
    expect(calculateAge(birth, death)).toBe(null);
  });
});

describe('isApproximate', () => {
  it('returns false for exact date', () => {
    const date = parse('15 JAN 1845').date as GedcomDate;
    expect(isApproximate(date)).toBe(false);
  });

  it('returns true for date with modifier', () => {
    const date = parse('ABT 1845').date as GedcomDate;
    expect(isApproximate(date)).toBe(true);
  });

  it('returns true for range', () => {
    const date = parse('BET 1840 AND 1845').date as GedcomDate;
    expect(isApproximate(date)).toBe(true);
  });

  it('returns true for period', () => {
    const date = parse('FROM 1840 TO 1845').date as GedcomDate;
    expect(isApproximate(date)).toBe(true);
  });
});
