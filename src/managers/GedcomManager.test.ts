import { describe, it, expect } from 'vitest';

import { GedcomManager } from './GedcomManager';

describe('GedcomManager.scan', () => {
  it('counts top-level records and reports zero places', () => {
    const content = [
      '0 HEAD',
      '1 SOUR Vata',
      '0 @I1@ INDI',
      '1 NAME John /Doe/',
      '0 @I2@ INDI',
      '1 NAME Jane /Doe/',
      '0 @F1@ FAM',
      '1 HUSB @I1@',
      '1 WIFE @I2@',
      '0 @S1@ SOUR',
      '1 TITL A Source',
      '0 @R1@ REPO',
      '1 NAME An Archive',
      '0 TRLR',
    ].join('\n');

    const result = GedcomManager.scan(content);

    expect(result.individuals).toBe(2);
    expect(result.families).toBe(1);
    expect(result.sources).toBe(1);
    expect(result.repositories).toBe(1);
    expect(result.places).toBe(0);
    expect(result.errors).toEqual([]);
  });

  it('splits errors from warnings', () => {
    const content = ['0 @I1@ INDI', '1 FAMS @MISSING@', '0 INDI', '0 TRLR'].join('\n');

    const result = GedcomManager.scan(content);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.errors.some((m) => m.toLowerCase().includes('missing xref'))).toBe(true);
    expect(result.warnings.some((m) => m.toLowerCase().includes('undefined xref'))).toBe(true);
  });

  it('returns zero counts and a single error on empty content', () => {
    const result = GedcomManager.scan('');

    expect(result.individuals).toBe(0);
    expect(result.families).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
