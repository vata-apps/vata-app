import { describe, it, expect } from 'vitest';
import { formatEntityId, parseEntityId, getEntityPrefix } from './entityId';

describe('entityId', () => {
  describe('formatEntityId', () => {
    it('formats single digit ID with zero padding', () => {
      expect(formatEntityId('I', 1)).toBe('I-0001');
    });

    it('formats two digit ID with zero padding', () => {
      expect(formatEntityId('F', 42)).toBe('F-0042');
    });

    it('formats three digit ID with zero padding', () => {
      expect(formatEntityId('P', 123)).toBe('P-0123');
    });

    it('formats four digit ID without extra padding', () => {
      expect(formatEntityId('E', 9999)).toBe('E-9999');
    });

    it('formats ID over 4 digits without truncation', () => {
      expect(formatEntityId('S', 12345)).toBe('S-12345');
    });

    it('works with all entity prefixes', () => {
      expect(formatEntityId('I', 1)).toBe('I-0001');
      expect(formatEntityId('F', 1)).toBe('F-0001');
      expect(formatEntityId('E', 1)).toBe('E-0001');
      expect(formatEntityId('P', 1)).toBe('P-0001');
      expect(formatEntityId('S', 1)).toBe('S-0001');
      expect(formatEntityId('R', 1)).toBe('R-0001');
    });
  });

  describe('parseEntityId', () => {
    it('parses single digit ID', () => {
      expect(parseEntityId('I-0001')).toBe(1);
    });

    it('parses multi digit ID with leading zeros', () => {
      expect(parseEntityId('F-0042')).toBe(42);
    });

    it('parses four digit ID', () => {
      expect(parseEntityId('P-9999')).toBe(9999);
    });

    it('parses ID over 4 digits', () => {
      expect(parseEntityId('E-12345')).toBe(12345);
    });

    it('throws on missing hyphen', () => {
      expect(() => parseEntityId('I0001')).toThrow('Invalid entity ID format');
    });

    it('throws on multiple hyphens', () => {
      expect(() => parseEntityId('I-00-01')).toThrow('Invalid entity ID format');
    });

    it('throws on non-numeric ID part', () => {
      expect(() => parseEntityId('I-abcd')).toThrow('Invalid entity ID number');
    });

    it('throws on empty string', () => {
      expect(() => parseEntityId('')).toThrow('Invalid entity ID format');
    });
  });

  describe('getEntityPrefix', () => {
    it('extracts prefix from Individual ID', () => {
      expect(getEntityPrefix('I-0001')).toBe('I');
    });

    it('extracts prefix from Family ID', () => {
      expect(getEntityPrefix('F-0042')).toBe('F');
    });

    it('extracts prefix from Place ID', () => {
      expect(getEntityPrefix('P-1234')).toBe('P');
    });

    it('throws on invalid format', () => {
      expect(() => getEntityPrefix('invalid')).toThrow('Invalid entity ID format');
    });

    it('throws on empty string', () => {
      expect(() => getEntityPrefix('')).toThrow('Invalid entity ID format');
    });
  });

  describe('round-trip', () => {
    it('format then parse returns original value', () => {
      const original = 42;
      const formatted = formatEntityId('I', original);
      const parsed = parseEntityId(formatted);
      expect(parsed).toBe(original);
    });

    it('works for various IDs', () => {
      const testCases = [1, 10, 100, 1000, 9999, 10000];
      for (const id of testCases) {
        const formatted = formatEntityId('F', id);
        const parsed = parseEntityId(formatted);
        expect(parsed).toBe(id);
      }
    });
  });
});
