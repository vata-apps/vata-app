import { describe, it, expect } from 'vitest';
import { formatDate, formatLifespan } from './format';
import { parse } from './parse';
import type { GedcomDate } from './types';

describe('formatDate', () => {
  describe('simple dates', () => {
    it('formats year only', () => {
      const result = parse('1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date)).toBe('1845');
      }
    });

    it('formats month and year (medium)', () => {
      const result = parse('JAN 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date)).toBe('Jan 1845');
      }
    });

    it('formats full date (medium)', () => {
      const result = parse('15 JAN 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date)).toBe('15 Jan 1845');
      }
    });

    it('formats full date (short)', () => {
      const result = parse('15 JAN 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date, { format: 'short' })).toBe('15/01/1845');
      }
    });

    it('formats full date (long, English)', () => {
      const result = parse('15 JAN 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date, { format: 'long' })).toBe('January 15, 1845');
      }
    });

    it('formats full date (long, French)', () => {
      const result = parse('15 JAN 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date, { format: 'long', locale: 'fr' })).toBe('15 janvier 1845');
      }
    });
  });

  describe('dates with modifiers', () => {
    it('formats ABT modifier (medium)', () => {
      const result = parse('ABT 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date)).toBe('about 1845');
      }
    });

    it('formats ABT modifier (short)', () => {
      const result = parse('ABT 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date, { format: 'short' })).toBe('~1845');
      }
    });

    it('formats BEF modifier', () => {
      const result = parse('BEF MAR 1900');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date)).toBe('before Mar 1900');
      }
    });

    it('formats AFT modifier', () => {
      const result = parse('AFT 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date)).toBe('after 1845');
      }
    });

    it('formats BEF modifier (short)', () => {
      const result = parse('BEF 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date, { format: 'short' })).toBe('<1845');
      }
    });

    it('formats AFT modifier (short)', () => {
      const result = parse('AFT 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date, { format: 'short' })).toBe('>1845');
      }
    });

    it('formats modifier in French', () => {
      const result = parse('ABT 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date, { locale: 'fr' })).toBe('vers 1845');
      }
    });
  });

  describe('date ranges', () => {
    it('formats range (medium)', () => {
      const result = parse('BET 1840 AND 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date)).toBe('between 1840 and 1845');
      }
    });

    it('formats range (short)', () => {
      const result = parse('BET 1840 AND 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date, { format: 'short' })).toBe('1840-1845');
      }
    });

    it('formats range in French', () => {
      const result = parse('BET 1840 AND 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date, { locale: 'fr' })).toBe('entre 1840 et 1845');
      }
    });
  });

  describe('date periods', () => {
    it('formats period (medium)', () => {
      const result = parse('FROM 1840 TO 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date)).toBe('from 1840 to 1845');
      }
    });

    it('formats FROM only', () => {
      const result = parse('FROM 1840');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date)).toBe('from 1840');
      }
    });

    it('formats TO only', () => {
      const result = parse('TO 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date)).toBe('to 1845');
      }
    });

    it('formats period in French', () => {
      const result = parse('FROM 1840 TO 1845');
      expect(result.success).toBe(true);
      if (result.date) {
        expect(formatDate(result.date, { locale: 'fr' })).toBe('de 1840 à 1845');
      }
    });
  });
});

describe('formatLifespan', () => {
  it('formats birth and death years', () => {
    const birth = parse('1845').date as GedcomDate;
    const death = parse('1920').date as GedcomDate;
    expect(formatLifespan(birth, death)).toBe('1845-1920');
  });

  it('formats approximate birth year', () => {
    const birth = parse('ABT 1845').date as GedcomDate;
    const death = parse('1920').date as GedcomDate;
    expect(formatLifespan(birth, death)).toBe('~1845-1920');
  });

  it('formats still living', () => {
    const birth = parse('1980').date as GedcomDate;
    expect(formatLifespan(birth, null, true)).toBe('1980-');
  });

  it('formats unknown birth', () => {
    const death = parse('1920').date as GedcomDate;
    expect(formatLifespan(null, death)).toBe('?-1920');
  });

  it('formats both unknown', () => {
    expect(formatLifespan(null, null)).toBe('?-?');
  });
});
