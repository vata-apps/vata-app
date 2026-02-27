import { describe, it, expect } from 'vitest';
import { parse, isValidDate } from './parse';

describe('parse', () => {
  describe('simple dates', () => {
    it('parses year only', () => {
      const result = parse('1845');
      expect(result.success).toBe(true);
      expect(result.date).toEqual({
        type: 'simple',
        date: { year: 1845 },
        modifier: undefined,
      });
    });

    it('parses month and year', () => {
      const result = parse('JAN 1845');
      expect(result.success).toBe(true);
      expect(result.date).toEqual({
        type: 'simple',
        date: { year: 1845, month: 1 },
        modifier: undefined,
      });
    });

    it('parses full date', () => {
      const result = parse('15 JAN 1845');
      expect(result.success).toBe(true);
      expect(result.date).toEqual({
        type: 'simple',
        date: { year: 1845, month: 1, day: 15 },
        modifier: undefined,
      });
    });

    it('is case insensitive', () => {
      const result = parse('15 jan 1845');
      expect(result.success).toBe(true);
      expect(result.date?.type).toBe('simple');
    });

    it('handles all months', () => {
      const months = [
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
      months.forEach((month, index) => {
        const result = parse(`${month} 1845`);
        expect(result.success).toBe(true);
        if (result.success && result.date?.type === 'simple') {
          expect(result.date.date.month).toBe(index + 1);
        }
      });
    });
  });

  describe('dates with modifiers', () => {
    it('parses ABT modifier', () => {
      const result = parse('ABT 1845');
      expect(result.success).toBe(true);
      expect(result.date).toEqual({
        type: 'simple',
        date: { year: 1845 },
        modifier: 'ABT',
      });
    });

    it('parses CAL modifier', () => {
      const result = parse('CAL 1845');
      expect(result.success).toBe(true);
      if (result.success && result.date?.type === 'simple') {
        expect(result.date.modifier).toBe('CAL');
      }
    });

    it('parses EST modifier', () => {
      const result = parse('EST 1845');
      expect(result.success).toBe(true);
      if (result.success && result.date?.type === 'simple') {
        expect(result.date.modifier).toBe('EST');
      }
    });

    it('parses BEF modifier', () => {
      const result = parse('BEF MAR 1900');
      expect(result.success).toBe(true);
      expect(result.date).toEqual({
        type: 'simple',
        date: { year: 1900, month: 3 },
        modifier: 'BEF',
      });
    });

    it('parses AFT modifier', () => {
      const result = parse('AFT 15 JAN 1845');
      expect(result.success).toBe(true);
      expect(result.date).toEqual({
        type: 'simple',
        date: { year: 1845, month: 1, day: 15 },
        modifier: 'AFT',
      });
    });
  });

  describe('date ranges', () => {
    it('parses BET ... AND ... with years', () => {
      const result = parse('BET 1840 AND 1845');
      expect(result.success).toBe(true);
      expect(result.date).toEqual({
        type: 'range',
        from: { year: 1840 },
        to: { year: 1845 },
      });
    });

    it('parses BET ... AND ... with full dates', () => {
      const result = parse('BET 15 JAN 1840 AND 20 MAR 1845');
      expect(result.success).toBe(true);
      expect(result.date).toEqual({
        type: 'range',
        from: { year: 1840, month: 1, day: 15 },
        to: { year: 1845, month: 3, day: 20 },
      });
    });

    it('fails without AND keyword', () => {
      const result = parse('BET 1840 1845');
      expect(result.success).toBe(false);
      expect(result.error).toContain('AND');
    });
  });

  describe('date periods', () => {
    it('parses FROM ... TO ...', () => {
      const result = parse('FROM 1840 TO 1845');
      expect(result.success).toBe(true);
      expect(result.date).toEqual({
        type: 'period',
        from: { year: 1840 },
        to: { year: 1845 },
      });
    });

    it('parses FROM only', () => {
      const result = parse('FROM 1840');
      expect(result.success).toBe(true);
      expect(result.date).toEqual({
        type: 'period',
        from: { year: 1840 },
        to: undefined,
      });
    });

    it('parses TO only', () => {
      const result = parse('TO 1845');
      expect(result.success).toBe(true);
      expect(result.date).toEqual({
        type: 'period',
        from: undefined,
        to: { year: 1845 },
      });
    });
  });

  describe('error handling', () => {
    it('fails on empty string', () => {
      const result = parse('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Empty date string');
    });

    it('fails on invalid month', () => {
      const result = parse('15 XYZ 1845');
      expect(result.success).toBe(false);
    });

    it('fails on invalid day', () => {
      const result = parse('32 JAN 1845');
      expect(result.success).toBe(false);
    });

    it('preserves original input', () => {
      const result = parse('abt 1845');
      expect(result.original).toBe('abt 1845');
    });
  });
});

describe('isValidDate', () => {
  it('validates simple date', () => {
    const result = parse('15 JAN 1845');
    expect(result.success).toBe(true);
    if (result.date) {
      expect(isValidDate(result.date)).toBe(true);
    }
  });

  it('validates range date', () => {
    const result = parse('BET 1840 AND 1845');
    expect(result.success).toBe(true);
    if (result.date) {
      expect(isValidDate(result.date)).toBe(true);
    }
  });

  it('validates period date', () => {
    const result = parse('FROM 1840 TO 1845');
    expect(result.success).toBe(true);
    if (result.date) {
      expect(isValidDate(result.date)).toBe(true);
    }
  });
});
